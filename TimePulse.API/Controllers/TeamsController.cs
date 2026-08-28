using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Teams;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTeams(CancellationToken cancellationToken)
    {
        var (callerUserId, isAdmin, isManager) = GetCallerInfo();
        var teams = await _teamService.GetTeamsForCallerAsync(callerUserId, isAdmin, isManager, cancellationToken);
        return Ok(teams);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTeamById(Guid id, CancellationToken cancellationToken)
    {
        var (callerUserId, isAdmin, isManager) = GetCallerInfo();
        var team = await _teamService.GetTeamByIdAsync(id, callerUserId, isAdmin, isManager, cancellationToken);
        if (team is null)
        {
            return NotFound(new { error = "Team not found or access restricted." });
        }

        return Ok(team);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request, CancellationToken cancellationToken)
    {
        var result = await _teamService.CreateTeamAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(nameof(GetTeamById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> UpdateTeam(Guid id, [FromBody] UpdateTeamRequest request, CancellationToken cancellationToken)
    {
        var result = await _teamService.UpdateTeamAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> DeleteTeam(Guid id, CancellationToken cancellationToken)
    {
        var result = await _teamService.DeleteTeamAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true });
    }

    [HttpPut("{id:guid}/members")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> SetTeamMembers(Guid id, [FromBody] SetTeamMembersRequest request, CancellationToken cancellationToken)
    {
        var result = await _teamService.SetTeamMembersAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpPut("{id:guid}/projects")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    public async Task<IActionResult> SetTeamProjects(Guid id, [FromBody] SetTeamProjectsRequest request, CancellationToken cancellationToken)
    {
        var result = await _teamService.SetTeamProjectsAsync(id, request, cancellationToken);
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
