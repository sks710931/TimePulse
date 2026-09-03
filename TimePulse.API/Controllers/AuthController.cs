using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Auth;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Users;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private const string AccessTokenCookie = "tp_access";
    private const string RefreshTokenCookie = "tp_refresh";

    public AuthController(
        IAuthService authService,
        IUserService userService,
        IConfiguration configuration)
    {
        _authService = authService;
        _userService = userService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(request, cancellationToken);

        if (!result.Succeeded)
        {
            return Unauthorized(new { error = result.Error });
        }

        SetTokenCookies(result);
        return Ok(new { message = "Login successful." });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var accessToken = Request.Cookies[AccessTokenCookie];
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { error = "Missing refresh token." });
        }

        var result = await _authService.RefreshAsync(accessToken, refreshToken, cancellationToken);

        if (!result.Succeeded)
        {
            ClearTokenCookies();
            return Unauthorized(new { error = result.Error });
        }

        SetTokenCookies(result);
        return Ok(new { message = "Token refreshed." });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        if (Guid.TryParse(userId, out var parsedUserId) && !string.IsNullOrEmpty(refreshToken))
        {
            await _authService.LogoutAsync(parsedUserId, refreshToken, cancellationToken);
        }

        ClearTokenCookies();
        return Ok(new { message = "Logged out." });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { error = "Invalid user identity." });
        }

        var result = await _authService.ChangePasswordAsync(userId, request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(new { message = "Password updated successfully." });
    }

    [AllowAnonymous]
    [HttpGet("invite/validate")]
    public async Task<IActionResult> ValidateInvitation([FromQuery] string token, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { error = "Invitation token is required." });
        }

        var result = await _userService.ValidateInvitationAsync(token, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [AllowAnonymous]
    [HttpPost("invite/accept")]
    public async Task<IActionResult> AcceptInvitation([FromBody] AcceptInvitationRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.AcceptInvitationAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        // Automatically issue auth cookies on successful account creation
        SetTokenCookies(result.Data!);
        return Ok(new { message = "Account activated successfully." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (Guid.TryParse(userIdStr, out var userId))
        {
            var user = await _userService.GetUserByIdAsync(userId, cancellationToken);
            if (user is not null)
            {
                return Ok(new
                {
                    id = user.Id.ToString(),
                    email = user.Email,
                    fullName = user.FullName,
                    name = user.FullName,
                    roles = user.Roles.ToArray()
                });
            }
        }

        var fallbackName = User.FindFirst(ClaimTypes.Name)?.Value
            ?? User.FindFirst("name")?.Value
            ?? User.FindFirst("fullName")?.Value
            ?? User.FindFirst("unique_name")?.Value;

        return Ok(new
        {
            id = userIdStr,
            email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value,
            fullName = fallbackName,
            name = fallbackName,
            roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
                .Concat(User.FindAll("role").Select(c => c.Value))
                .Distinct()
                .ToArray()
        });
    }

    private void SetTokenCookies(AuthResult result)
    {
        var refreshDays = int.Parse(_configuration["Jwt:RefreshTokenExpirationDays"] ?? "7");

        Response.Cookies.Append(AccessTokenCookie, result.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            MaxAge = TimeSpan.FromDays(refreshDays)
        });

        Response.Cookies.Append(RefreshTokenCookie, result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth",
            MaxAge = TimeSpan.FromDays(refreshDays)
        });
    }

    private void ClearTokenCookies()
    {
        Response.Cookies.Delete(AccessTokenCookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/auth"
        });
    }
}
