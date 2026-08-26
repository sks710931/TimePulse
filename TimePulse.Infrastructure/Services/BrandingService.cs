using TimePulse.Application.Branding;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class BrandingService : IBrandingService
{
    private readonly IBrandSettingsRepository _repository;

    public BrandingService(IBrandSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<BrandSettingsDto> GetBrandSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        return new BrandSettingsDto(
            settings.AppName,
            settings.LogoData,
            settings.LogoType,
            settings.IsCustom,
            settings.UpdatedAtUtc);
    }

    public async Task<BrandSettingsDto> UpdateBrandSettingsAsync(UpdateBrandSettingsRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        settings.Update(request.AppName, request.LogoData, request.LogoType);
        await _repository.UpdateSettingsAsync(settings, cancellationToken);

        return new BrandSettingsDto(
            settings.AppName,
            settings.LogoData,
            settings.LogoType,
            settings.IsCustom,
            settings.UpdatedAtUtc);
    }

    public async Task<BrandSettingsDto> ResetToDefaultAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        settings.ResetToDefault();
        await _repository.UpdateSettingsAsync(settings, cancellationToken);

        return new BrandSettingsDto(
            settings.AppName,
            settings.LogoData,
            settings.LogoType,
            settings.IsCustom,
            settings.UpdatedAtUtc);
    }
}
