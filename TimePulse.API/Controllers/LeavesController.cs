using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Leaves;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/leaves")]
[Authorize]
public class LeavesController : ControllerBase
{
    private readonly ILeaveService _leaveService;

    public LeavesController(ILeaveService leaveService)
    {
        _leaveService = leaveService;
    }

    [HttpGet]
    public async Task<IActionResult> GetLeaves(
        [FromQuery] Guid? targetUserId = null,
        [FromQuery] DateOnly? startDate = null,
        [FromQuery] DateOnly? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var leaves = await _leaveService.GetLeavesForCallerAsync(
            userId, isManagerOrAdmin, targetUserId, startDate, endDate, cancellationToken);

        return Ok(leaves);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] Guid? targetUserId = null,
        [FromQuery] int? year = null,
        CancellationToken cancellationToken = default)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var summary = await _leaveService.GetSummaryForCallerAsync(
            userId, isManagerOrAdmin, targetUserId, year, cancellationToken);

        return Ok(summary);
    }

    [HttpPost]
    public async Task<IActionResult> CreateLeave(
        [FromBody] CreateLeaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var (userId, _) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _leaveService.CreateLeaveAsync(userId, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(nameof(GetLeaves), new { id = result.Data!.Id }, result.Data);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateLeave(
        Guid id,
        [FromBody] UpdateLeaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _leaveService.UpdateLeaveAsync(id, userId, isManagerOrAdmin, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteLeave(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _leaveService.DeleteLeaveAsync(id, userId, isManagerOrAdmin, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return NoContent();
    }

    private (Guid UserId, bool IsManagerOrAdmin) GetCallerInfo()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var parsed = Guid.TryParse(sub, out var id) ? id : Guid.Empty;
        var isManagerOrAdmin = User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager);
        return (parsed, isManagerOrAdmin);
    }
}
