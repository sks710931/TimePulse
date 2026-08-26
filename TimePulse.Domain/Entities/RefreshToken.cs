using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class RefreshToken : Entity<Guid>
{
    public string TokenHash { get; private set; } = string.Empty;
    public Guid UserId { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime? RevokedAtUtc { get; private set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;
    public bool IsRevoked => RevokedAtUtc is not null;
    public bool IsActive => !IsRevoked && !IsExpired;

    private RefreshToken() { } // EF Core

    public static RefreshToken Create(string tokenHash, Guid userId, TimeSpan lifetime)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            TokenHash = tokenHash,
            UserId = userId,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.Add(lifetime)
        };
    }

    public void Revoke()
    {
        if (!IsRevoked)
        {
            RevokedAtUtc = DateTime.UtcNow;
        }
    }
}
