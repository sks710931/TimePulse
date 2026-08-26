namespace TimePulse.Application.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password, string FullName);

public record AuthResult
{
    public bool Succeeded { get; init; }
    public string AccessToken { get; init; } = string.Empty;
    public string RefreshToken { get; init; } = string.Empty;
    public DateTime AccessTokenExpiration { get; init; }
    public string? Error { get; init; }

    public static AuthResult Success(string accessToken, string refreshToken, DateTime expiration) =>
        new()
        {
            Succeeded = true,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = expiration
        };

    public static AuthResult Failure(string error) =>
        new()
        {
            Succeeded = false,
            Error = error
        };
}
