using Microsoft.EntityFrameworkCore;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;
using TimePulse.Infrastructure.Data;

namespace TimePulse.Infrastructure.Repositories;

public class BrandSettingsRepository : IBrandSettingsRepository
{
    private readonly TimePulseDbContext _context;

    public BrandSettingsRepository(TimePulseDbContext context)
    {
        _context = context;
    }

    public async Task<BrandSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _context.BrandSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings is null)
        {
            settings = BrandSettings.CreateDefault();
            await _context.BrandSettings.AddAsync(settings, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return settings;
    }

    public async Task UpdateSettingsAsync(BrandSettings settings, CancellationToken cancellationToken = default)
    {
        _context.BrandSettings.Update(settings);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
