using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class UserInvitation : Entity<Guid>
{
    public string Email { get; private set; } = string.Empty;
    public string InvitationTokenHash { get; private set; } = string.Empty;
    public string Roles { get; private set; } = string.Empty;
    public string? TeamIds { get; private set; }
    public Guid InvitedByUserId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public bool IsConsumed { get; private set; }
    public DateTime? ConsumedAtUtc { get; private set; }

    private UserInvitation() { } // EF Core

    public static UserInvitation Create(
        string email,
        string tokenHash,
        IEnumerable<string> roles,
        IEnumerable<Guid>? teamIds,
        Guid invitedByUserId,
        int expiryHours = 48)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);

        return new UserInvitation
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant().Trim(),
            InvitationTokenHash = tokenHash,
            Roles = string.Join(",", roles),
            TeamIds = teamIds != null ? string.Join(",", teamIds) : null,
            InvitedByUserId = invitedByUserId,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(expiryHours),
            IsConsumed = false,
            ConsumedAtUtc = null
        };
    }

    public bool IsExpired => DateTime.UtcNow > ExpiresAtUtc;

    public bool IsValid => !IsConsumed && !IsExpired;

    public void Consume()
    {
        IsConsumed = true;
        ConsumedAtUtc = DateTime.UtcNow;
    }

    public void Invalidate()
    {
        IsConsumed = true;
        ConsumedAtUtc = DateTime.UtcNow;
    }

    public IReadOnlyList<string> GetRoles() =>
        Roles.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

    public IReadOnlyList<Guid> GetTeamIds()
    {
        if (string.IsNullOrWhiteSpace(TeamIds)) return [];
        return TeamIds.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => Guid.TryParse(s, out _))
            .Select(Guid.Parse)
            .ToList();
    }
}
