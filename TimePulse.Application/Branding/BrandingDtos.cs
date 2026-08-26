namespace TimePulse.Application.Branding;

public record BrandSettingsDto(
    string? AppName,
    string? LogoData,
    string LogoType,
    string? LogoDarkData,
    string LogoDarkType,
    string? PrimaryColorLight,
    string? PrimaryColorDark,
    bool IsCustom,
    DateTime UpdatedAtUtc);

public record UpdateBrandSettingsRequest(
    string? AppName,
    string? LogoData,
    string LogoType,
    string? LogoDarkData = null,
    string LogoDarkType = "Default",
    string? PrimaryColorLight = null,
    string? PrimaryColorDark = null);
