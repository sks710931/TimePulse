using TimePulse.Domain.Common;
using TimePulse.Domain.Enums;

namespace TimePulse.Domain.Entities;

public class Leave : AggregateRoot<Guid>
{
    public Guid UserId { get; private set; }
    public User? User { get; private set; }
    public DateOnly Date { get; private set; }
    public LeaveType LeaveType { get; private set; }
    public string? Reason { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    private Leave() { } // EF Core

    public static Leave Create(Guid userId, DateOnly date, LeaveType leaveType, string? reason = null)
    {
        if (userId == Guid.Empty)
        {
            throw new ArgumentException("User ID is required.", nameof(userId));
        }

        return new Leave
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = date,
            LeaveType = leaveType,
            Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };
    }

    public void Update(DateOnly date, LeaveType leaveType, string? reason)
    {
        Date = date;
        LeaveType = leaveType;
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
