using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using TimePulse.Application.Auth;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _configuration = configuration;
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
}
