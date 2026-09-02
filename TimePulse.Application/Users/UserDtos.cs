namespace TimePulse.Application.Users;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    DateTime CreatedAtUtc,
    IReadOnlyList<string> Roles);

public record InviteUserRequest(
    string Email,
    List<string> Roles,
    List<Guid>? TeamIds = null);

public record AcceptInvitationRequest(
    string Token,
    string FullName,
    string Password,
    string ConfirmPassword);

public record ValidateInvitationResponse(
    string Email,
    IReadOnlyList<string> Roles,
    IReadOnlyList<Guid> TeamIds,
    DateTime ExpiresAtUtc);

public record InvitationDto(
    Guid Id,
    string Email,
    IReadOnlyList<string> Roles,
    IReadOnlyList<Guid> TeamIds,
    DateTime CreatedAtUtc,
    DateTime ExpiresAtUtc,
    bool IsConsumed,
    Guid InvitedByUserId);

public record UpdateUserRequest(
    string FullName,
    IReadOnlyList<string> Roles);

public record AssignRoleRequest(string Role);
