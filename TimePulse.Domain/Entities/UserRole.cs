using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class UserRole : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public string Role { get; private set; } = string.Empty;

    private UserRole() { } // EF Core

    public static UserRole Create(Guid userId, string role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(role);

        return new UserRole
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Role = role
        };
    }
}
