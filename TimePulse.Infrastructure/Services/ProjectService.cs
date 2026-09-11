using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Projects;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly ITimeEntryRepository _timeEntryRepository;

    public ProjectService(
        IProjectRepository projectRepository,
        ITimeEntryRepository timeEntryRepository)
    {
        _projectRepository = projectRepository;
        _timeEntryRepository = timeEntryRepository;
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

    public async Task<IReadOnlyList<UserProjectMonthlySummaryDto>> GetUserProjectMonthlySummariesAsync(
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        int? year = null,
        int? month = null,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Project> userProjects;

        if (isCallerAdmin || isCallerManager)
        {
            // If admin/manager is explicitly assigned to teams, use those; otherwise show all active projects
            var assigned = await _projectRepository.GetProjectsByUserIdAsync(callerUserId, cancellationToken);
            userProjects = assigned.Count > 0 ? assigned : await _projectRepository.GetAllAsync(cancellationToken);
        }
        else
        {
            // Employees only see projects assigned to teams they belong to
            userProjects = await _projectRepository.GetProjectsByUserIdAsync(callerUserId, cancellationToken);
        }

        var now = DateTime.UtcNow;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;
        var startUtc = new DateTime(targetYear, targetMonth, 1, 0, 0, 0, DateTimeKind.Utc);
        var endUtc = startUtc.AddMonths(1).AddTicks(-1);

        var entries = await _timeEntryRepository.GetByUserAndDateRangeAsync(callerUserId, startUtc, endUtc, cancellationToken);
        var entriesByProject = entries
            .Where(e => e.ProjectId.HasValue)
            .GroupBy(e => e.ProjectId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        var summaries = new List<UserProjectMonthlySummaryDto>();
        foreach (var p in userProjects.Where(p => p.IsActive).OrderBy(p => p.Name))
        {
            var projEntries = entriesByProject.TryGetValue(p.Id, out var pe) ? pe : new List<TimeEntry>();
            var totalMinutes = projEntries.Sum(e => e.DurationMinutes);
            var hoursFormatted = $"{totalMinutes / 60}h {totalMinutes % 60:D2}m";
            var totalHoursDecimal = Math.Round(totalMinutes / 60.0, 2);

            summaries.Add(new UserProjectMonthlySummaryDto(
                p.Id,
                p.Name,
                p.Code,
                p.ColorHex,
                p.ClientName,
                totalMinutes,
                hoursFormatted,
                totalHoursDecimal,
                projEntries.Count
            ));
        }

        return summaries;
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
