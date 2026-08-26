using Microsoft.Extensions.DependencyInjection;

namespace TimePulse.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register Application services, MediatR, FluentValidation, AutoMapper, etc.
        return services;
    }
}
