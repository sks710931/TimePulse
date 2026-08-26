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
        return MapToDto(settings);
    }

    public async Task<BrandSettingsDto> UpdateBrandSettingsAsync(UpdateBrandSettingsRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        settings.Update(
            request.AppName,
            request.LogoData,
            request.LogoType,
            request.LogoDarkData,
            request.LogoDarkType,
            request.PrimaryColorLight,
            request.PrimaryColorDark);

        await _repository.UpdateSettingsAsync(settings, cancellationToken);
        return MapToDto(settings);
    }

    public async Task<BrandSettingsDto> ResetToDefaultAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        settings.ResetToDefault();
        await _repository.UpdateSettingsAsync(settings, cancellationToken);
        return MapToDto(settings);
    }

    private static BrandSettingsDto MapToDto(Domain.Entities.BrandSettings settings)
    {
        return new BrandSettingsDto(
            settings.AppName,
            settings.LogoData,
            settings.LogoType,
            settings.LogoDarkData,
            settings.LogoDarkType,
            settings.PrimaryColorLight,
            settings.PrimaryColorDark,
            settings.IsCustom,
            settings.UpdatedAtUtc);
    }
}
