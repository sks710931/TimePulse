using TimePulse.Application.Common.Models;
using TimePulse.Application.Projects;

namespace TimePulse.Application.Common.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetProjectsForCallerAsync(
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default);

    Task<ProjectDto?> GetProjectByIdAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default);

    Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken = default);
    Task<Result<ProjectDto>> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<ProjectDto>> SetProjectTeamsAsync(Guid id, SetProjectTeamsRequest request, CancellationToken cancellationToken = default);
}
