using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.Leaves;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Enums;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class LeaveService : ILeaveService
{
    private readonly ILeaveRepository _leaveRepository;
    private readonly ITimeEntryRepository _timeEntryRepository;
    private readonly IUserRepository _userRepository;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<LeaveService> _logger;

    public LeaveService(
        ILeaveRepository leaveRepository,
        ITimeEntryRepository timeEntryRepository,
        IUserRepository userRepository,
        IHttpContextAccessor httpContextAccessor,
        ILogger<LeaveService> logger)
    {
        _leaveRepository = leaveRepository;
        _timeEntryRepository = timeEntryRepository;
        _userRepository = userRepository;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<IReadOnlyList<LeaveDto>> GetLeavesForCallerAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        Guid? targetUserId = null,
        DateOnly? startDate = null,
        DateOnly? endDate = null,
        CancellationToken cancellationToken = default)
    {
        var effectiveUserId = isManagerOrAdmin ? targetUserId : callerUserId;

        var start = startDate ?? new DateOnly(DateTime.UtcNow.Year, 1, 1);
        var end = endDate ?? new DateOnly(DateTime.UtcNow.Year, 12, 31);

        var leaves = await _leaveRepository.GetForDateRangeAsync(effectiveUserId, start, end, cancellationToken);
        return leaves.Select(MapToDto).ToList();
    }

    public async Task<LeaveSummaryDto> GetSummaryForCallerAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        Guid? targetUserId = null,
        int? year = null,
        CancellationToken cancellationToken = default)
    {
        var targetYear = year ?? DateTime.UtcNow.Year;
        var start = new DateOnly(targetYear, 1, 1);
        var end = new DateOnly(targetYear, 12, 31);

        var effectiveUserId = isManagerOrAdmin ? targetUserId : callerUserId;

        var leaves = await _leaveRepository.GetForDateRangeAsync(effectiveUserId, start, end, cancellationToken);
        var dtos = leaves.Select(MapToDto).ToList();

        var fullDays = dtos.Count(l => l.LeaveType == LeaveType.FullDay);
        var firstHalves = dtos.Count(l => l.LeaveType == LeaveType.FirstHalf);
        var secondHalves = dtos.Count(l => l.LeaveType == LeaveType.SecondHalf);

        return new LeaveSummaryDto(
            TotalLeaves: dtos.Count,
            FullDayCount: fullDays,
            FirstHalfCount: firstHalves,
            SecondHalfCount: secondHalves,
            Leaves: dtos);
    }

    public async Task<Result<LeaveDto>> CreateLeaveAsync(
        Guid userId,
        CreateLeaveRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Date == default)
        {
            return Result<LeaveDto>.Failure("A valid date is required.");
        }

        // Check if leave already exists on this date
        var existing = await _leaveRepository.GetByUserAndDateAsync(userId, request.Date, cancellationToken);
        if (existing != null)
        {
            return Result<LeaveDto>.Failure($"You already have a {existing.LeaveType} leave marked for {request.Date:yyyy-MM-dd}.");
        }

        var timezoneOffset = GetTimezoneOffsetMinutes();
        var tempLeave = Leave.Create(userId, request.Date, request.LeaveType, request.Reason);

        // Fetch existing time entries around this date to detect Option 2 conflicts
        var startWindow = DateTime.SpecifyKind(request.Date.ToDateTime(TimeOnly.MinValue).AddDays(-1), DateTimeKind.Utc);
        var endWindow = DateTime.SpecifyKind(request.Date.ToDateTime(TimeOnly.MaxValue).AddDays(1), DateTimeKind.Utc);
        var existingEntries = await _timeEntryRepository.GetByUserAndDateRangeAsync(userId, startWindow, endWindow, cancellationToken);

        foreach (var entry in existingEntries)
        {
            var (hasConflict, conflictReason) = LeaveConflictHelper.CheckConflict(
                entry.StartTimeUtc,
                entry.EndTimeUtc,
                tempLeave,
                timezoneOffset);

            if (hasConflict)
            {
                return Result<LeaveDto>.Failure(
                    $"Cannot apply for {FormatLeaveType(request.LeaveType)} leave on {request.Date:yyyy-MM-dd}: " +
                    $"You have an existing time entry ({entry.StartTimeUtc:hh\\:mm tt} - {entry.EndTimeUtc:hh\\:mm tt}) that conflicts with this leave period. " +
                    $"Please adjust or delete that time entry first.");
            }
        }

        await _leaveRepository.AddAsync(tempLeave, cancellationToken);
        await _leaveRepository.SaveChangesAsync(cancellationToken);

        // Load user info for response DTO
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        var dto = new LeaveDto(
            tempLeave.Id,
            tempLeave.UserId,
            user?.FullName ?? "User",
            user?.Email ?? "",
            tempLeave.Date,
            tempLeave.LeaveType,
            FormatLeaveType(tempLeave.LeaveType),
            tempLeave.Reason,
            tempLeave.CreatedAtUtc,
            tempLeave.UpdatedAtUtc);

        _logger.LogInformation("User {UserId} marked {LeaveType} leave on {Date}", userId, tempLeave.LeaveType, tempLeave.Date);
        return Result<LeaveDto>.Success(dto);
    }

    public async Task<Result<LeaveDto>> UpdateLeaveAsync(
        Guid id,
        Guid callerUserId,
        bool isManagerOrAdmin,
        UpdateLeaveRequest request,
        CancellationToken cancellationToken = default)
    {
        var leave = await _leaveRepository.GetByIdAsync(id, cancellationToken);
        if (leave == null)
        {
            return Result<LeaveDto>.Failure("Leave record not found.");
        }

        if (!isManagerOrAdmin && leave.UserId != callerUserId)
        {
            return Result<LeaveDto>.Failure("You do not have permission to modify this leave record.");
        }

        // If date changed, check for conflict with another leave
        if (leave.Date != request.Date)
        {
            var otherLeave = await _leaveRepository.GetByUserAndDateAsync(leave.UserId, request.Date, cancellationToken);
            if (otherLeave != null && otherLeave.Id != id)
            {
                return Result<LeaveDto>.Failure($"A leave record already exists for {request.Date:yyyy-MM-dd}.");
            }
        }

        var timezoneOffset = GetTimezoneOffsetMinutes();
        var tempLeave = Leave.Create(leave.UserId, request.Date, request.LeaveType, request.Reason);

        // Check conflicts against existing time entries
        var startWindow = DateTime.SpecifyKind(request.Date.ToDateTime(TimeOnly.MinValue).AddDays(-1), DateTimeKind.Utc);
        var endWindow = DateTime.SpecifyKind(request.Date.ToDateTime(TimeOnly.MaxValue).AddDays(1), DateTimeKind.Utc);
        var existingEntries = await _timeEntryRepository.GetByUserAndDateRangeAsync(leave.UserId, startWindow, endWindow, cancellationToken);

        foreach (var entry in existingEntries)
        {
            var (hasConflict, _) = LeaveConflictHelper.CheckConflict(
                entry.StartTimeUtc,
                entry.EndTimeUtc,
                tempLeave,
                timezoneOffset);

            if (hasConflict)
            {
                return Result<LeaveDto>.Failure(
                    $"Cannot update to {FormatLeaveType(request.LeaveType)} leave on {request.Date:yyyy-MM-dd}: " +
                    $"You have an existing time entry ({entry.StartTimeUtc:hh\\:mm tt} - {entry.EndTimeUtc:hh\\:mm tt}) that conflicts with this leave period. " +
                    $"Please adjust or delete that time entry first.");
            }
        }

        leave.Update(request.Date, request.LeaveType, request.Reason);
        await _leaveRepository.SaveChangesAsync(cancellationToken);

        return Result<LeaveDto>.Success(MapToDto(leave));
    }

    public async Task<Result<bool>> DeleteLeaveAsync(
        Guid id,
        Guid callerUserId,
        bool isManagerOrAdmin,
        CancellationToken cancellationToken = default)
    {
        var leave = await _leaveRepository.GetByIdAsync(id, cancellationToken);
        if (leave == null)
        {
            return Result<bool>.Failure("Leave record not found.");
        }

        if (!isManagerOrAdmin && leave.UserId != callerUserId)
        {
            return Result<bool>.Failure("You do not have permission to delete this leave record.");
        }

        await _leaveRepository.DeleteAsync(leave, cancellationToken);
        await _leaveRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Leave {LeaveId} deleted by user {CallerId}", id, callerUserId);
        return Result<bool>.Success(true);
    }

    private int GetTimezoneOffsetMinutes()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null && httpContext.Request.Headers.TryGetValue("X-Timezone-Offset", out var headerVal))
        {
            if (int.TryParse(headerVal.FirstOrDefault(), out var offset))
            {
                return offset;
            }
        }
        return 0;
    }

    private static string FormatLeaveType(LeaveType type) => type switch
    {
        LeaveType.FullDay => "Full Day",
        LeaveType.FirstHalf => "First Half (Morning)",
        LeaveType.SecondHalf => "Second Half (Afternoon)",
        _ => type.ToString()
    };

    private static LeaveDto MapToDto(Leave leave) => new(
        leave.Id,
        leave.UserId,
        leave.User?.FullName ?? "Unknown",
        leave.User?.Email ?? "",
        leave.Date,
        leave.LeaveType,
        FormatLeaveType(leave.LeaveType),
        leave.Reason,
        leave.CreatedAtUtc,
        leave.UpdatedAtUtc);
}
