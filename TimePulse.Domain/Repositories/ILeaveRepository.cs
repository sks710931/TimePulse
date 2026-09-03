using TimePulse.Domain.Entities;

namespace TimePulse.Domain.Repositories;

public interface ILeaveRepository
{
    Task<IReadOnlyList<Leave>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Leave>> GetForDateRangeAsync(Guid? userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
    Task<Leave?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Leave?> GetByUserAndDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Leave>> GetByUserAndDatesAsync(Guid userId, IEnumerable<DateOnly> dates, CancellationToken cancellationToken = default);
    Task AddAsync(Leave leave, CancellationToken cancellationToken = default);
    Task DeleteAsync(Leave leave, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
