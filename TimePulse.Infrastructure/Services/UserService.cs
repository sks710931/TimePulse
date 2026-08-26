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
