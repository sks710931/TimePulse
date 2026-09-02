using TimePulse.Domain.Entities;

namespace TimePulse.Domain.Repositories;

public interface IUserInvitationRepository
{
    Task<UserInvitation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<UserInvitation?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default);
    Task<UserInvitation?> GetPendingByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserInvitation>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserInvitation>> GetAllPendingAsync(CancellationToken cancellationToken = default);
    Task AddAsync(UserInvitation invitation, CancellationToken cancellationToken = default);
    Task InvalidateAllForEmailAsync(string email, CancellationToken cancellationToken = default);
    Task DeleteAsync(UserInvitation invitation, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
