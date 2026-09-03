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

    public async Task<(IReadOnlyList<TimeEntry> Items, int TotalCount)> GetPagedByUserAsync(
        Guid userId,
        int page,
        int pageSize,
        DateTime? startUtc = null,
        DateTime? endUtc = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.TimeEntries
            .Include(te => te.Project)
            .Where(te => te.UserId == userId);

        if (startUtc.HasValue)
            query = query.Where(te => te.StartTimeUtc >= startUtc.Value);
        if (endUtc.HasValue)
            query = query.Where(te => te.StartTimeUtc <= endUtc.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(te => te.StartTimeUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<IReadOnlyList<TimeEntry>> GetForReportAsync(
        Guid? userId,
        Guid? projectId,
        bool? isBillable,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken = default)
    {
        var query = _context.TimeEntries
            .Include(te => te.Project)
            .Include(te => te.User)
            .Where(te => te.StartTimeUtc >= startUtc && te.StartTimeUtc <= endUtc);

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            query = query.Where(te => te.UserId == userId.Value);
        }

        if (projectId.HasValue && projectId.Value != Guid.Empty)
        {
            query = query.Where(te => te.ProjectId == projectId.Value);
        }

        if (isBillable.HasValue)
        {
            query = query.Where(te => te.IsBillable == isBillable.Value);
        }

        return await query
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
