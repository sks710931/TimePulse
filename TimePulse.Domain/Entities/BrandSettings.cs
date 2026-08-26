using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class BrandSettings : AggregateRoot<Guid>
{
    public const string DefaultAppName = "TimePulse";
    public const string TypeDefault = "Default";
    public const string TypeSvg = "Svg";
    public const string TypeImage = "Image";
    public const string TypeUrl = "Url";

    public string AppName { get; private set; } = DefaultAppName;
    public string? LogoData { get; private set; }
    public string LogoType { get; private set; } = TypeDefault;
    public DateTime UpdatedAtUtc { get; private set; }

    public bool IsCustom => LogoType != TypeDefault || AppName != DefaultAppName;

    private BrandSettings() { } // EF Core

    public static BrandSettings CreateDefault()
    {
        return new BrandSettings
        {
            Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
            AppName = DefaultAppName,
            LogoData = null,
            LogoType = TypeDefault,
            UpdatedAtUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };
    }

    public void Update(string appName, string? logoData, string logoType)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(appName);

        AppName = appName.Trim();
        LogoData = string.IsNullOrWhiteSpace(logoData) ? null : logoData.Trim();
        LogoType = string.IsNullOrWhiteSpace(logoData) ? TypeDefault : logoType;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ResetToDefault()
    {
        AppName = DefaultAppName;
        LogoData = null;
        LogoType = TypeDefault;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
