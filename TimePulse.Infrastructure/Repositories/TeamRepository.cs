using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly TimePulseDbContext _context;

    public TeamRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Team>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .AsNoTracking()
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u!.Roles)
            .Include(t => t.Projects)
                .ThenInclude(p => p.Project)
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Team>> GetTeamsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .AsNoTracking()
            .Where(t => t.Members.Any(m => m.UserId == userId))
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u!.Roles)
            .Include(t => t.Projects)
                .ThenInclude(p => p.Project)
            .OrderByDescending(t => t.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Team?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .Include(t => t.Members)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u!.Roles)
            .Include(t => t.Projects)
                .ThenInclude(p => p.Project)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Teams
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Teams.AsNoTracking().Where(t => t.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
        }
        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(Team team, CancellationToken cancellationToken = default)
    {
        await _context.Teams.AddAsync(team, cancellationToken);
    }

    public Task DeleteAsync(Team team, CancellationToken cancellationToken = default)
    {
        _context.Teams.Remove(team);
        return Task.CompletedTask;
    }

    public async Task SetMembersAsync(Guid teamId, IEnumerable<Guid> userIds, CancellationToken cancellationToken = default)
    {
        var existing = await _context.TeamMembers
            .Where(m => m.TeamId == teamId)
            .ToListAsync(cancellationToken);

        _context.TeamMembers.RemoveRange(existing);

        foreach (var userId in userIds.Distinct())
        {
            var member = TeamMember.Create(teamId, userId);
            await _context.TeamMembers.AddAsync(member, cancellationToken);
        }
    }

    public async Task SetProjectsAsync(Guid teamId, IEnumerable<Guid> projectIds, CancellationToken cancellationToken = default)
    {
        var existing = await _context.TeamProjects
            .Where(p => p.TeamId == teamId)
            .ToListAsync(cancellationToken);

        _context.TeamProjects.RemoveRange(existing);

        foreach (var projectId in projectIds.Distinct())
        {
            var teamProject = TeamProject.Create(teamId, projectId);
            await _context.TeamProjects.AddAsync(teamProject, cancellationToken);
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
