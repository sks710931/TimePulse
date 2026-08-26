using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Auth;
using TimePulse.Infrastructure.Data;
using TimePulse.Infrastructure.Repositories;
using TimePulse.Infrastructure.Services;

namespace TimePulse.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var databaseProvider = configuration["DatabaseProvider"];
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<TimePulseDbContext>(options =>
        {
            switch (databaseProvider?.ToLowerInvariant())
            {
                case "postgres":
                    options.UseNpgsql(connectionString);
                    break;
                case "mssql":
                    options.UseSqlServer(connectionString);
                    break;
                case "mysql":
                case "mariadb":
                    options.UseMySQL(connectionString!);
                    break;
                default:
                    throw new InvalidOperationException($"Unsupported database provider: {databaseProvider}");
            }
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<TimePulseDbContext>());

        // Repositories
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBrandSettingsRepository, BrandSettingsRepository>();

        // Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IBrandingService, BrandingService>();

        return services;
    }
}
