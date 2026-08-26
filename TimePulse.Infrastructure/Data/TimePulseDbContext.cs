using Microsoft.EntityFrameworkCore;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data;

public class TimePulseDbContext : DbContext, IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public TimePulseDbContext(DbContextOptions<TimePulseDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TimePulseDbContext).Assembly);
    }
}
