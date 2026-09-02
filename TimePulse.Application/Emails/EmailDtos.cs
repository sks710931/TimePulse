namespace TimePulse.Application.Emails;

public class EmailAttachmentDto
{
    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public byte[] Content { get; set; } = [];
}

public class EmailMessage
{
    public List<string> To { get; set; } = [];
    public List<string> Cc { get; set; } = [];
    public List<string> Bcc { get; set; } = [];
    public string? From { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsHtml { get; set; } = true;
    public List<EmailAttachmentDto> Attachments { get; set; } = [];
}

public record SendTestEmailRequest(
    string To,
    string? Subject = null,
    string? Body = null);

public record SendInvitationEmailRequest(
    string To,
    string RecipientName,
    string InvitationUrl,
    string? Role = null,
    int ExpiryHours = 48);

public record SendPasswordResetEmailRequest(
    string To,
    string RecipientName,
    string ResetUrl,
    int ExpiryHours = 2);

public record SendPasswordResetSuccessEmailRequest(
    string To,
    string RecipientName,
    string LoginUrl);

public record SendCustomTemplatedEmailRequest(
    string To,
    string Subject,
    string TemplateHtml,
    Dictionary<string, string>? Placeholders = null);
