using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class TimeEntryRepository : ITimeEntryRepository
{
    private readonly TimePulseDbContext _context;

    public TimeEntryRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<TimeEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.TimeEntries
            .Include(te => te.Project)
            .FirstOrDefaultAsync(te => te.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<TimeEntry>> GetByUserAndDateRangeAsync(
        Guid userId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken = default)
    {
        return await _context.TimeEntries
            .Include(te => te.Project)
            .Where(te => te.UserId == userId && te.StartTimeUtc >= startUtc && te.StartTimeUtc <= endUtc)
            .OrderByDescending(te => te.StartTimeUtc)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(TimeEntry entry, CancellationToken cancellationToken = default)
    {
        await _context.TimeEntries.AddAsync(entry, cancellationToken);
    }

    public Task DeleteAsync(TimeEntry entry, CancellationToken cancellationToken = default)
    {
        _context.TimeEntries.Remove(entry);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
