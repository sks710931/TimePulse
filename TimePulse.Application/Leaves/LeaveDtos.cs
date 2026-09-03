using TimePulse.Domain.Enums;

namespace TimePulse.Application.Leaves;

public record LeaveDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    DateOnly Date,
    LeaveType LeaveType,
    string LeaveTypeDisplayName,
    string? Reason,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record CreateLeaveRequest(
    DateOnly Date,
    LeaveType LeaveType,
    string? Reason = null);

public record UpdateLeaveRequest(
    DateOnly Date,
    LeaveType LeaveType,
    string? Reason = null);

public record LeaveSummaryDto(
    int TotalLeaves,
    int FullDayCount,
    int FirstHalfCount,
    int SecondHalfCount,
    IReadOnlyList<LeaveDto> Leaves);
