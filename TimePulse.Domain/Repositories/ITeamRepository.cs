using TimePulse.Domain.Entities;

namespace TimePulse.Domain.Repositories;

public interface ITeamRepository
{
    Task<IReadOnlyList<Team>> GetAllWithDetailsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Team>> GetTeamsByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Team?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Team?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Team team, CancellationToken cancellationToken = default);
    Task DeleteAsync(Team team, CancellationToken cancellationToken = default);
    Task SetMembersAsync(Guid teamId, IEnumerable<Guid> userIds, CancellationToken cancellationToken = default);
    Task SetProjectsAsync(Guid teamId, IEnumerable<Guid> projectIds, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
