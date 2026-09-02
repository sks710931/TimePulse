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
}
