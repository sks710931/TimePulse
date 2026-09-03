using Microsoft.Extensions.Logging;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Common.Models;
using TimePulse.Application.TimeEntries;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class TimeEntryService : ITimeEntryService
{
    private readonly ITimeEntryRepository _timeEntryRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly ILogger<TimeEntryService> _logger;

    public TimeEntryService(
        ITimeEntryRepository timeEntryRepository,
        IProjectRepository projectRepository,
        ILogger<TimeEntryService> logger)
    {
        _timeEntryRepository = timeEntryRepository;
        _projectRepository = projectRepository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<TimeEntryDto>> GetTimeEntriesAsync(
        Guid userId,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken = default)
    {
        var entries = await _timeEntryRepository.GetByUserAndDateRangeAsync(
            userId, startUtc, endUtc, cancellationToken);

        return entries.Select(MapToDto).ToList();
    }

    public async Task<PagedTimeEntriesResult> GetPagedTimeEntriesAsync(
        Guid userId,
        int page,
        int pageSize,
        DateTime? startUtc = null,
        DateTime? endUtc = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 50;

        var (items, totalCount) = await _timeEntryRepository.GetPagedByUserAsync(
            userId, page, pageSize, startUtc, endUtc, cancellationToken);

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        var dtos = items.Select(MapToDto).ToList();

        return new PagedTimeEntriesResult(dtos, totalCount, page, pageSize, totalPages);
    }

    public async Task<Result<TimeEntryDto>> CreateTimeEntryAsync(
        Guid userId,
        CreateTimeEntryRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.EndTimeUtc < request.StartTimeUtc)
        {
            return Result<TimeEntryDto>.Failure("End time cannot be earlier than start time.");
        }

        Project? project = null;
        if (request.ProjectId.HasValue)
        {
            project = await _projectRepository.GetByIdAsync(request.ProjectId.Value, cancellationToken);
            if (project is null)
            {
                return Result<TimeEntryDto>.Failure("Selected project not found.");
            }
        }

        var isBillable = project?.IsBillable ?? false;

        try
        {
            var entry = TimeEntry.Create(
                userId,
                request.StartTimeUtc,
                request.EndTimeUtc,
                request.Description,
                request.ProjectId,
                isBillable,
                request.Tag);

            await _timeEntryRepository.AddAsync(entry, cancellationToken);
            await _timeEntryRepository.SaveChangesAsync(cancellationToken);

            // Fetch with Project populated for DTO
            var created = await _timeEntryRepository.GetByIdAsync(entry.Id, cancellationToken);
            return Result<TimeEntryDto>.Success(MapToDto(created ?? entry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create time entry for user {UserId}", userId);
            return Result<TimeEntryDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<TimeEntryDto>> UpdateTimeEntryAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        UpdateTimeEntryRequest request,
        CancellationToken cancellationToken = default)
    {
        var entry = await _timeEntryRepository.GetByIdAsync(id, cancellationToken);
        if (entry is null)
        {
            return Result<TimeEntryDto>.Failure("Time entry not found.");
        }

        if (!isCallerAdmin && entry.UserId != callerUserId)
        {
            return Result<TimeEntryDto>.Failure("Unauthorized to edit this time entry.");
        }

        if (request.EndTimeUtc < request.StartTimeUtc)
        {
            return Result<TimeEntryDto>.Failure("End time cannot be earlier than start time.");
        }

        Project? project = null;
        if (request.ProjectId.HasValue)
        {
            project = await _projectRepository.GetByIdAsync(request.ProjectId.Value, cancellationToken);
            if (project is null)
            {
                return Result<TimeEntryDto>.Failure("Selected project not found.");
            }
        }

        var isBillable = project?.IsBillable ?? false;

        try
        {
            entry.Update(
                request.StartTimeUtc,
                request.EndTimeUtc,
                request.Description,
                request.ProjectId,
                isBillable,
                request.Tag);

            await _timeEntryRepository.SaveChangesAsync(cancellationToken);

            var updated = await _timeEntryRepository.GetByIdAsync(entry.Id, cancellationToken);
            return Result<TimeEntryDto>.Success(MapToDto(updated ?? entry));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update time entry {EntryId}", id);
            return Result<TimeEntryDto>.Failure(ex.Message);
        }
    }

    public async Task<Result<bool>> DeleteTimeEntryAsync(
        Guid id,
        Guid callerUserId,
        bool isCallerAdmin,
        CancellationToken cancellationToken = default)
    {
        var entry = await _timeEntryRepository.GetByIdAsync(id, cancellationToken);
        if (entry is null)
        {
            return Result<bool>.Failure("Time entry not found.");
        }

        if (!isCallerAdmin && entry.UserId != callerUserId)
        {
            return Result<bool>.Failure("Unauthorized to delete this time entry.");
        }

        try
        {
            await _timeEntryRepository.DeleteAsync(entry, cancellationToken);
            await _timeEntryRepository.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete time entry {EntryId}", id);
            return Result<bool>.Failure(ex.Message);
        }
    }

    private static TimeEntryDto MapToDto(TimeEntry te) =>
        new(
            te.Id,
            te.UserId,
            te.ProjectId,
            te.Project?.Name,
            te.Project?.ColorHex,
            te.Project?.ClientName,
            te.Description,
            te.StartTimeUtc,
            te.EndTimeUtc,
            te.DurationMinutes,
            te.IsBillable,
            te.Tag,
            te.CreatedAtUtc);
}
