using TimePulse.Application.Auth;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Users;

namespace TimePulse.Application.Common.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Result<InvitationDto>> InviteUserAsync(InviteUserRequest request, Guid callerUserId, bool isCallerAdmin, CancellationToken cancellationToken = default);
    Task<Result<ValidateInvitationResponse>> ValidateInvitationAsync(string token, CancellationToken cancellationToken = default);
    Task<Result<AuthResult>> AcceptInvitationAsync(AcceptInvitationRequest request, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> UpdateUserAsync(Guid targetUserId, UpdateUserRequest request, Guid callerUserId, bool isCallerAdmin, bool isCallerManager, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> AssignRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> RemoveRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
}
