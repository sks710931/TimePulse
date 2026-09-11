using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class PasswordResetToken : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime ExpiresAtUtc { get; private set; }
    public bool IsConsumed { get; private set; }
    public DateTime? ConsumedAtUtc { get; private set; }

    private PasswordResetToken() { } // EF Core

    public static PasswordResetToken Create(
        Guid userId,
        string email,
        string tokenHash,
        int expiryHours = 2)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(tokenHash);

        return new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Email = email.ToLowerInvariant().Trim(),
            TokenHash = tokenHash,
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
}
