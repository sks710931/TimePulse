using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class LeaveRepository : ILeaveRepository
{
    private readonly TimePulseDbContext _context;

    public LeaveRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Leave>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Leaves
            .Include(l => l.User)
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.Date)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetForDateRangeAsync(
        Guid? userId,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Leaves
            .Include(l => l.User)
            .AsQueryable();

        if (userId.HasValue && userId.Value != Guid.Empty)
        {
            query = query.Where(l => l.UserId == userId.Value);
        }

        query = query.Where(l => l.Date >= startDate && l.Date <= endDate);

        return await query
            .OrderByDescending(l => l.Date)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Leave?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Leaves
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.Id == id, cancellationToken);
    }

    public async Task<Leave?> GetByUserAndDateAsync(Guid userId, DateOnly date, CancellationToken cancellationToken = default)
    {
        return await _context.Leaves
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.UserId == userId && l.Date == date, cancellationToken);
    }

    public async Task<IReadOnlyList<Leave>> GetByUserAndDatesAsync(
        Guid userId,
        IEnumerable<DateOnly> dates,
        CancellationToken cancellationToken = default)
    {
        var dateList = dates.ToList();
        return await _context.Leaves
            .Where(l => l.UserId == userId && dateList.Contains(l.Date))
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Leave leave, CancellationToken cancellationToken = default)
    {
        await _context.Leaves.AddAsync(leave, cancellationToken);
    }

    public Task DeleteAsync(Leave leave, CancellationToken cancellationToken = default)
    {
        _context.Leaves.Remove(leave);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
