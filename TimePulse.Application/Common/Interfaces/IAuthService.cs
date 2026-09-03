using TimePulse.Application.Auth;
using TimePulse.Application.Common.Models;

namespace TimePulse.Application.Common.Interfaces;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResult> RefreshAsync(string? accessToken, string refreshToken, CancellationToken cancellationToken = default);
    Task LogoutAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default);
    Task<Result<bool>> ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
}
