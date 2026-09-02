using TimePulse.Application.Common.Models;
using TimePulse.Application.Emails;

namespace TimePulse.Application.Common.Interfaces;

public interface IEmailService
{
    Task<Result<bool>> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        string? from = null,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        string? from = null,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendEmailAsync(
        EmailMessage message,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendTemplatedEmailAsync(
        string to,
        string subject,
        string templateHtml,
        IDictionary<string, string>? placeholders = null,
        string? from = null,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendUserInvitationEmailAsync(
        string to,
        string recipientName,
        string invitationUrl,
        string? role = null,
        int expiryHours = 48,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendPasswordResetEmailAsync(
        string to,
        string recipientName,
        string resetUrl,
        int expiryHours = 2,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> SendPasswordResetSuccessEmailAsync(
        string to,
        string recipientName,
        string loginUrl,
        CancellationToken cancellationToken = default);
}
