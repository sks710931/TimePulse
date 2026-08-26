namespace TimePulse.Application.Branding;

public record BrandSettingsDto(
    string AppName,
    string? LogoData,
    string LogoType,
    bool IsCustom,
    DateTime UpdatedAtUtc);

public record UpdateBrandSettingsRequest(
    string AppName,
    string? LogoData,
    string LogoType);
