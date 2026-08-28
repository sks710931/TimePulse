using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class TeamMember : Entity<Guid>
{
    public Guid TeamId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTime JoinedAtUtc { get; private set; }

    public User? User { get; private set; }
    public Team? Team { get; private set; }

    private TeamMember() { } // EF Core

    public static TeamMember Create(Guid teamId, Guid userId)
    {
        return new TeamMember
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            UserId = userId,
            JoinedAtUtc = DateTime.UtcNow
        };
    }
}
