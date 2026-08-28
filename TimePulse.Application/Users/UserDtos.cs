namespace TimePulse.Application.Users;

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    DateTime CreatedAtUtc,
    IReadOnlyList<string> Roles);

public record CreateUserRequest(
    string Email,
    string Password,
    string FullName,
    string Role);

public record AssignRoleRequest(string Role);
