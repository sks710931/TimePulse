using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Users;
using TimePulse.Domain.Constants;

namespace TimePulse.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
    {
        var users = await _userService.GetAllUsersAsync(cancellationToken);
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetUserByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return NotFound(new { error = "User not found." });
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var isCallerAdmin = User.IsInRole(Roles.Admin);
        var result = await _userService.CreateUserAsync(request, isCallerAdmin, cancellationToken);

        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return CreatedAtAction(nameof(GetUserById), new { id = result.Data!.Id }, result.Data);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost("{id:guid}/roles")]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] AssignRoleRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.AssignRoleAsync(id, request.Role, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpDelete("{id:guid}/roles/{role}")]
    public async Task<IActionResult> RemoveRole(Guid id, string role, CancellationToken cancellationToken)
    {
        var result = await _userService.RemoveRoleAsync(id, role, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        return Ok(result.Data);
    }
}
