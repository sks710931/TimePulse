namespace TimePulse.Application.Reports;

public record ReportFilterRequest(
    string? Preset = null, // "weekly", "monthly", "last_month", "custom"
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    Guid? UserId = null,
    Guid? ProjectId = null,
    bool? IsBillable = null
);

public record ReportSummaryDto(
    DateTime StartDateUtc,
    DateTime EndDateUtc,
    int TotalDurationMinutes,
    string TotalHoursFormatted,
    double TotalHoursDecimal,
    int BillableDurationMinutes,
    string BillableHoursFormatted,
    double BillablePercentage,
    int NonBillableDurationMinutes,
    string NonBillableHoursFormatted,
    int TotalEntriesCount,
    IReadOnlyList<ProjectReportBreakdownDto> Projects,
    IReadOnlyList<EmployeeReportBreakdownDto> Employees,
    IReadOnlyList<DailyTrendDto> DailyTrends,
    IReadOnlyList<ReportTimeEntryDto> Entries
);

public record ProjectReportBreakdownDto(
    Guid? ProjectId,
    string ProjectName,
    string ColorHex,
    int DurationMinutes,
    string HoursFormatted,
    int BillableMinutes,
    double PercentageOfTotal
);

public record EmployeeReportBreakdownDto(
    Guid UserId,
    string FullName,
    string Email,
    int DurationMinutes,
    string HoursFormatted,
    int BillableMinutes,
    int EntryCount
);

public record DailyTrendDto(
    string Date,
    string DayOfWeek,
    int DurationMinutes,
    string HoursFormatted
);

public record ReportTimeEntryDto(
    Guid Id,
    DateTime StartTimeUtc,
    DateTime EndTimeUtc,
    string DateFormatted,
    string StartTimeFormatted,
    string EndTimeFormatted,
    int DurationMinutes,
    string DurationFormatted,
    Guid UserId,
    string UserName,
    string UserEmail,
    Guid? ProjectId,
    string ProjectName,
    string ProjectColor,
    string Description,
    string? Tag,
    bool IsBillable
);
