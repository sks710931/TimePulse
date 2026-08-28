using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Projects;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllProjects(CancellationToken cancellationToken)
    {
        var (callerUserId, isAdmin, isManager) = GetCallerInfo();
        var projects = await _projectService.GetProjectsForCallerAsync(callerUserId, isAdmin, isManager, cancellationToken);
        return Ok(projects);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProjectById(Guid id, CancellationToken cancellationToken)
    {
        var (callerUserId, isAdmin, isManager) = GetCallerInfo();
        var project = await _projectService.GetProjectByIdAsync(id, callerUserId, isAdmin, isManager, cancellationToken);
        if (project is null)
        {
            return NotFound(new { error = "Project not found or access restricted." });
        }

        return Ok(project);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectService.CreateProjectAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(nameof(GetProjectById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectService.UpdateProjectAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.DeleteProjectAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true });
    }

    [HttpPut("{id:guid}/teams")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> SetProjectTeams(Guid id, [FromBody] SetProjectTeamsRequest request, CancellationToken cancellationToken)
    {
        var result = await _projectService.SetProjectTeamsAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    private (Guid CallerUserId, bool IsAdmin, bool IsManager) GetCallerInfo()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        var userId = Guid.TryParse(idClaim, out var parsedId) ? parsedId : Guid.Empty;

        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
            .Concat(User.FindAll("role").Select(c => c.Value))
            .ToList();

        var isAdmin = roles.Any(r => r.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase));
        var isManager = roles.Any(r => r.Equals(Roles.Manager, StringComparison.OrdinalIgnoreCase));

        return (userId, isAdmin, isManager);
    }
}
