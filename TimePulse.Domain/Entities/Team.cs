using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class Team : AggregateRoot<Guid>
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ColorHex { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }

    private readonly List<TeamMember> _members = [];
    public IReadOnlyCollection<TeamMember> Members => _members.AsReadOnly();

    private readonly List<TeamProject> _projects = [];
    public IReadOnlyCollection<TeamProject> Projects => _projects.AsReadOnly();

    private Team() { } // EF Core

    public static Team Create(string name, string? description = null, string? colorHex = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        return new Team
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            ColorHex = string.IsNullOrWhiteSpace(colorHex) ? null : colorHex.Trim(),
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };
    }

    public void Update(string name, string? description, string? colorHex)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        Name = name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        ColorHex = string.IsNullOrWhiteSpace(colorHex) ? null : colorHex.Trim();
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
