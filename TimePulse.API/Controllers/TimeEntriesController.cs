using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.TimeEntries;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/time-entries")]
[Authorize]
public class TimeEntriesController : ControllerBase
{
    private readonly ITimeEntryService _timeEntryService;

    public TimeEntriesController(ITimeEntryService timeEntryService)
    {
        _timeEntryService = timeEntryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTimeEntries(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var (userId, _) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var start = startDate?.ToUniversalTime();
        var end = endDate?.ToUniversalTime();

        var pagedResult = await _timeEntryService.GetPagedTimeEntriesAsync(
            userId, page, pageSize, start, end, cancellationToken);

        return Ok(pagedResult);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTimeEntry(
        [FromBody] CreateTimeEntryRequest request,
        CancellationToken cancellationToken)
    {
        var (userId, _) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _timeEntryService.CreateTimeEntryAsync(userId, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateTimeEntry(
        Guid id,
        [FromBody] UpdateTimeEntryRequest request,
        CancellationToken cancellationToken)
    {
        var (userId, isAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _timeEntryService.UpdateTimeEntryAsync(id, userId, isAdmin, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTimeEntry(
        Guid id,
        CancellationToken cancellationToken)
    {
        var (userId, isAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _timeEntryService.DeleteTimeEntryAsync(id, userId, isAdmin, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true });
    }

    private (Guid UserId, bool IsAdmin) GetCallerInfo()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        var userId = Guid.TryParse(idClaim, out var parsedId) ? parsedId : Guid.Empty;

        var isAdmin = User.IsInRole(Roles.Admin)
            || User.Claims.Any(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase));

        return (userId, isAdmin);
    }
}
