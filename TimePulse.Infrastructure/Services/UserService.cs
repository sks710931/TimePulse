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

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

    public async Task<Result<UserDto>> CreateUserAsync(CreateUserRequest request, bool isCallerAdmin, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Result<UserDto>.Failure("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return Result<UserDto>.Failure("Full name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            return Result<UserDto>.Failure("Password must be at least 6 characters.");
        }

        if (string.IsNullOrWhiteSpace(request.Role) || !Roles.IsValid(request.Role))
        {
            return Result<UserDto>.Failure($"Invalid role: '{request.Role}'.");
        }

        var normalizedRole = Roles.All.First(r => r.Equals(request.Role, StringComparison.OrdinalIgnoreCase));

        // Role enforcement:
        // - Managers can only assign Employee role
        // - Admins can assign Manager or Employee role
        if (!isCallerAdmin)
        {
            if (!normalizedRole.Equals(Roles.Employee, StringComparison.OrdinalIgnoreCase))
            {
                return Result<UserDto>.Failure("Managers are only authorized to create users with the Employee role.");
            }
        }
        else
        {
            if (normalizedRole.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase))
            {
                return Result<UserDto>.Failure("Cannot create additional Admin users through this interface.");
            }
        }

        if (await _userRepository.ExistsAsync(request.Email, cancellationToken))
        {
            return Result<UserDto>.Failure("A user with this email already exists.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = User.Create(request.Email, passwordHash, request.FullName, normalizedRole);

        try
        {
            await _userRepository.AddAsync(user, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);
            return Result<UserDto>.Success(MapToDto(user));
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

    private static UserDto MapToDto(User user) =>
        new(
            user.Id,
            user.Email,
            user.FullName,
            user.CreatedAtUtc,
            user.Roles.Select(r => r.Role).ToList());
}
