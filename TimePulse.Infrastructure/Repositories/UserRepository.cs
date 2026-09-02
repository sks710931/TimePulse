using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Constants;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TimePulseDbContext _context;

    public UserRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<User?> GetByIdWithRefreshTokensAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    public async Task<User?> GetByRefreshTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Roles)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.RefreshTokens.Any(rt => rt.TokenHash == tokenHash), cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.Roles)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Email == email.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> HasOtherAdminAsync(Guid excludeUserId, CancellationToken cancellationToken = default)
    {
        return await _context.UserRoles
            .AsNoTracking()
            .AnyAsync(r => r.Role == Roles.Admin && r.UserId != excludeUserId, cancellationToken);
    }

    public async Task RemoveUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var roles = await _context.UserRoles
            .Where(r => r.UserId == userId)
            .ToListAsync(cancellationToken);

        _context.UserRoles.RemoveRange(roles);
    }

    public async Task AddUserRoleAsync(UserRole role, CancellationToken cancellationToken = default)
    {
        await _context.UserRoles.AddAsync(role, cancellationToken);
    }

    public Task DeleteAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Remove(user);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
