namespace TimePulse.Application.Teams;

public record TeamMemberDto(
    Guid UserId,
    string Email,
    string FullName,
    IReadOnlyList<string> Roles,
    DateTime JoinedAtUtc);

public record TeamProjectDto(
    Guid ProjectId,
    string Name,
    string? Code,
    string? ClientName,
    string? ColorHex,
    bool IsActive,
    DateTime AssignedAtUtc);

public record TeamDto(
    Guid Id,
    string Name,
    string? Description,
    string? ColorHex,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<TeamMemberDto> Members,
    IReadOnlyList<TeamProjectDto> Projects);

public record CreateTeamRequest(
    string Name,
    string? Description,
    string? ColorHex,
    IReadOnlyList<Guid>? MemberUserIds = null,
    IReadOnlyList<Guid>? ProjectIds = null);

public record UpdateTeamRequest(
    string Name,
    string? Description,
    string? ColorHex);

public record SetTeamMembersRequest(
    IReadOnlyList<Guid> UserIds);

public record SetTeamProjectsRequest(
    IReadOnlyList<Guid> ProjectIds);
