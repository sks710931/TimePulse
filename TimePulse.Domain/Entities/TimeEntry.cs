using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class TimeEntry : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public Guid? ProjectId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public DateTime StartTimeUtc { get; private set; }
    public DateTime EndTimeUtc { get; private set; }
    public int DurationMinutes { get; private set; }
    public bool IsBillable { get; private set; }
    public string? Tag { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    // Navigation properties
    public User User { get; private set; } = null!;
    public Project? Project { get; private set; }

    private TimeEntry() { }

    public static TimeEntry Create(
        Guid userId,
        DateTime startTimeUtc,
        DateTime endTimeUtc,
        string? description = null,
        Guid? projectId = null,
        bool isBillable = false,
        string? tag = null)
    {
        if (endTimeUtc < startTimeUtc)
        {
            throw new ArgumentException("End time must be greater than or equal to start time.", nameof(endTimeUtc));
        }

        var durationMinutes = (int)Math.Max(0, Math.Round((endTimeUtc - startTimeUtc).TotalMinutes));

        return new TimeEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProjectId = projectId,
            Description = (description ?? string.Empty).Trim(),
            StartTimeUtc = startTimeUtc,
            EndTimeUtc = endTimeUtc,
            DurationMinutes = durationMinutes,
            IsBillable = isBillable,
            Tag = string.IsNullOrWhiteSpace(tag) ? null : tag.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };
    }

    public void Update(
        DateTime startTimeUtc,
        DateTime endTimeUtc,
        string? description = null,
        Guid? projectId = null,
        bool isBillable = false,
        string? tag = null)
    {
        if (endTimeUtc < startTimeUtc)
        {
            throw new ArgumentException("End time must be greater than or equal to start time.", nameof(endTimeUtc));
        }

        StartTimeUtc = startTimeUtc;
        EndTimeUtc = endTimeUtc;
        DurationMinutes = (int)Math.Max(0, Math.Round((endTimeUtc - startTimeUtc).TotalMinutes));
        Description = (description ?? string.Empty).Trim();
        ProjectId = projectId;
        IsBillable = isBillable;
        Tag = string.IsNullOrWhiteSpace(tag) ? null : tag.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
