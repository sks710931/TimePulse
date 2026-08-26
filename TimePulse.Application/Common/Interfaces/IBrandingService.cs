using TimePulse.Application.Branding;

namespace TimePulse.Application.Common.Interfaces;

public interface IBrandingService
{
    Task<BrandSettingsDto> GetBrandSettingsAsync(CancellationToken cancellationToken = default);
    Task<BrandSettingsDto> UpdateBrandSettingsAsync(UpdateBrandSettingsRequest request, CancellationToken cancellationToken = default);
    Task<BrandSettingsDto> ResetToDefaultAsync(CancellationToken cancellationToken = default);
}
