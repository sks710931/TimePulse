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

    public async Task<IReadOnlyList<ProjectDto>> GetProjectsForCallerAsync(
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Project> projects;

        if (isCallerAdmin || isCallerManager)
        {
            projects = await _projectRepository.GetAllAsync(cancellationToken);
        }
        else
        {
            // Employees can only see projects assigned to teams they belong to
            projects = await _projectRepository.GetProjectsByUserIdAsync(callerUserId, cancellationToken);
        }

        return projects.Select(MapToDto).ToList();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        if (project is null)
        {
            return null;
        }

        // Employees can only see project details if assigned to a team they belong to
        if (!isCallerAdmin && !isCallerManager)
        {
            var isMemberOfAssignedTeam = project.Teams.Any(tp => tp.Team != null && tp.Team.Members.Any(m => m.UserId == callerUserId));
            if (!isMemberOfAssignedTeam)
            {
                return null;
            }
        }

        return MapToDto(project);
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
            request.IsActive,
            request.IsBillable);

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
                request.IsActive,
                request.IsBillable);

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
            p.IsBillable,
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
