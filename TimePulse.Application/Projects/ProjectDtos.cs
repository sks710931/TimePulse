namespace TimePulse.Application.Projects;

public record ProjectTeamDto(
    Guid TeamId,
    string Name,
    string? Description,
    string? ColorHex,
    int MemberCount,
    DateTime AssignedAtUtc);

public record ProjectDto(
    Guid Id,
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive,
    bool IsBillable,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc,
    IReadOnlyList<ProjectTeamDto> Teams);

public record CreateProjectRequest(
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive = true,
    bool IsBillable = true,
    IReadOnlyList<Guid>? TeamIds = null);

public record UpdateProjectRequest(
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive,
    bool IsBillable = true);

public record SetProjectTeamsRequest(
    IReadOnlyList<Guid> TeamIds);
