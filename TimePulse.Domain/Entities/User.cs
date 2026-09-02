using TimePulse.Domain.Common;
using TimePulse.Domain.Constants;
using TimePulse.Domain.Exceptions;

namespace TimePulse.Domain.Entities;

public class User : AggregateRoot<Guid>
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    private readonly List<UserRole> _roles = [];
    public IReadOnlyCollection<UserRole> Roles => _roles.AsReadOnly();

    private readonly List<RefreshToken> _refreshTokens = [];
    public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    private User() { } // EF Core

    public static User Create(string email, string passwordHash, string fullName, string defaultRole = Constants.Roles.Admin)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FullName = fullName,
            CreatedAtUtc = DateTime.UtcNow
        };

        user.AddRole(defaultRole);

        return user;
    }

    public static User CreateFromInvitation(string email, string passwordHash, string fullName, IEnumerable<string> roles)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(passwordHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            FullName = fullName,
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var role in roles)
        {
            user.AddRole(role);
        }

        return user;
    }

    public void UpdateFullName(string fullName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);
        FullName = fullName.Trim();
    }

    public void SetRoles(IEnumerable<string> roles)
    {
        ArgumentNullException.ThrowIfNull(roles);

        var validRoles = new List<string>();
        foreach (var role in roles)
        {
            if (!string.IsNullOrWhiteSpace(role) && Constants.Roles.IsValid(role))
            {
                var normalizedRole = Constants.Roles.All.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));
                if (!validRoles.Contains(normalizedRole))
                {
                    validRoles.Add(normalizedRole);
                }
            }
        }

        if (validRoles.Count == 0)
        {
            throw new DomainException("A user must have at least one valid role.");
        }

        // Remove roles not in new list
        _roles.RemoveAll(r => !validRoles.Any(vr => vr.Equals(r.Role, StringComparison.OrdinalIgnoreCase)));

        // Add new roles not already present
        foreach (var validRole in validRoles)
        {
            if (!_roles.Any(r => r.Role.Equals(validRole, StringComparison.OrdinalIgnoreCase)))
            {
                _roles.Add(UserRole.Create(Id, validRole));
            }
        }
    }

    public void AddRole(string role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(role);

        if (!Constants.Roles.IsValid(role))
        {
            throw new DomainException($"Invalid role: '{role}'. Allowed roles are: {string.Join(", ", Constants.Roles.All)}");
        }

        var normalizedRole = Constants.Roles.All.First(r => r.Equals(role, StringComparison.OrdinalIgnoreCase));

        if (!_roles.Any(r => r.Role.Equals(normalizedRole, StringComparison.OrdinalIgnoreCase)))
        {
            _roles.Add(UserRole.Create(Id, normalizedRole));
        }
    }

    public void RemoveRole(string role)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(role);
        _roles.RemoveAll(r => r.Role.Equals(role, StringComparison.OrdinalIgnoreCase));
    }

    public bool HasRole(string role)
    {
        return _roles.Any(r => r.Role.Equals(role, StringComparison.OrdinalIgnoreCase));
    }

    public void AddRefreshToken(RefreshToken refreshToken)
    {
        _refreshTokens.Add(refreshToken);
    }

    public void RevokeRefreshToken(RefreshToken refreshToken)
    {
        refreshToken.Revoke();
    }

    public void RevokeAllRefreshTokens()
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
        {
            token.Revoke();
        }
    }
}
