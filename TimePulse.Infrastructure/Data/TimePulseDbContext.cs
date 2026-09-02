using Microsoft.EntityFrameworkCore;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Entities;

namespace TimePulse.Infrastructure.Data;

public class TimePulseDbContext : DbContext, IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<BrandSettings> BrandSettings => Set<BrandSettings>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<TeamProject> TeamProjects => Set<TeamProject>();
    public DbSet<UserInvitation> UserInvitations => Set<UserInvitation>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();

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
