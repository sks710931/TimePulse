using TimePulse.Application.Common.Models;
using TimePulse.Application.TimeEntries;

namespace TimePulse.Application.Common.Interfaces;

public interface ITimeEntryService
{
    Task<IReadOnlyList<TimeEntryDto>> GetTimeEntriesAsync(
        Guid userId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken = default);

    Task<Result<TimeEntryDto>> CreateTimeEntryAsync(
        Guid userId,
        CreateTimeEntryRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<TimeEntryDto>> UpdateTimeEntryAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        UpdateTimeEntryRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> DeleteTimeEntryAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        CancellationToken cancellationToken = default);
}
