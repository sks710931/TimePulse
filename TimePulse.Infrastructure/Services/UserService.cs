using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TimePulse.Application.Auth;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Users;
using TimePulse.Domain.Constants;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserInvitationRepository _invitationRepository;
    private readonly ITeamRepository _teamRepository;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IUserInvitationRepository invitationRepository,
        ITeamRepository teamRepository,
        IEmailService emailService,
        ITokenService tokenService,
        IConfiguration configuration,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _invitationRepository = invitationRepository;
        _teamRepository = teamRepository;
        _emailService = emailService;
        _tokenService = tokenService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IReadOnlyList<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return users.Select(MapToDto).ToList();
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        return user is null ? null : MapToDto(user);
    }

    public async Task<Result<InvitationDto>> InviteUserAsync(
        InviteUserRequest request,
        Guid callerUserId,
        bool isCallerAdmin,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<InvitationDto>.Failure("Email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (request.Roles is null || request.Roles.Count == 0)
        {
            return Result<InvitationDto>.Failure("At least one role must be assigned.");
        }

        var normalizedRoles = new List<string>();
        foreach (var role in request.Roles)
        {
            if (!Roles.IsValid(role))
            {
                return Result<InvitationDto>.Failure($"Invalid role: '{role}'.");
            }
            var norm = Roles.All.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));
            if (!normalizedRoles.Contains(norm))
            {
                normalizedRoles.Add(norm);
            }
        }

        // Role enforcement:
        // - Managers can only assign Employee role
        // - Admins can assign Manager or Employee role (cannot invite Admin)
        if (!isCallerAdmin)
        {
            if (normalizedRoles.Any(r => !r.Equals(Roles.Employee, StringComparison.OrdinalIgnoreCase)))
            {
                return Result<InvitationDto>.Failure("Managers are only authorized to invite users with the Employee role.");
            }
        }
        else
        {
            if (normalizedRoles.Any(r => r.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase)))
            {
                return Result<InvitationDto>.Failure("Cannot invite additional Admin users through this interface.");
            }
        }

        // Check if user already exists
        if (await _userRepository.ExistsAsync(normalizedEmail, cancellationToken))
        {
            return Result<InvitationDto>.Failure("A user with this email already exists.");
        }

        // Generate cryptographically secure token
        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        var tokenHash = HashToken(rawToken);

        // Invalidate any prior pending invitations for this email
        await _invitationRepository.InvalidateAllForEmailAsync(normalizedEmail, cancellationToken);

        var invitation = UserInvitation.Create(
            normalizedEmail,
            tokenHash,
            normalizedRoles,
            request.TeamIds,
            callerUserId,
            expiryHours: 48);

        try
        {
            await _invitationRepository.AddAsync(invitation, cancellationToken);
            await _invitationRepository.SaveChangesAsync(cancellationToken);

            // Construct invitation link
            var baseUrl = _configuration["App:BaseUrl"]
                ?? _configuration["ClientUrl"]
                ?? "http://localhost:5173";
            baseUrl = baseUrl.TrimEnd('/');
            var inviteUrl = $"{baseUrl}/invite/accept?token={rawToken}";

            // Send invitation email via EmailService
            var roleNames = string.Join(", ", normalizedRoles);
            var emailResult = await _emailService.SendUserInvitationEmailAsync(
                normalizedEmail,
                normalizedEmail.Split('@')[0],
                inviteUrl,
                roleNames,
                expiryHours: 48,
                cancellationToken);

            if (!emailResult.Succeeded)
            {
                _logger.LogWarning("Invitation created for {Email} but email failed to send: {Errors}",
                    normalizedEmail, string.Join(", ", emailResult.Errors));
            }

            var dto = new InvitationDto(
                invitation.Id,
                invitation.Email,
                invitation.GetRoles(),
                invitation.GetTeamIds(),
                invitation.CreatedAtUtc,
                invitation.ExpiresAtUtc,
                invitation.IsConsumed,
                invitation.InvitedByUserId);

            return Result<InvitationDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create invitation for {Email}", normalizedEmail);
            return Result<InvitationDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<ValidateInvitationResponse>> ValidateInvitationAsync(
        string token,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return Result<ValidateInvitationResponse>.Failure("Invitation token is required.");
        }

        var tokenHash = HashToken(token.Trim());
        var invitation = await _invitationRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (invitation is null)
        {
            return Result<ValidateInvitationResponse>.Failure("Invitation link is invalid.");
        }

        if (invitation.IsConsumed)
        {
            return Result<ValidateInvitationResponse>.Failure("This invitation link has already been used.");
        }

        if (invitation.IsExpired)
        {
            return Result<ValidateInvitationResponse>.Failure("This invitation link has expired. Please request a new invitation from your administrator.");
        }

        if (await _userRepository.ExistsAsync(invitation.Email, cancellationToken))
        {
            return Result<ValidateInvitationResponse>.Failure("A user with this email has already been activated.");
        }

        var response = new ValidateInvitationResponse(
            invitation.Email,
            invitation.GetRoles(),
            invitation.GetTeamIds(),
            invitation.ExpiresAtUtc);

        return Result<ValidateInvitationResponse>.Success(response);
    }

    public async Task<Result<AuthResult>> AcceptInvitationAsync(
        AcceptInvitationRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Token))
        {
            return Result<AuthResult>.Failure("Invitation token is required.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result<AuthResult>.Failure("Full name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return Result<AuthResult>.Failure("Password must be at least 6 characters.");
        }

        if (request.Password != request.ConfirmPassword)
        {
            return Result<AuthResult>.Failure("Passwords do not match.");
        }

        var tokenHash = HashToken(request.Token.Trim());
        var invitation = await _invitationRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

        if (invitation is null || !invitation.IsValid)
        {
            return Result<AuthResult>.Failure("This invitation is invalid or has expired.");
        }

        if (await _userRepository.ExistsAsync(invitation.Email, cancellationToken))
        {
            return Result<AuthResult>.Failure("A user with this email has already been activated.");
        }

        try
        {
            // 1. Create user with assigned roles
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var user = User.CreateFromInvitation(
                invitation.Email,
                passwordHash,
                request.FullName.Trim(),
                invitation.GetRoles());

            await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            // 2. Add user to assigned teams
            var teamIds = invitation.GetTeamIds();
            foreach (var teamId in teamIds)
            {
                await _teamRepository.AddMemberAsync(teamId, user.Id, cancellationToken);
            }
            if (teamIds.Count > 0)
            {
                await _teamRepository.SaveChangesAsync(cancellationToken);
            }

            // 3. Mark invitation consumed
            invitation.Consume();
            await _invitationRepository.SaveChangesAsync(cancellationToken);

            // 4. Generate login tokens for immediate auto-login
            var authResult = GenerateTokens(user);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return Result<AuthResult>.Success(authResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to accept invitation for {Email}", invitation.Email);
            return Result<AuthResult>.Failure(ex.Message);
        }
    }

    public async Task<Result<UserDto>> UpdateUserAsync(
        Guid targetUserId,
        UpdateUserRequest request,
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result<UserDto>.Failure("Full name is required.");
        }

        if (request.Roles is null || request.Roles.Count == 0)
        {
            return Result<UserDto>.Failure("User must be assigned at least one role.");
        }

        foreach (var role in request.Roles)
        {
            if (!Roles.IsValid(role))
            {
                return Result<UserDto>.Failure($"Invalid role: '{role}'.");
            }
        }

        var targetUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser is null)
        {
            return Result<UserDto>.Failure("User not found.");
        }

        var isSelfEdit = targetUserId == callerUserId;
        var callerUser = isSelfEdit ? targetUser : await _userRepository.GetByIdAsync(callerUserId, cancellationToken);

        var effectiveCallerAdmin = isCallerAdmin || callerUser?.HasRole(Roles.Admin) == true;
        var effectiveCallerManager = isCallerManager || callerUser?.HasRole(Roles.Manager) == true;

        // RBAC Permissions:
        if (effectiveCallerAdmin)
        {
            var willHaveAdmin = request.Roles.Any(r => r.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase));
            if (targetUser.HasRole(Roles.Admin) && !willHaveAdmin)
            {
                var hasOtherAdmin = await _userRepository.HasOtherAdminAsync(targetUserId, cancellationToken);
                if (!hasOtherAdmin)
                {
                    return Result<UserDto>.Failure("Cannot remove the Admin role from the only remaining system administrator.");
                }
            }
        }
        else if (effectiveCallerManager)
        {
            if (!isSelfEdit)
            {
                if (targetUser.HasRole(Roles.Admin) || targetUser.HasRole(Roles.Manager))
                {
                    return Result<UserDto>.Failure("Managers are only permitted to edit themselves and Employees.");
                }

                var hasDisallowedRole = request.Roles.Any(r =>
                    r.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase) ||
                    r.Equals(Roles.Manager, StringComparison.OrdinalIgnoreCase));

                if (hasDisallowedRole)
                {
                    return Result<UserDto>.Failure("Managers cannot assign Admin or Manager roles to other users.");
                }
            }
            else
            {
                if (request.Roles.Any(r => r.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase)))
                {
                    return Result<UserDto>.Failure("Managers cannot assign the Admin role to themselves.");
                }
            }
        }
        else
        {
            return Result<UserDto>.Failure("Unauthorized to edit users.");
        }

        try
        {
            targetUser.UpdateFullName(request.FullName);

            await _userRepository.RemoveUserRolesAsync(targetUserId, cancellationToken);
            foreach (var role in request.Roles)
            {
                var normalizedRole = Roles.All.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));
                var userRole = UserRole.Create(targetUserId, normalizedRole);
                await _userRepository.AddUserRoleAsync(userRole, cancellationToken);
            }

            await _userRepository.SaveChangesAsync(cancellationToken);

            var updatedUser = await _userRepository.GetByIdAsync(targetUserId, cancellationToken);
            return Result<UserDto>.Success(MapToDto(updatedUser!));
        }
        catch (Exception ex)
        {
            return Result<UserDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<UserDto>> AssignRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default)
    {
        if (!Roles.IsValid(role))
        {
            return Result<UserDto>.Failure($"Invalid role: '{role}'. Allowed roles are: {string.Join(", ", Roles.All)}");
        }

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<UserDto>.Failure("User not found.");
        }

        try
        {
            user.AddRole(role);
            await _userRepository.SaveChangesAsync(cancellationToken);
            return Result<UserDto>.Success(MapToDto(user));
        }
        catch (Exception ex)
        {
            return Result<UserDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<UserDto>> RemoveRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return Result<UserDto>.Failure("User not found.");
        }

        if (user.Roles.Count <= 1 && user.HasRole(role))
        {
            return Result<UserDto>.Failure("Cannot remove the last role from a user.");
        }

        try
        {
            user.RemoveRole(role);
            await _userRepository.SaveChangesAsync(cancellationToken);
            return Result<UserDto>.Success(MapToDto(user));
        }
        catch (Exception ex)
        {
            return Result<UserDto>.Failure(ex.Message);
        }
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

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static UserDto MapToDto(User user) =>
        new(
            user.Id,
            user.Email,
            user.FullName,
            user.CreatedAtUtc,
            user.Roles.Select(r => r.Role).ToList());
}
