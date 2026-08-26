using Microsoft.EntityFrameworkCore;
using TimePulse.Application.Common.Interfaces;

namespace TimePulse.Infrastructure.Data;

public class TimePulseDbContext : DbContext, IApplicationDbContext
{
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
