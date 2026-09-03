using TimePulse.Domain.Entities;
using TimePulse.Domain.Enums;

namespace TimePulse.Infrastructure.Services;

public static class LeaveConflictHelper
{
    /// <summary>
    /// Checks if a time entry conflicts with a leave record on a given calendar date,
    /// using Option 2 (1-hour flexible boundary buffer around 1:00 PM).
    /// </summary>
    public static (bool HasConflict, string? ConflictReason) CheckConflict(
        DateTime entryStartUtc,
        DateTime entryEndUtc,
        Leave leave,
        int timezoneOffsetMinutes = 0)
    {
        // Convert UTC entry times to the user's local times
        // Note: JavaScript getTimezoneOffset returns (UTC - Local) in minutes.
        // E.g. IST (UTC+5:30) is -330 minutes. Local = UTC - (-330) = UTC + 330.
        var localStart = entryStartUtc.AddMinutes(-timezoneOffsetMinutes);
        var localEnd = entryEndUtc.AddMinutes(-timezoneOffsetMinutes);

        var leaveDate = leave.Date;
        var dayStart = leaveDate.ToDateTime(TimeOnly.MinValue);
        var dayEnd = leaveDate.ToDateTime(TimeOnly.MaxValue);

        // Check if the time entry overlaps with this leave calendar day at all
        if (localEnd <= dayStart || localStart >= dayEnd)
        {
            return (false, null);
        }

        // Clamp the entry to this specific leave day
        var entryStartOnDay = localStart > dayStart ? localStart : dayStart;
        var entryEndOnDay = localEnd < dayEnd ? localEnd : dayEnd;

        if (entryEndOnDay <= entryStartOnDay)
        {
            return (false, null);
        }

        switch (leave.LeaveType)
        {
            case LeaveType.FullDay:
                return (true, $"Full day leave on {leaveDate:yyyy-MM-dd} forbids any time entries on this date.");

            case LeaveType.FirstHalf:
                // Option 2: Work allowed from 12:00 PM onwards.
                // Forbidden period: 00:00 to 12:00 PM.
                var firstHalfCutoff = leaveDate.ToDateTime(new TimeOnly(12, 0, 0));
                if (entryStartOnDay < firstHalfCutoff)
                {
                    return (true, $"First Half leave on {leaveDate:yyyy-MM-dd} forbids work before 12:00 PM (your entry starts at {entryStartOnDay:hh\\:mm tt}). Work is allowed from 12:00 PM onwards.");
                }
                break;

            case LeaveType.SecondHalf:
                // Option 2: Work allowed until 2:00 PM.
                // Forbidden period: 2:00 PM to 23:59:59.
                var secondHalfCutoff = leaveDate.ToDateTime(new TimeOnly(14, 0, 0));
                if (entryEndOnDay > secondHalfCutoff)
                {
                    return (true, $"Second Half leave on {leaveDate:yyyy-MM-dd} forbids work after 2:00 PM (your entry ends at {entryEndOnDay:hh\\:mm tt}). Work is allowed until 2:00 PM.");
                }
                break;
        }

        return (false, null);
    }
}
