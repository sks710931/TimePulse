using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class Project : AggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string? Code { get; private set; }
    public string? Description { get; private set; }
    public string? ClientName { get; private set; }
    public string? ColorHex { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    private readonly List<TeamProject> _teams = [];
    public IReadOnlyCollection<TeamProject> Teams => _teams.AsReadOnly();

    private Project() { } // EF Core

    public static Project Create(
        string name,
        string? code = null,
        string? description = null,
        string? clientName = null,
        string? colorHex = null,
        bool isActive = true)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new Project
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Code = string.IsNullOrWhiteSpace(code) ? null : code.Trim().ToUpperInvariant(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            ClientName = string.IsNullOrWhiteSpace(clientName) ? null : clientName.Trim(),
            ColorHex = string.IsNullOrWhiteSpace(colorHex) ? null : colorHex.Trim(),
            IsActive = isActive,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };
    }

    public void Update(
        string name,
        string? code,
        string? description,
        string? clientName,
        string? colorHex,
        bool isActive)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name.Trim();
        Code = string.IsNullOrWhiteSpace(code) ? null : code.Trim().ToUpperInvariant();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        ClientName = string.IsNullOrWhiteSpace(clientName) ? null : clientName.Trim();
        ColorHex = string.IsNullOrWhiteSpace(colorHex) ? null : colorHex.Trim();
        IsActive = isActive;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public void ToggleStatus()
    {
        IsActive = !IsActive;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
