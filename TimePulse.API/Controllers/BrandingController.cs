using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Branding;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandingController : ControllerBase
{
    private readonly IBrandingService _brandingService;

    public BrandingController(IBrandingService brandingService)
    {
        _brandingService = brandingService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranding(CancellationToken cancellationToken)
    {
        var settings = await _brandingService.GetBrandSettingsAsync(cancellationToken);
        return Ok(settings);
    }

    [HttpPut]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> UpdateBranding([FromBody] UpdateBrandSettingsRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AppName))
        {
            return BadRequest(new { error = "Application name is required." });
        }

        var settings = await _brandingService.UpdateBrandSettingsAsync(request, cancellationToken);
        return Ok(settings);
    }

    [HttpPost("reset")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> ResetBranding(CancellationToken cancellationToken)
    {
        var settings = await _brandingService.ResetToDefaultAsync(cancellationToken);
        return Ok(settings);
    }
}
