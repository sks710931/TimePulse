using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Projects;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<IReadOnlyList<ProjectDto>> GetAllProjectsAsync(CancellationToken cancellationToken = default)
    {
        var projects = await _projectRepository.GetAllAsync(cancellationToken);
        return projects.Select(MapToDto).ToList();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        return project is null ? null : MapToDto(project);
    }

    public async Task<Result<ProjectDto>> CreateProjectAsync(CreateProjectRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result<ProjectDto>.Failure("Project name is required.");
        }

        if (await _projectRepository.ExistsByNameAsync(request.Name.Trim(), null, cancellationToken))
        {
            return Result<ProjectDto>.Failure($"A project with the name '{request.Name.Trim()}' already exists.");
        }

        var project = Project.Create(
            request.Name,
            request.Code,
            request.Description,
            request.ClientName,
            request.ColorHex,
            request.IsActive);

        try
        {
            await _projectRepository.AddAsync(project, cancellationToken);
            await _projectRepository.SaveChangesAsync(cancellationToken);

            if (request.TeamIds is not null && request.TeamIds.Count > 0)
            {
                await _projectRepository.SetTeamsAsync(project.Id, request.TeamIds, cancellationToken);
                await _projectRepository.SaveChangesAsync(cancellationToken);
            }

            var loadedProject = await _projectRepository.GetByIdAsync(project.Id, cancellationToken);
            return Result<ProjectDto>.Success(MapToDto(loadedProject!));
        }
        catch (Exception ex)
        {
            return Result<ProjectDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<ProjectDto>> UpdateProjectAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result<ProjectDto>.Failure("Project name is required.");
        }

        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project is null)
        {
            return Result<ProjectDto>.Failure("Project not found.");
        }

        if (await _projectRepository.ExistsByNameAsync(request.Name.Trim(), id, cancellationToken))
        {
            return Result<ProjectDto>.Failure($"Another project with the name '{request.Name.Trim()}' already exists.");
        }

        try
        {
            project.Update(
                request.Name,
                request.Code,
                request.Description,
                request.ClientName,
                request.ColorHex,
                request.IsActive);

            await _projectRepository.SaveChangesAsync(cancellationToken);

            var loadedProject = await _projectRepository.GetByIdAsync(id, cancellationToken);
            return Result<ProjectDto>.Success(MapToDto(loadedProject!));
        }
        catch (Exception ex)
        {
            return Result<ProjectDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteProjectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project is null)
        {
            return Result<bool>.Failure("Project not found.");
        }

        try
        {
            await _projectRepository.DeleteAsync(project, cancellationToken);
            await _projectRepository.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(ex.Message);
        }
    }

    public async Task<Result<ProjectDto>> SetProjectTeamsAsync(Guid id, SetProjectTeamsRequest request, CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project is null)
        {
            return Result<ProjectDto>.Failure("Project not found.");
        }

        try
        {
            await _projectRepository.SetTeamsAsync(id, request.TeamIds, cancellationToken);
            await _projectRepository.SaveChangesAsync(cancellationToken);

            var loadedProject = await _projectRepository.GetByIdAsync(id, cancellationToken);
            return Result<ProjectDto>.Success(MapToDto(loadedProject!));
        }
        catch (Exception ex)
        {
            return Result<ProjectDto>.Failure(ex.Message);
        }
    }

    private static ProjectDto MapToDto(Project p) =>
        new(
            p.Id,
            p.Name,
            p.Code,
            p.Description,
            p.ClientName,
            p.ColorHex,
            p.IsActive,
            p.CreatedAtUtc,
            p.UpdatedAtUtc,
            p.Teams.Select(tp => new ProjectTeamDto(
                tp.TeamId,
                tp.Team?.Name ?? string.Empty,
                tp.Team?.Description,
                tp.Team?.ColorHex,
                tp.Team?.Members.Count ?? 0,
                tp.AssignedAtUtc
            )).ToList());
}
