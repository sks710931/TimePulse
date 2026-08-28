using TimePulse.Application.Common.Models;
using TimePulse.Application.Teams;

namespace TimePulse.Application.Common.Interfaces;

public interface ITeamService
{
    Task<IReadOnlyList<TeamDto>> GetTeamsForCallerAsync(Guid callerUserId, bool isCallerAdmin, bool isCallerManager, CancellationToken cancellationToken = default);
    Task<TeamDto?> GetTeamByIdAsync(Guid id, Guid callerUserId, bool isCallerAdmin, bool isCallerManager, CancellationToken cancellationToken = default);
    Task<Result<TeamDto>> CreateTeamAsync(CreateTeamRequest request, CancellationToken cancellationToken = default);
    Task<Result<TeamDto>> UpdateTeamAsync(Guid id, UpdateTeamRequest request, CancellationToken cancellationToken = default);
    Task<Result<bool>> DeleteTeamAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<TeamDto>> SetTeamMembersAsync(Guid id, SetTeamMembersRequest request, CancellationToken cancellationToken = default);
    Task<Result<TeamDto>> SetTeamProjectsAsync(Guid id, SetTeamProjectsRequest request, CancellationToken cancellationToken = default);
}
