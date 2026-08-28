namespace TimePulse.Application.Projects;

public record ProjectDto(
    Guid Id,
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record CreateProjectRequest(
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive = true);

public record UpdateProjectRequest(
    string Name,
    string? Code,
    string? Description,
    string? ClientName,
    string? ColorHex,
    bool IsActive);
