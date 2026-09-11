using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TimePulse.Application.Auth;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        ITokenService tokenService,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _tokenService = tokenService;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        if (await _userRepository.ExistsAsync(request.Email, cancellationToken))
        {
            return AuthResult.Failure("A user with this email already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = User.Create(request.Email, passwordHash, request.FullName);

        await _userRepository.AddAsync(user, cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        return GenerateTokens(user);
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return AuthResult.Failure("Invalid email or password.");
        }

        return GenerateTokens(user);
    }

    public async Task<AuthResult> RefreshAsync(string? accessToken, string refreshToken, CancellationToken cancellationToken = default)
    {
        var refreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        User? user = null;

        if (!string.IsNullOrEmpty(accessToken))
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(accessToken);
            if (principal is not null)
            {
                var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userIdClaim, out var userId))
                {
                    user = await _userRepository.GetByIdWithRefreshTokensAsync(userId, cancellationToken);
                }
            }
        }

        if (user is null)
        {
            user = await _userRepository.GetByRefreshTokenHashAsync(refreshTokenHash, cancellationToken);
        }

        if (user is null)
        {
            return AuthResult.Failure("User not found or invalid token.");
        }

        var existingToken = user.RefreshTokens
            .FirstOrDefault(rt => rt.TokenHash == refreshTokenHash);

        if (existingToken is null || !existingToken.IsActive)
        {
            return AuthResult.Failure("Invalid or expired refresh token.");
        }

        // Rotate: revoke old, issue new
        user.RevokeRefreshToken(existingToken);

        var result = GenerateTokens(user);

        await _userRepository.SaveChangesAsync(cancellationToken);

        return result;
    }

    public async Task LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdWithRefreshTokensAsync(userId, cancellationToken);
        if (user is null) return;

        var refreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        var existingToken = user.RefreshTokens
            .FirstOrDefault(rt => rt.TokenHash == refreshTokenHash);

        if (existingToken is not null)
        {
            user.RevokeRefreshToken(existingToken);
        }

        await _userRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<bool>.Failure("User not found.");
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return Result<bool>.Failure("Current password is incorrect.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return Result<bool>.Failure("New password must be at least 6 characters long.");
        }

        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatePassword(newHash);

        await _userRepository.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }

    private AuthResult GenerateTokens(User user)
    {
        var accessToken = _tokenService.GenerateAccessToken(user);
        var rawRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenHash = _tokenService.HashRefreshToken(rawRefreshToken);

        var refreshTokenDays = int.Parse(
            _configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        var refreshTokenEntity = RefreshToken.Create(
            refreshTokenHash,
            user.Id,
            TimeSpan.FromDays(refreshTokenDays));

        user.AddRefreshToken(refreshTokenEntity);

        return AuthResult.Success(
            accessToken,
            rawRefreshToken,
            _tokenService.GetAccessTokenExpiration());
    }

    public async Task<Result<bool>> RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<bool>.Failure("Email address is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null)
        {
            // Return success to prevent email enumeration, but do not send email
            return Result<bool>.Success(true);
        }

        // Generate cryptographically secure token
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var tokenHash = HashToken(rawToken);

        // Invalidate any existing pending tokens for this user
        await _passwordResetTokenRepository.InvalidateAllForUserAsync(user.Id, cancellationToken);

        var resetToken = PasswordResetToken.Create(user.Id, normalizedEmail, tokenHash, expiryHours: 2);
        await _passwordResetTokenRepository.AddAsync(resetToken, cancellationToken);
        await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);

        // Construct reset link
        string baseUrl;
        if (!string.IsNullOrWhiteSpace(_configuration["App:BaseUrl"]))
        {
            baseUrl = _configuration["App:BaseUrl"]!;
        }
        else if (!string.IsNullOrWhiteSpace(_configuration["ClientUrl"]))
        {
            baseUrl = _configuration["ClientUrl"]!;
        }
        else
        {
            baseUrl = "http://localhost:5173";
        }
        baseUrl = baseUrl.TrimEnd('/');
        var resetUrl = $"{baseUrl}/reset-password?token={rawToken}";

        var emailResult = await _emailService.SendPasswordResetEmailAsync(
            user.Email,
            user.FullName,
            resetUrl,
            expiryHours: 2,
            cancellationToken);

        if (!emailResult.Succeeded)
        {
            _logger.LogError("Failed to send password reset email to {Email}: {Errors}",
                normalizedEmail, string.Join(", ", emailResult.Errors));
            return Result<bool>.Failure("Password reset email cannot be sent, contact your administrator.");
        }

        return Result<bool>.Success(true);
    }

    public async Task<Result<ValidateResetTokenResponse>> ValidateResetTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return Result<ValidateResetTokenResponse>.Failure("Reset token is required.");
        }

        var tokenHash = HashToken(token.Trim());
        var resetToken = await _passwordResetTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (resetToken is null)
        {
            return Result<ValidateResetTokenResponse>.Failure("Password reset link is invalid.");
        }

        if (resetToken.IsConsumed)
        {
            return Result<ValidateResetTokenResponse>.Failure("This password reset link has already been used. Please request a new link.");
        }

        if (resetToken.IsExpired)
        {
            return Result<ValidateResetTokenResponse>.Failure("This password reset link has expired. Please request a new link.");
        }

        return Result<ValidateResetTokenResponse>.Success(new ValidateResetTokenResponse(true, resetToken.Email, null));
    }

    public async Task<Result<bool>> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return Result<bool>.Failure("Reset token is required.");
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return Result<bool>.Failure("New password must be at least 6 characters long.");
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return Result<bool>.Failure("Passwords do not match.");
        }

        var tokenHash = HashToken(request.Token.Trim());
        var resetToken = await _passwordResetTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (resetToken is null || !resetToken.IsValid)
        {
            return Result<bool>.Failure("This password reset link is invalid or has expired.");
        }

        var user = await _userRepository.GetByIdWithRefreshTokensAsync(resetToken.UserId, cancellationToken);
        if (user is null)
        {
            return Result<bool>.Failure("User account could not be found.");
        }

        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatePassword(newHash);

        // Mark token as consumed
        resetToken.Consume();

        // Revoke all active refresh tokens for the user
        user.RevokeAllRefreshTokens();

        await _passwordResetTokenRepository.SaveChangesAsync(cancellationToken);
        await _userRepository.SaveChangesAsync(cancellationToken);

        // Send confirmation email
        string baseUrl;
        if (!string.IsNullOrWhiteSpace(_configuration["App:BaseUrl"]))
        {
            baseUrl = _configuration["App:BaseUrl"]!;
        }
        else if (!string.IsNullOrWhiteSpace(_configuration["ClientUrl"]))
        {
            baseUrl = _configuration["ClientUrl"]!;
        }
        else
        {
            baseUrl = "http://localhost:5173";
        }
        baseUrl = baseUrl.TrimEnd('/');
        var loginUrl = $"{baseUrl}/login";

        _ = _emailService.SendPasswordResetSuccessEmailAsync(
            user.Email,
            user.FullName,
            loginUrl,
            cancellationToken);

        return Result<bool>.Success(true);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
