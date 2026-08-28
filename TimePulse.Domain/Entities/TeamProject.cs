using TimePulse.Domain.Common;

namespace TimePulse.Domain.Entities;

public class TeamProject : Entity<Guid>
{
    public Guid TeamId { get; private set; }
    public Guid ProjectId { get; private set; }
    public DateTime AssignedAtUtc { get; private set; }

    public Project? Project { get; private set; }
    public Team? Team { get; private set; }

    private TeamProject() { } // EF Core

    public static TeamProject Create(Guid teamId, Guid projectId)
    {
        return new TeamProject
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            ProjectId = projectId,
            AssignedAtUtc = DateTime.UtcNow
        };
    }
}
