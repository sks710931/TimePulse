using TimePulse.Domain.Entities;

namespace TimePulse.Domain.Repositories;

public interface IBrandSettingsRepository
{
    Task<BrandSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task UpdateSettingsAsync(BrandSettings settings, CancellationToken cancellationToken = default);
}
