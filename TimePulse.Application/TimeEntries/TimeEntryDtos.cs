namespace TimePulse.Application.TimeEntries;

public record TimeEntryDto(
    Guid Id,
    Guid UserId,
    Guid? ProjectId,
    string? ProjectName,
    string? ProjectColorHex,
    string? ClientName,
    string Description,
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    int DurationMinutes,
    bool IsBillable,
    string? Tag,
    DateTime CreatedAtUtc);

public record CreateTimeEntryRequest(
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    string? Description = null,
    Guid? ProjectId = null,
    bool IsBillable = false,
    string? Tag = null);

public record UpdateTimeEntryRequest(
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    string? Description = null,
    Guid? ProjectId = null,
    bool IsBillable = false,
    string? Tag = null);
