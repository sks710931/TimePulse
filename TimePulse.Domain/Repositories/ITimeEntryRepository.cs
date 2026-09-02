using TimePulse.Domain.Entities;

namespace TimePulse.Domain.Repositories;

public interface ITimeEntryRepository
{
    Task<TimeEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TimeEntry>> GetByUserAndDateRangeAsync(
        Guid userId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken = default);
    Task AddAsync(TimeEntry entry, CancellationToken cancellationToken = default);
    Task DeleteAsync(TimeEntry entry, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
