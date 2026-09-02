using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Emails;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IBrandSettingsRepository _brandSettingsRepository;
    private readonly ILogger<EmailService> _logger;
    private GraphServiceClient? _graphClient;
    private readonly object _clientLock = new();

    public EmailService(
        IConfiguration configuration,
        IBrandSettingsRepository brandSettingsRepository,
        ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _brandSettingsRepository = brandSettingsRepository;
        _logger = logger;
    }

    public Task<Result<bool>> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        string? from = null,
        CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = [to],
            Subject = subject,
            Body = body,
            IsHtml = isHtml,
            From = from
        };

        return SendEmailAsync(message, cancellationToken);
    }

    public Task<Result<bool>> SendEmailAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true,
        string? from = null,
        IEnumerable<string>? cc = null,
        IEnumerable<string>? bcc = null,
        CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage
        {
            To = to.ToList(),
            Subject = subject,
            Body = body,
            IsHtml = isHtml,
            From = from,
            Cc = cc?.ToList() ?? [],
            Bcc = bcc?.ToList() ?? []
        };

        return SendEmailAsync(message, cancellationToken);
    }

    public async Task<Result<bool>> SendEmailAsync(
        EmailMessage message,
        CancellationToken cancellationToken = default)
    {
        if (message == null)
        {
            return Result<bool>.Failure("Email message cannot be null.");
        }

        if (message.To == null || message.To.Count == 0)
        {
            return Result<bool>.Failure("At least one recipient email address is required.");
        }

        var tenantId = GetCredential("TenantId", "Tenantid", "TENANT_ID", "AZURE_TENANT_ID", "AzureAd:TenantId");
        var appId = GetCredential("AppId", "APP_ID", "ClientId", "CLIENT_ID", "AZURE_CLIENT_ID", "AzureAd:ClientId");
        var clientSecret = GetCredential("ClientSecret", "CLIENT_SECRET", "AZURE_CLIENT_SECRET", "AzureAd:ClientSecret");

        var missing = new List<string>();
        if (string.IsNullOrWhiteSpace(tenantId)) missing.Add("TenantId");
        if (string.IsNullOrWhiteSpace(appId)) missing.Add("AppId");
        if (string.IsNullOrWhiteSpace(clientSecret)) missing.Add("ClientSecret");

        if (missing.Count > 0)
        {
            var err = $"Microsoft Graph credentials missing: {string.Join(", ", missing)}. Please set them in system environment variables.";
            _logger.LogError(err);
            return Result<bool>.Failure(err);
        }

        var fromEmail = !string.IsNullOrWhiteSpace(message.From)
            ? message.From.Trim()
            : GetCredential("SenderEmail", "SENDER_EMAIL", "FromEmail", "FROM_EMAIL", "EMAIL_FROM", "Email:SenderEmail");

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            const string err = "Sender email address (from) is required. Set the SenderEmail environment variable or provide a From address.";
            _logger.LogError(err);
            return Result<bool>.Failure(err);
        }

        try
        {
            var client = GetOrCreateGraphClient(tenantId!, appId!, clientSecret!);

            var graphMessage = new Message
            {
                Subject = message.Subject,
                Body = new ItemBody
                {
                    ContentType = message.IsHtml ? BodyType.Html : BodyType.Text,
                    Content = message.Body
                },
                ToRecipients = message.To
                    .Where(addr => !string.IsNullOrWhiteSpace(addr))
                    .Select(addr => new Recipient
                    {
                        EmailAddress = new EmailAddress { Address = addr.Trim() }
                    })
                    .ToList()
            };

            if (message.Cc != null && message.Cc.Count > 0)
            {
                graphMessage.CcRecipients = message.Cc
                    .Where(addr => !string.IsNullOrWhiteSpace(addr))
                    .Select(addr => new Recipient
                    {
                        EmailAddress = new EmailAddress { Address = addr.Trim() }
                    })
                    .ToList();
            }

            if (message.Bcc != null && message.Bcc.Count > 0)
            {
                graphMessage.BccRecipients = message.Bcc
                    .Where(addr => !string.IsNullOrWhiteSpace(addr))
                    .Select(addr => new Recipient
                    {
                        EmailAddress = new EmailAddress { Address = addr.Trim() }
                    })
                    .ToList();
            }

            if (message.Attachments != null && message.Attachments.Count > 0)
            {
                graphMessage.Attachments = message.Attachments
                    .Select(att => (Attachment)new FileAttachment
                    {
                        OdataType = "#microsoft.graph.fileAttachment",
                        Name = att.Name,
                        ContentType = att.ContentType,
                        ContentBytes = att.Content
                    })
                    .ToList();
            }

            var requestBody = new SendMailPostRequestBody
            {
                Message = graphMessage,
                SaveToSentItems = false
            };

            _logger.LogInformation("Sending email via Microsoft Graph API. From: {From}, To: {To}, Subject: {Subject}",
                fromEmail, string.Join(", ", message.To), message.Subject);

            await client.Users[fromEmail].SendMail.PostAsync(requestBody, cancellationToken: cancellationToken);

            _logger.LogInformation("Email sent successfully via Microsoft Graph API to {To}", string.Join(", ", message.To));
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via Microsoft Graph API. Error: {Message}", ex.Message);
            return Result<bool>.Failure($"Failed to send email via Microsoft Graph API: {ex.Message}");
        }
    }

    public Task<Result<bool>> SendTemplatedEmailAsync(
        string to,
        string subject,
        string templateHtml,
        IDictionary<string, string>? placeholders = null,
        string? from = null,
        CancellationToken cancellationToken = default)
    {
        var finalHtml = placeholders != null && placeholders.Count > 0
            ? EmailTemplates.Render(templateHtml, placeholders)
            : templateHtml;

        return SendEmailAsync(to, subject, finalHtml, isHtml: true, from: from, cancellationToken: cancellationToken);
    }

    public async Task<Result<bool>> SendUserInvitationEmailAsync(
        string to,
        string recipientName,
        string invitationUrl,
        string? role = null,
        int expiryHours = 48,
        CancellationToken cancellationToken = default)
    {
        var (appName, primaryColor) = await GetBrandInfoAsync(cancellationToken);
        var subject = $"You're invited to join {appName}";
        var body = EmailTemplates.UserInvitation(appName, primaryColor, recipientName, invitationUrl, role, expiryHours);

        return await SendEmailAsync(to, subject, body, isHtml: true, cancellationToken: cancellationToken);
    }

    public async Task<Result<bool>> SendPasswordResetEmailAsync(
        string to,
        string recipientName,
        string resetUrl,
        int expiryHours = 2,
        CancellationToken cancellationToken = default)
    {
        var (appName, primaryColor) = await GetBrandInfoAsync(cancellationToken);
        var subject = $"Reset Your {appName} Password";
        var body = EmailTemplates.PasswordResetRequest(appName, primaryColor, recipientName, resetUrl, expiryHours);

        return await SendEmailAsync(to, subject, body, isHtml: true, cancellationToken: cancellationToken);
    }

    public async Task<Result<bool>> SendPasswordResetSuccessEmailAsync(
        string to,
        string recipientName,
        string loginUrl,
        CancellationToken cancellationToken = default)
    {
        var (appName, primaryColor) = await GetBrandInfoAsync(cancellationToken);
        var subject = $"Your {appName} Password Was Updated";
        var body = EmailTemplates.PasswordResetSuccessful(appName, primaryColor, recipientName, loginUrl);

        return await SendEmailAsync(to, subject, body, isHtml: true, cancellationToken: cancellationToken);
    }

    private async Task<(string AppName, string PrimaryColor)> GetBrandInfoAsync(CancellationToken cancellationToken)
    {
        try
        {
            var settings = await _brandSettingsRepository.GetSettingsAsync(cancellationToken);
            var appName = !string.IsNullOrWhiteSpace(settings?.AppName) ? settings.AppName : "TimePulse";
            var primaryColor = !string.IsNullOrWhiteSpace(settings?.PrimaryColorLight) ? settings.PrimaryColorLight : "#4F46E5";
            return (appName, primaryColor);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not load brand settings for email template, defaulting to TimePulse.");
            return ("TimePulse", "#4F46E5");
        }
    }

    private GraphServiceClient GetOrCreateGraphClient(string tenantId, string clientId, string clientSecret)
    {
        if (_graphClient != null) return _graphClient;

        lock (_clientLock)
        {
            if (_graphClient != null) return _graphClient;

            var credential = new ClientSecretCredential(
                tenantId,
                clientId,
                clientSecret,
                new ClientSecretCredentialOptions
                {
                    AuthorityHost = AzureAuthorityHosts.AzurePublicCloud
                });

            _graphClient = new GraphServiceClient(credential, ["https://graph.microsoft.com/.default"]);
            return _graphClient;
        }
    }

    private string? GetCredential(params string[] keys)
    {
        foreach (var key in keys)
        {
            var envValue = Environment.GetEnvironmentVariable(key);
            if (!string.IsNullOrWhiteSpace(envValue))
            {
                return envValue.Trim();
            }

            var configValue = _configuration[key];
            if (!string.IsNullOrWhiteSpace(configValue))
            {
                return configValue.Trim();
            }
        }

        return null;
    }
}
