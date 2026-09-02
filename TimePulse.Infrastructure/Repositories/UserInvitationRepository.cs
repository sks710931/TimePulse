using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class UserInvitationRepository : IUserInvitationRepository
{
    private readonly TimePulseDbContext _context;

    public UserInvitationRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<UserInvitation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.UserInvitations
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<UserInvitation?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.UserInvitations
            .FirstOrDefaultAsync(i => i.InvitationTokenHash == tokenHash, cancellationToken);
    }

    public async Task<UserInvitation?> GetPendingByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToLowerInvariant().Trim();
        return await _context.UserInvitations
            .Where(i => i.Email == normalizedEmail && !i.IsConsumed && i.ExpiresAtUtc > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<UserInvitation>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.UserInvitations
            .AsNoTracking()
            .OrderByDescending(i => i.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<UserInvitation>> GetAllPendingAsync(CancellationToken cancellationToken = default)
    {
        return await _context.UserInvitations
            .Where(i => !i.IsConsumed && i.ExpiresAtUtc > DateTime.UtcNow)
            .OrderByDescending(i => i.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(UserInvitation invitation, CancellationToken cancellationToken = default)
    {
        await _context.UserInvitations.AddAsync(invitation, cancellationToken);
    }

    public Task DeleteAsync(UserInvitation invitation, CancellationToken cancellationToken = default)
    {
        _context.UserInvitations.Remove(invitation);
        return Task.CompletedTask;
    }

    public async Task InvalidateAllForEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.ToLowerInvariant().Trim();
        var pending = await _context.UserInvitations
            .Where(i => i.Email == normalizedEmail && !i.IsConsumed)
            .ToListAsync(cancellationToken);

        foreach (var inv in pending)
        {
            inv.Invalidate();
        }
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
