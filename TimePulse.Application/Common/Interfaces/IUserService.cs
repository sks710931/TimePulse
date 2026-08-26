using TimePulse.Application.Common.Models;
using TimePulse.Application.Users;

namespace TimePulse.Application.Common.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> AssignRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> RemoveRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
}
