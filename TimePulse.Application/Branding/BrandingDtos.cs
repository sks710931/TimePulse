namespace TimePulse.Application.Branding;

public record BrandSettingsDto(
    string? AppName,
    string? LogoData,
    string LogoType,
    string? LogoDarkData,
    string LogoDarkType,
    bool IsCustom,
    DateTime UpdatedAtUtc);

public record UpdateBrandSettingsRequest(
    string? AppName,
    string? LogoData,
    string LogoType,
    string? LogoDarkData = null,
    string LogoDarkType = "Default");
