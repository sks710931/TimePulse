using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;
using TimePulse.Infrastructure.Repositories;

namespace TimePulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<TimePulseDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<TimePulseDbContext>());

        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));

        return services;
    }
}
