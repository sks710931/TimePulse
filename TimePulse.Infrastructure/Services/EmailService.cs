using Azure.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Emails;

namespace TimePulse.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private GraphServiceClient? _graphClient;
    private readonly object _clientLock = new();

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
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
            // First check system environment variables
            var envValue = Environment.GetEnvironmentVariable(key);
            if (!string.IsNullOrWhiteSpace(envValue))
            {
                return envValue.Trim();
            }

            // Also check IConfiguration (which also incorporates environment variables and appsettings)
            var configValue = _configuration[key];
            if (!string.IsNullOrWhiteSpace(configValue))
            {
                return configValue.Trim();
            }
        }

        return null;
    }
}
