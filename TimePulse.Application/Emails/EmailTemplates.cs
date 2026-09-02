using System.Net;
using System.Text;

namespace TimePulse.Application.Emails;

public static class EmailTemplates
{
    /// <summary>
    /// Replaces tokens like {{Key}} in template with matching values from replacements dictionary.
    /// </summary>
    public static string Render(string template, IDictionary<string, string> replacements)
    {
        if (string.IsNullOrEmpty(template)) return string.Empty;

        var sb = new StringBuilder(template);
        foreach (var (key, value) in replacements)
        {
            sb.Replace($"{{{{{key}}}}}", value ?? string.Empty);
        }
        return sb.ToString();
    }

    /// <summary>
    /// Template 1: User Invitation Email
    /// </summary>
    public static string UserInvitation(
        string appName,
        string primaryColor,
        string recipientName,
        string invitationUrl,
        string? role = null,
        int expiryHours = 48)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeApp = WebUtility.HtmlEncode(appName);
        var safeColor = string.IsNullOrWhiteSpace(primaryColor) ? "#4F46E5" : primaryColor.Trim();
        var safeRole = !string.IsNullOrWhiteSpace(role) ? WebUtility.HtmlEncode(role) : "Team Member";

        var content = $@"
            <h2 style=""margin: 0 0 16px 0; color: #0F172A; font-size: 20px; font-weight: 700; line-height: 28px;"">
                Welcome to {safeApp}, {safeName}!
            </h2>
            <p style=""margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                You have been invited to join <strong>{safeApp}</strong> as a <strong>{safeRole}</strong>.
            </p>
            <p style=""margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                To accept the invitation, set up your password, and activate your workspace, please click the button below:
            </p>

            <!-- Call to Action Button -->
            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" style=""margin: 28px 0;"">
                <tr>
                    <td align=""center"" style=""border-radius: 10px; background-color: {safeColor};"">
                        <a href=""{invitationUrl}"" target=""_blank"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;"">
                            Accept Invitation &amp; Get Started &rarr;
                        </a>
                    </td>
                </tr>
            </table>

            <!-- Security Notice Box -->
            <div style=""background-color: #F8FAFC; border-left: 4px solid {safeColor}; padding: 14px 16px; border-radius: 6px; margin: 24px 0;"">
                <p style=""margin: 0; font-size: 12px; color: #64748B; line-height: 18px;"">
                    <strong>Note:</strong> This invitation link will expire in <strong>{expiryHours} hours</strong>. If you did not expect an invitation, you can safely ignore this email.
                </p>
            </div>

            <!-- Fallback Plain URL -->
            <p style=""margin: 24px 0 0 0; font-size: 12px; color: #94A3B8; line-height: 18px; word-break: break-all;"">
                If the button above doesn't work, copy and paste this link into your web browser:<br/>
                <a href=""{invitationUrl}"" style=""color: {safeColor}; text-decoration: underline;"">{invitationUrl}</a>
            </p>";

