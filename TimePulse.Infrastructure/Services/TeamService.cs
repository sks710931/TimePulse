using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Teams;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;

    public TeamService(ITeamRepository teamRepository)
    {
        _teamRepository = teamRepository;
    }

    public async Task<IReadOnlyList<TeamDto>> GetTeamsForCallerAsync(
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<Team> teams;

        if (isCallerAdmin || isCallerManager)
        {
            teams = await _teamRepository.GetAllWithDetailsAsync(cancellationToken);
        }
        else
        {
            // Employees can only see teams they are part of
            teams = await _teamRepository.GetTeamsByUserIdAsync(callerUserId, cancellationToken);
        }

        return teams.Select(MapToDto).ToList();
    }

    public async Task<TeamDto?> GetTeamByIdAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        bool isCallerManager,
        CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdWithDetailsAsync(id, cancellationToken);
        if (team is null)
        {
            return null;
        }

        // Employee can only access if they are a member
        if (!isCallerAdmin && !isCallerManager)
        {
            var isMember = team.Members.Any(m => m.UserId == callerUserId);
            if (!isMember)
            {
                return null;
            }
        }

        return MapToDto(team);
    }

    public async Task<Result<TeamDto>> CreateTeamAsync(CreateTeamRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result<TeamDto>.Failure("Team name is required.");
        }

        if (await _teamRepository.ExistsByNameAsync(request.Name.Trim(), null, cancellationToken))
        {
            return Result<TeamDto>.Failure($"A team with the name '{request.Name.Trim()}' already exists.");
        }

        var team = Team.Create(request.Name, request.Description, request.ColorHex);

        try
        {
            await _teamRepository.AddAsync(team, cancellationToken);
            await _teamRepository.SaveChangesAsync(cancellationToken);

            if (request.MemberUserIds is not null && request.MemberUserIds.Count > 0)
            {
                await _teamRepository.SetMembersAsync(team.Id, request.MemberUserIds, cancellationToken);
            }

            if (request.ProjectIds is not null && request.ProjectIds.Count > 0)
            {
                await _teamRepository.SetProjectsAsync(team.Id, request.ProjectIds, cancellationToken);
            }

            if ((request.MemberUserIds?.Count ?? 0) > 0 || (request.ProjectIds?.Count ?? 0) > 0)
            {
                await _teamRepository.SaveChangesAsync(cancellationToken);
            }

            var loadedTeam = await _teamRepository.GetByIdWithDetailsAsync(team.Id, cancellationToken);
            return Result<TeamDto>.Success(MapToDto(loadedTeam!));
        }
        catch (Exception ex)
        {
            return Result<TeamDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<TeamDto>> UpdateTeamAsync(Guid id, UpdateTeamRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Result<TeamDto>.Failure("Team name is required.");
        }

        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team is null)
        {
            return Result<TeamDto>.Failure("Team not found.");
        }

        if (await _teamRepository.ExistsByNameAsync(request.Name.Trim(), id, cancellationToken))
        {
            return Result<TeamDto>.Failure($"Another team with the name '{request.Name.Trim()}' already exists.");
        }

        try
        {
            team.Update(request.Name, request.Description, request.ColorHex);
            await _teamRepository.SaveChangesAsync(cancellationToken);

            var loadedTeam = await _teamRepository.GetByIdWithDetailsAsync(id, cancellationToken);
            return Result<TeamDto>.Success(MapToDto(loadedTeam!));
        }
        catch (Exception ex)
        {
            return Result<TeamDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteTeamAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team is null)
        {
            return Result<bool>.Failure("Team not found.");
        }

        try
        {
            await _teamRepository.DeleteAsync(team, cancellationToken);
            await _teamRepository.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure(ex.Message);
        }
    }

    public async Task<Result<TeamDto>> SetTeamMembersAsync(Guid id, SetTeamMembersRequest request, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team is null)
        {
            return Result<TeamDto>.Failure("Team not found.");
        }

        try
        {
            await _teamRepository.SetMembersAsync(id, request.UserIds, cancellationToken);
            await _teamRepository.SaveChangesAsync(cancellationToken);

            var loadedTeam = await _teamRepository.GetByIdWithDetailsAsync(id, cancellationToken);
            return Result<TeamDto>.Success(MapToDto(loadedTeam!));
        }
        catch (Exception ex)
        {
            return Result<TeamDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<TeamDto>> SetTeamProjectsAsync(Guid id, SetTeamProjectsRequest request, CancellationToken cancellationToken = default)
    {
        var team = await _teamRepository.GetByIdAsync(id, cancellationToken);
        if (team is null)
        {
            return Result<TeamDto>.Failure("Team not found.");
        }

        try
        {
            await _teamRepository.SetProjectsAsync(id, request.ProjectIds, cancellationToken);
            await _teamRepository.SaveChangesAsync(cancellationToken);

            var loadedTeam = await _teamRepository.GetByIdWithDetailsAsync(id, cancellationToken);
            return Result<TeamDto>.Success(MapToDto(loadedTeam!));
        }
        catch (Exception ex)
        {
            return Result<TeamDto>.Failure(ex.Message);
        }
    }

    private static TeamDto MapToDto(Team t) =>
        new(
            t.Id,
            t.Name,
            t.Description,
            t.ColorHex,
            t.CreatedAtUtc,
            t.UpdatedAtUtc,
            t.Members.Select(m => new TeamMemberDto(
                m.UserId,
                m.User?.Email ?? string.Empty,
                m.User?.FullName ?? string.Empty,
                m.User?.Roles.Select(r => r.Role).ToList() ?? [],
                m.JoinedAtUtc
            )).ToList(),
            t.Projects.Select(p => new TeamProjectDto(
                p.ProjectId,
                p.Project?.Name ?? string.Empty,
                p.Project?.Code,
                p.Project?.ClientName,
                p.Project?.ColorHex,
                p.Project?.IsActive ?? true,
                p.AssignedAtUtc
            )).ToList()
        );
}
