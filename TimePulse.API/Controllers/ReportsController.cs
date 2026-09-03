using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Reports;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] ReportFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var summary = await _reportService.GetReportSummaryAsync(
            userId, isManagerOrAdmin, filter, cancellationToken);

        return Ok(summary);
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] ReportFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var (content, fileName, contentType) = await _reportService.ExportCsvAsync(
            userId, isManagerOrAdmin, filter, cancellationToken);

        return File(content, contentType, fileName);
    }

    [HttpGet("export/excel")]
    public async Task<IActionResult> ExportExcel(
        [FromQuery] ReportFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var (content, fileName, contentType) = await _reportService.ExportExcelAsync(
            userId, isManagerOrAdmin, filter, cancellationToken);

        return File(content, contentType, fileName);
    }

    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf(
        [FromQuery] ReportFilterRequest filter,
        CancellationToken cancellationToken)
    {
        var (userId, isManagerOrAdmin) = GetCallerInfo();
        if (userId == Guid.Empty)
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var (content, fileName, contentType) = await _reportService.ExportPdfAsync(
            userId, isManagerOrAdmin, filter, cancellationToken);

        return File(content, contentType, fileName);
    }

    private (Guid UserId, bool IsManagerOrAdmin) GetCallerInfo()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        var userId = Guid.TryParse(idClaim, out var parsedId) ? parsedId : Guid.Empty;

        var isManagerOrAdmin = User.IsInRole(Roles.Admin)
            || User.IsInRole(Roles.Manager)
            || User.Claims.Any(c => (c.Type == ClaimTypes.Role || c.Type == "role") &&
                (c.Value.Equals(Roles.Admin, StringComparison.OrdinalIgnoreCase) ||
                 c.Value.Equals(Roles.Manager, StringComparison.OrdinalIgnoreCase)));

        return (userId, isManagerOrAdmin);
    }
}