        return WrapWithLayout(appName, safeColor, "You're invited to join " + safeApp, content);
    }

    /// <summary>
    /// Template 2: Password Reset Request Email
    /// </summary>
    public static string PasswordResetRequest(
        string appName,
        string primaryColor,
        string recipientName,
        string resetUrl,
        int expiryHours = 2)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeApp = WebUtility.HtmlEncode(appName);
        var safeColor = string.IsNullOrWhiteSpace(primaryColor) ? "#4F46E5" : primaryColor.Trim();

        var content = $@"
            <h2 style=""margin: 0 0 16px 0; color: #0F172A; font-size: 20px; font-weight: 700; line-height: 28px;"">
                Password Reset Request
            </h2>
            <p style=""margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                Hello {safeName},
            </p>
            <p style=""margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                We received a request to reset your password for your <strong>{safeApp}</strong> account. Click the button below to choose a new password:
            </p>

            <!-- Call to Action Button -->
            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" style=""margin: 28px 0;"">
                <tr>
                    <td align=""center"" style=""border-radius: 10px; background-color: {safeColor};"">
                        <a href=""{resetUrl}"" target=""_blank"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;"">
                            Reset Password &rarr;
                        </a>
                    </td>
                </tr>
            </table>

            <!-- Security Warning Box -->
            <div style=""background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 6px; margin: 24px 0;"">
                <p style=""margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #991B1B;"">
                    Didn't request this change?
                </p>
                <p style=""margin: 0; font-size: 12px; color: #B91C1C; line-height: 18px;"">
                    If you did not request a password reset, please ignore this email or contact your administrator immediately. Your password will remain unchanged until you access the link above.
                </p>
            </div>

            <!-- Expiry Note -->
            <p style=""margin: 16px 0 0 0; font-size: 12px; color: #64748B; line-height: 18px;"">
                This password reset link is valid for <strong>{expiryHours} hours</strong> only.
            </p>

            <!-- Fallback Plain URL -->
            <p style=""margin: 20px 0 0 0; font-size: 12px; color: #94A3B8; line-height: 18px; word-break: break-all;"">
                Button not clickable? Paste this URL in your browser:<br/>
                <a href=""{resetUrl}"" style=""color: {safeColor}; text-decoration: underline;"">{resetUrl}</a>
            </p>";

        return WrapWithLayout(appName, safeColor, "Reset Your " + safeApp + " Password", content);
    }

    /// <summary>
    /// Template 3: Password Reset Successful Email
    /// </summary>
    public static string PasswordResetSuccessful(
        string appName,
        string primaryColor,
        string recipientName,
        string loginUrl)
    {
        var safeName = WebUtility.HtmlEncode(recipientName);
        var safeApp = WebUtility.HtmlEncode(appName);
        var safeColor = string.IsNullOrWhiteSpace(primaryColor) ? "#4F46E5" : primaryColor.Trim();

        var content = $@"
            <div style=""text-align: center; margin-bottom: 24px;"">
                <div style=""display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background-color: #ECFDF5; border: 2px solid #10B981; margin: 0 auto 16px auto;"">
                    <span style=""color: #059669; font-size: 28px; line-height: 56px;"">&#10003;</span>
                </div>
                <h2 style=""margin: 0; color: #0F172A; font-size: 20px; font-weight: 700; line-height: 28px;"">
                    Password Changed Successfully
                </h2>
            </div>

            <p style=""margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                Hello {safeName},
            </p>
            <p style=""margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                This is a confirmation that the password for your <strong>{safeApp}</strong> account has been successfully updated.
            </p>
            <p style=""margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 24px;"">
                You can now log in to your account with your new password:
            </p>

            <!-- Call to Action Button -->
            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" style=""margin: 28px auto;"">
                <tr>
                    <td align=""center"" style=""border-radius: 10px; background-color: {safeColor};"">
                        <a href=""{loginUrl}"" target=""_blank"" style=""display: inline-block; padding: 13px 32px; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;"">
                            Sign In to {safeApp} &rarr;
                        </a>
                    </td>
                </tr>
            </table>

            <!-- Security Alert Box -->
            <div style=""background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px 16px; border-radius: 6px; margin: 24px 0;"">
                <p style=""margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #991B1B;"">
                    Important Security Advisory
                </p>
                <p style=""margin: 0; font-size: 12px; color: #B91C1C; line-height: 18px;"">
                    If you did not perform this password change, please contact your system administrator or IT security team immediately to secure your account.
                </p>
            </div>";

        return WrapWithLayout(appName, safeColor, "Your " + safeApp + " Password Was Updated", content);
    }

    /// <summary>
    /// Wraps content inside a modern, responsive email layout shell.
    /// </summary>
    public static string WrapWithLayout(string appName, string primaryColor, string previewText, string innerContent)
    {
        var safeApp = WebUtility.HtmlEncode(appName);
        var safeColor = string.IsNullOrWhiteSpace(primaryColor) ? "#4F46E5" : primaryColor.Trim();
        var year = DateTime.UtcNow.Year;

        return $@"<!DOCTYPE html>
<html lang=""en"" xmlns=""http://www.w3.org/1999/xhtml"">
<head>
    <meta charset=""UTF-8"" />
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
    <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"" />
    <title>{safeApp}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #F8FAFC;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}
        table {{
            border-collapse: separate;
        }}
        @media only screen and (max-width: 620px) {{
            .main-card {{
                width: 100% !important;
                border-radius: 0 !important;
                padding: 24px 16px !important;
            }}
        }}
    </style>
</head>
<body style=""margin: 0; padding: 0; background-color: #F1F5F9;"">
    <!-- Preview Text -->
    <div style=""display: none; font-size: 1px; color: #F1F5F9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"">
        {WebUtility.HtmlEncode(previewText)}
    </div>

    <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #F1F5F9; padding: 36px 12px;"">
        <tr>
            <td align=""center"">
                <!-- Outer Container -->
                <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""max-width: 580px;"">
                    <!-- Brand Header -->
                    <tr>
                        <td align=""center"" style=""padding: 0 0 24px 0;"">
                            <table role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td style=""vertical-align: middle;"">
                                        <div style=""display: inline-block; width: 34px; height: 34px; line-height: 34px; border-radius: 8px; background-color: {safeColor}; color: #FFFFFF; text-align: center; font-weight: 800; font-size: 16px; margin-right: 10px;"">
                                            {safeApp.Substring(0, 1).ToUpperInvariant()}
                                        </div>
                                    </td>
                                    <td style=""vertical-align: middle;"">
                                        <span style=""font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;"">
                                            {safeApp}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Card Body -->
                    <tr>
                        <td>
                            <table class=""main-card"" role=""presentation"" border=""0"" cellpadding=""0"" cellspacing=""0"" width=""100%"" style=""background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);"">
                                <tr>
                                    <td>
                                        {innerContent}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align=""center"" style=""padding: 24px 16px; text-align: center;"">
                            <p style=""margin: 0 0 6px 0; font-size: 12px; color: #64748B;"">
                                Sent automatically by <strong>{safeApp}</strong> &bull; Time Tracking &amp; Workspace Management
                            </p>
                            <p style=""margin: 0; font-size: 11px; color: #94A3B8;"">
                                &copy; {year} {safeApp}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
    }
}
