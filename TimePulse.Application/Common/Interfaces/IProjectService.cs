using TimePulse.Application.Common.Models;
using TimePulse.Application.Projects;

namespace TimePulse.Application.Common.Interfaces;

public interface IProjectService
{
    Task<IReadOnlyList<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default);
    Task<ProjectDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken = default);
    Task<Result<ProjectDto>> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default);
}
