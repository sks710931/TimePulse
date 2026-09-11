using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly TimePulseDbContext _context;

    public PasswordResetTokenRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<PasswordResetToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);
    }

    public async Task InvalidateAllForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var pending = await _context.PasswordResetTokens
            .Where(t => t.UserId == userId && !t.IsConsumed)
            .ToListAsync(cancellationToken);

        foreach (var token in pending)
        {
            token.Invalidate();
        }
    }

    public async Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
    {
        await _context.PasswordResetTokens.AddAsync(token, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
