using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Emails;
using TimePulse.Domain.Constants;
using TimePulse.Domain.Repositories;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly IBrandSettingsRepository _brandSettingsRepository;

    public EmailController(IEmailService emailService, IBrandSettingsRepository brandSettingsRepository)
    {
        _emailService = emailService;
        _brandSettingsRepository = brandSettingsRepository;
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

    [HttpPost("templates/invitation")]
    public async Task<IActionResult> SendInvitationEmail([FromBody] SendInvitationEmailRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { errors = new[] { "Recipient email (To) is required." } });
        }

        var result = await _emailService.SendUserInvitationEmailAsync(
            request.To,
            request.RecipientName,
            request.InvitationUrl,
            request.Role,
            request.ExpiryHours,
            cancellationToken);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true, message = $"Invitation email sent to {request.To}." });
    }

    [HttpPost("templates/password-reset")]
    public async Task<IActionResult> SendPasswordResetEmail([FromBody] SendPasswordResetEmailRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { errors = new[] { "Recipient email (To) is required." } });
        }

        var result = await _emailService.SendPasswordResetEmailAsync(
            request.To,
            request.RecipientName,
            request.ResetUrl,
            request.ExpiryHours,
            cancellationToken);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true, message = $"Password reset email sent to {request.To}." });
    }

    [HttpPost("templates/password-reset-success")]
    public async Task<IActionResult> SendPasswordResetSuccessEmail([FromBody] SendPasswordResetSuccessEmailRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.To))
        {
            return BadRequest(new { errors = new[] { "Recipient email (To) is required." } });
        }

        var result = await _emailService.SendPasswordResetSuccessEmailAsync(
            request.To,
            request.RecipientName,
            request.LoginUrl,
            cancellationToken);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { success = true, message = $"Password reset confirmation email sent to {request.To}." });
    }

    [HttpGet("templates/preview/{templateType}")]
    [AllowAnonymous]
    [Produces("text/html")]
    public async Task<ContentResult> PreviewTemplate(string templateType, CancellationToken cancellationToken)
    {
        var settings = await _brandSettingsRepository.GetSettingsAsync(cancellationToken);
        var appName = !string.IsNullOrWhiteSpace(settings?.AppName) ? settings.AppName : "TimePulse";
        var primaryColor = !string.IsNullOrWhiteSpace(settings?.PrimaryColorLight) ? settings.PrimaryColorLight : "#4F46E5";

        string html;
        switch (templateType.ToLowerInvariant())
        {
            case "invitation":
            case "user-invitation":
                html = EmailTemplates.UserInvitation(
                    appName,
                    primaryColor,
                    "Alex Morgan",
                    "https://timepulse.example.com/invite/accept?token=sample-token-12345",
                    "Senior Developer",
                    48);
                break;

            case "password-reset":
            case "reset-request":
                html = EmailTemplates.PasswordResetRequest(
                    appName,
                    primaryColor,
                    "Alex Morgan",
                    "https://timepulse.example.com/reset-password?token=sample-token-67890",
                    2);
                break;

            case "password-reset-success":
            case "reset-success":
                html = EmailTemplates.PasswordResetSuccessful(
                    appName,
                    primaryColor,
                    "Alex Morgan",
                    "https://timepulse.example.com/login");
                break;

            default:
                html = $"<p>Unknown template type: '{templateType}'. Valid types: invitation, password-reset, password-reset-success.</p>";
                break;
        }

        return new ContentResult
        {
            Content = html,
            ContentType = "text/html",
            StatusCode = 200
        };
    }
}
