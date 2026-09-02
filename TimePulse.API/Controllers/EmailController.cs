using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Emails;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] EmailMessage message, CancellationToken cancellationToken)
    {
        var result = await _emailService.SendEmailAsync(message, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true, message = "Email sent successfully." });
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestEmail([FromBody] SendTestEmailRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { errors = new[] { "Recipient email is required." } });
        }

        var subject = string.IsNullOrWhiteSpace(request.Subject)
            ? "TimePulse Test Email"
            : request.Subject;

        var body = string.IsNullOrWhiteSpace(request.Body)
            ? "<p>This is a test email sent from <strong>TimePulse</strong> via Microsoft Graph API.</p>"
            : request.Body;

        var result = await _emailService.SendEmailAsync(request.To, subject, body, isHtml: true, cancellationToken: cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true, message = $"Test email sent successfully to {request.To}." });
    }
}
