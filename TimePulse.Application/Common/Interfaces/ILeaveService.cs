using TimePulse.Application.Common.Models;
using TimePulse.Application.Leaves;

namespace TimePulse.Application.Common.Interfaces;

public interface ILeaveService
{
    Task<IReadOnlyList<LeaveDto>> GetLeavesForCallerAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        Guid? targetUserId = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        CancellationToken cancellationToken = default);

    Task<LeaveSummaryDto> GetSummaryForCallerAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        Guid? targetUserId = null,
        int? year = null,
        CancellationToken cancellationToken = default);

    Task<Result<LeaveDto>> CreateLeaveAsync(
        Guid userId,
        CreateLeaveRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<LeaveDto>> UpdateLeaveAsync(
        Guid id,
        Guid callerUserId,
        bool isManagerOrAdmin,
        UpdateLeaveRequest request,
        CancellationToken cancellationToken = default);

    Task<Result<bool>> DeleteLeaveAsync(
        Guid id,
        Guid callerUserId,
        bool isManagerOrAdmin,
        CancellationToken cancellationToken = default);
}
