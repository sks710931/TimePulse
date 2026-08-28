using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly TimePulseDbContext _context;

    public ProjectRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Project>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Projects
            .AsNoTracking()
            .Include(p => p.Teams)
                .ThenInclude(tp => tp.Team)
                    .ThenInclude(t => t!.Members)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Project>> GetProjectsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Projects
            .AsNoTracking()
            .Include(p => p.Teams)
                .ThenInclude(tp => tp.Team)
                    .ThenInclude(t => t!.Members)
            .Where(p => p.Teams.Any(tp => tp.Team != null && tp.Team.Members.Any(m => m.UserId == userId)))
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Projects
            .Include(p => p.Teams)
                .ThenInclude(tp => tp.Team)
                    .ThenInclude(t => t!.Members)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Projects.AsNoTracking().Where(p => p.Name.ToLower() == name.ToLower());
        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }
        return await query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(Project project, CancellationToken cancellationToken = default)
    {
        await _context.Projects.AddAsync(project, cancellationToken);
    }

    public Task DeleteAsync(Project project, CancellationToken cancellationToken = default)
    {
        _context.Projects.Remove(project);
        return Task.CompletedTask;
    }

    public async Task SetTeamsAsync(Guid projectId, IEnumerable<Guid> teamIds, CancellationToken cancellationToken = default)
    {
        var existing = await _context.TeamProjects
            .Where(tp => tp.ProjectId == projectId)
            .ToListAsync(cancellationToken);

        _context.TeamProjects.RemoveRange(existing);

        foreach (var teamId in teamIds.Distinct())
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
