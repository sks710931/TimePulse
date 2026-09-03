using System.Text;
using ClosedXML.Excel;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using TimePulse.Application.Common.Interfaces;
using TimePulse.Application.Reports;
using TimePulse.Domain.Entities;
using TimePulse.Domain.Repositories;

namespace TimePulse.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly ITimeEntryRepository _timeEntryRepository;
    private readonly ILogger<ReportService> _logger;

    static ReportService()
    {
        // Set QuestPDF community license
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public ReportService(
        ITimeEntryRepository timeEntryRepository,
        ILogger<ReportService> logger)
    {
        _timeEntryRepository = timeEntryRepository;
        _logger = logger;
    }

    public async Task<ReportSummaryDto> GetReportSummaryAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var (startUtc, endUtc) = ResolveDateRange(filter);
        var entries = await FetchEntriesAsync(callerUserId, isManagerOrAdmin, filter, startUtc, endUtc, cancellationToken);

        return BuildSummaryDto(entries, startUtc, endUtc);
    }

    public async Task<(byte[] Content, string FileName, string ContentType)> ExportCsvAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var (startUtc, endUtc) = ResolveDateRange(filter);
        var entries = await FetchEntriesAsync(callerUserId, isManagerOrAdmin, filter, startUtc, endUtc, cancellationToken);

        var sb = new StringBuilder();
        // UTF-8 BOM is added on return
        sb.AppendLine("Date,Employee Name,Employee Email,Project,Description,Tag,Start Time (UTC),End Time (UTC),Duration (Hours),Duration (Minutes),Billable");

        foreach (var entry in entries)
        {
            var dateStr = entry.StartTimeUtc.ToString("yyyy-MM-dd");
            var employeeName = EscapeCsv(entry.User?.FullName ?? "Unknown");
            var employeeEmail = EscapeCsv(entry.User?.Email ?? "");
            var projectName = EscapeCsv(entry.Project?.Name ?? "No Project");
            var description = EscapeCsv(entry.Description);
            var tag = EscapeCsv(entry.Tag ?? "");
            var startTime = entry.StartTimeUtc.ToString("yyyy-MM-dd HH:mm");
            var endTime = entry.EndTimeUtc.ToString("yyyy-MM-dd HH:mm");
            var durationHours = (entry.DurationMinutes / 60.0).ToString("F2");
            var durationMinutes = entry.DurationMinutes.ToString();
            var billable = IsBillableEntry(entry) ? "Yes" : "No";

            sb.AppendLine($"{dateStr},{employeeName},{employeeEmail},{projectName},{description},{tag},{startTime},{endTime},{durationHours},{durationMinutes},{billable}");
        }

        var preamble = Encoding.UTF8.GetPreamble();
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        var fullBytes = new byte[preamble.Length + bytes.Length];
        Buffer.BlockCopy(preamble, 0, fullBytes, 0, preamble.Length);
        Buffer.BlockCopy(bytes, 0, fullBytes, preamble.Length, bytes.Length);

        var fileName = $"TimePulse_Report_{startUtc:yyyyMMdd}_{endUtc:yyyyMMdd}.csv";
        return (fullBytes, fileName, "text/csv; charset=utf-8");
    }

    public async Task<(byte[] Content, string FileName, string ContentType)> ExportExcelAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var (startUtc, endUtc) = ResolveDateRange(filter);
        var entries = await FetchEntriesAsync(callerUserId, isManagerOrAdmin, filter, startUtc, endUtc, cancellationToken);
        var summary = BuildSummaryDto(entries, startUtc, endUtc);

        using var workbook = new XLWorkbook();

        // -------------------------------------------------------------
        // Sheet 1: Summary Dashboard
        // -------------------------------------------------------------
        var wsSummary = workbook.Worksheets.Add("Summary");

        // Header Title Banner
        wsSummary.Range("A1:F1").Merge();
        wsSummary.Cell("A1").Value = "TimePulse - Time & Productivity Report";
        wsSummary.Cell("A1").Style.Font.Bold = true;
        wsSummary.Cell("A1").Style.Font.FontSize = 16;
        wsSummary.Cell("A1").Style.Font.FontColor = XLColor.White;
        wsSummary.Cell("A1").Style.Fill.BackgroundColor = XLColor.FromHtml("#4F46E5"); // Indigo
        wsSummary.Cell("A1").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        wsSummary.Row(1).Height = 32;

        // Metadata Subtitle
        wsSummary.Range("A2:F2").Merge();
        wsSummary.Cell("A2").Value = $"Date Range: {startUtc:yyyy-MM-dd} to {endUtc:yyyy-MM-dd} UTC  |  Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
        wsSummary.Cell("A2").Style.Font.Italic = true;
        wsSummary.Cell("A2").Style.Font.FontSize = 10;
        wsSummary.Cell("A2").Style.Font.FontColor = XLColor.FromHtml("#64748B");
        wsSummary.Cell("A2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // KPI Metric Cards Table
        wsSummary.Cell("A4").Value = "Metric";
        wsSummary.Cell("B4").Value = "Value";
        wsSummary.Cell("C4").Value = "Details";
        wsSummary.Range("A4:C4").Style.Font.Bold = true;
        wsSummary.Range("A4:C4").Style.Fill.BackgroundColor = XLColor.FromHtml("#F1F5F9");
        wsSummary.Range("A4:C4").Style.Border.BottomBorder = XLBorderStyleValues.Medium;

        var kpiRow = 5;
        AddKpiRow(wsSummary, kpiRow++, "Total Time Tracked", summary.TotalHoursFormatted, $"{summary.TotalHoursDecimal:F2} decimal hours");
        AddKpiRow(wsSummary, kpiRow++, "Billable Time", summary.BillableHoursFormatted, $"{summary.BillablePercentage:F1}% of total time");
        AddKpiRow(wsSummary, kpiRow++, "Non-Billable Time", summary.NonBillableHoursFormatted, $"{100 - summary.BillablePercentage:F1}% of total time");
        AddKpiRow(wsSummary, kpiRow++, "Total Time Entries", summary.TotalEntriesCount.ToString(), "Logged entries");

        // Project Breakdown Section
        var projStartRow = kpiRow + 2;
        wsSummary.Cell(projStartRow, 1).Value = "Project Breakdown";
        wsSummary.Cell(projStartRow, 1).Style.Font.Bold = true;
        wsSummary.Cell(projStartRow, 1).Style.Font.FontSize = 12;

        var projHeaderRow = projStartRow + 1;
        wsSummary.Cell(projHeaderRow, 1).Value = "Project Name";
        wsSummary.Cell(projHeaderRow, 2).Value = "Total Time";
        wsSummary.Cell(projHeaderRow, 3).Value = "Hours (Decimal)";
        wsSummary.Cell(projHeaderRow, 4).Value = "Billable Time";
        wsSummary.Cell(projHeaderRow, 5).Value = "% of Total";
        wsSummary.Range(projHeaderRow, 1, projHeaderRow, 5).Style.Font.Bold = true;
        wsSummary.Range(projHeaderRow, 1, projHeaderRow, 5).Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");

        var curProjRow = projHeaderRow + 1;
        foreach (var proj in summary.Projects)
        {
            wsSummary.Cell(curProjRow, 1).Value = proj.ProjectName;
            wsSummary.Cell(curProjRow, 2).Value = proj.HoursFormatted;
            wsSummary.Cell(curProjRow, 3).Value = Math.Round(proj.DurationMinutes / 60.0, 2);
            wsSummary.Cell(curProjRow, 4).Value = FormatDuration(proj.BillableMinutes);
            wsSummary.Cell(curProjRow, 5).Value = $"{proj.PercentageOfTotal:F1}%";
            curProjRow++;
        }

        // Employee Breakdown Section (if Manager/Admin)
        if (isManagerOrAdmin && summary.Employees.Count > 0)
        {
            var empStartRow = curProjRow + 2;
            wsSummary.Cell(empStartRow, 1).Value = "Team Member Breakdown";
            wsSummary.Cell(empStartRow, 1).Style.Font.Bold = true;
            wsSummary.Cell(empStartRow, 1).Style.Font.FontSize = 12;

            var empHeaderRow = empStartRow + 1;
            wsSummary.Cell(empHeaderRow, 1).Value = "Employee Name";
            wsSummary.Cell(empHeaderRow, 2).Value = "Email";
            wsSummary.Cell(empHeaderRow, 3).Value = "Total Time";
            wsSummary.Cell(empHeaderRow, 4).Value = "Billable Time";
            wsSummary.Cell(empHeaderRow, 5).Value = "Entries Logged";
            wsSummary.Range(empHeaderRow, 1, empHeaderRow, 5).Style.Font.Bold = true;
            wsSummary.Range(empHeaderRow, 1, empHeaderRow, 5).Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");

            var curEmpRow = empHeaderRow + 1;
            foreach (var emp in summary.Employees)
            {
                wsSummary.Cell(curEmpRow, 1).Value = emp.FullName;
                wsSummary.Cell(curEmpRow, 2).Value = emp.Email;
                wsSummary.Cell(curEmpRow, 3).Value = emp.HoursFormatted;
                wsSummary.Cell(curEmpRow, 4).Value = FormatDuration(emp.BillableMinutes);
                wsSummary.Cell(curEmpRow, 5).Value = emp.EntryCount;
                curEmpRow++;
            }
        }

        wsSummary.Columns().AdjustToContents();

        // -------------------------------------------------------------
        // Sheet 2: Detailed Time Entries
        // -------------------------------------------------------------
        var wsEntries = workbook.Worksheets.Add("Time Entries");

        var headers = new[]
        {
            "Date", "Employee", "Email", "Project", "Description", "Tag",
            "Start Time (UTC)", "End Time (UTC)", "Duration (Hours)", "Duration (Minutes)", "Billable"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            wsEntries.Cell(1, i + 1).Value = headers[i];
        }

        var headerRange = wsEntries.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Font.FontColor = XLColor.White;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4F46E5");
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        wsEntries.Row(1).Height = 24;

        int row = 2;
        foreach (var entry in entries)
        {
            wsEntries.Cell(row, 1).Value = entry.StartTimeUtc.ToString("yyyy-MM-dd");
            wsEntries.Cell(row, 2).Value = entry.User?.FullName ?? "Unknown";
            wsEntries.Cell(row, 3).Value = entry.User?.Email ?? "";
            wsEntries.Cell(row, 4).Value = entry.Project?.Name ?? "No Project";
            wsEntries.Cell(row, 5).Value = entry.Description;
            wsEntries.Cell(row, 6).Value = entry.Tag ?? "";
            wsEntries.Cell(row, 7).Value = entry.StartTimeUtc.ToString("yyyy-MM-dd HH:mm");
            wsEntries.Cell(row, 8).Value = entry.EndTimeUtc.ToString("yyyy-MM-dd HH:mm");
            wsEntries.Cell(row, 9).Value = Math.Round(entry.DurationMinutes / 60.0, 2);
            wsEntries.Cell(row, 10).Value = entry.DurationMinutes;
            wsEntries.Cell(row, 11).Value = IsBillableEntry(entry) ? "Yes" : "No";

            if (row % 2 == 0)
            {
                wsEntries.Range(row, 1, row, headers.Length).Style.Fill.BackgroundColor = XLColor.FromHtml("#F8FAFC");
            }

            row++;
        }

        // Total Summary Row
        if (entries.Count > 0)
        {
            wsEntries.Cell(row, 1).Value = "Total";
            wsEntries.Cell(row, 1).Style.Font.Bold = true;
            wsEntries.Cell(row, 9).FormulaA1 = $"SUM(I2:I{row - 1})";
            wsEntries.Cell(row, 9).Style.Font.Bold = true;
            wsEntries.Cell(row, 10).FormulaA1 = $"SUM(J2:J{row - 1})";
            wsEntries.Cell(row, 10).Style.Font.Bold = true;
            wsEntries.Range(row, 1, row, headers.Length).Style.Border.TopBorder = XLBorderStyleValues.Medium;
            wsEntries.Range(row, 1, row, headers.Length).Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");
        }

        wsEntries.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        var fileName = $"TimePulse_Report_{startUtc:yyyyMMdd}_{endUtc:yyyyMMdd}.xlsx";
        return (ms.ToArray(), fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    public async Task<(byte[] Content, string FileName, string ContentType)> ExportPdfAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default)
    {
        var (startUtc, endUtc) = ResolveDateRange(filter);
        var entries = await FetchEntriesAsync(callerUserId, isManagerOrAdmin, filter, startUtc, endUtc, cancellationToken);
        var summary = BuildSummaryDto(entries, startUtc, endUtc);

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Helvetica"));

                // Header
                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Column(titleCol =>
                        {
                            titleCol.Item().Text("TimePulse").FontSize(18).Bold().FontColor("#4F46E5");
                            titleCol.Item().Text("Time & Productivity Report").FontSize(13).SemiBold().FontColor("#1E293B");
                            titleCol.Item().Text($"Period: {startUtc:MMM dd, yyyy} - {endUtc:MMM dd, yyyy} UTC").FontSize(9).FontColor("#64748B");
                        });

                        row.ConstantItem(150).AlignRight().Column(metaCol =>
                        {
                            metaCol.Item().Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC").FontSize(8).FontColor("#94A3B8");
                            if (isManagerOrAdmin)
                            {
                                metaCol.Item().Text("Scope: Team / Organization").FontSize(8).FontColor("#4F46E5").Bold();
                            }
                            else
                            {
                                metaCol.Item().Text("Scope: Personal").FontSize(8).FontColor("#0EA5E9").Bold();
                            }
                        });
                    });

                    col.Item().PaddingTop(8).LineHorizontal(1).LineColor("#E2E8F0");
                });

                // Content
                page.Content().PaddingVertical(10).Column(col =>
                {
                    // 1. KPI Highlights
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Component(new KpiBox("Total Tracked", summary.TotalHoursFormatted, $"{summary.TotalHoursDecimal:F1} hrs", "#4F46E5"));
                        row.Spacing(8);
                        row.RelativeItem().Component(new KpiBox("Billable Time", summary.BillableHoursFormatted, $"{summary.BillablePercentage:F1}% rate", "#10B981"));
                        row.Spacing(8);
                        row.RelativeItem().Component(new KpiBox("Non-Billable", summary.NonBillableHoursFormatted, "internal", "#F59E0B"));
                        row.Spacing(8);
                        row.RelativeItem().Component(new KpiBox("Total Entries", summary.TotalEntriesCount.ToString(), "records", "#6366F1"));
                    });

                    col.Item().PaddingTop(14);

                    // 2. Project Breakdown Table
                    col.Item().Text("Project Breakdown").FontSize(11).Bold().FontColor("#1E293B");
                    col.Item().PaddingTop(4).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background("#F1F5F9").Padding(5).Text("Project Name").Bold();
                            header.Cell().Background("#F1F5F9").Padding(5).AlignRight().Text("Total Time").Bold();
                            header.Cell().Background("#F1F5F9").Padding(5).AlignRight().Text("Billable Time").Bold();
                            header.Cell().Background("#F1F5F9").Padding(5).AlignRight().Text("Share %").Bold();
                        });

                        foreach (var proj in summary.Projects)
                        {
                            table.Cell().BorderBottom(1).BorderColor("#F1F5F9").Padding(5).Text(proj.ProjectName);
                            table.Cell().BorderBottom(1).BorderColor("#F1F5F9").Padding(5).AlignRight().Text(proj.HoursFormatted);
                            table.Cell().BorderBottom(1).BorderColor("#F1F5F9").Padding(5).AlignRight().Text(FormatDuration(proj.BillableMinutes));
                            table.Cell().BorderBottom(1).BorderColor("#F1F5F9").Padding(5).AlignRight().Text($"{proj.PercentageOfTotal:F1}%");
                        }
                    });

                    col.Item().PaddingTop(14);

                    // 3. Detailed Entries Table
                    col.Item().Text("Detailed Time Entries").FontSize(11).Bold().FontColor("#1E293B");
                    col.Item().PaddingTop(4).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(65); // Date
                            if (isManagerOrAdmin)
                            {
                                columns.RelativeColumn(2); // Employee
                            }
                            columns.RelativeColumn(2); // Project
                            columns.RelativeColumn(3); // Description
                            columns.ConstantColumn(55); // Duration
                            columns.ConstantColumn(50); // Billable
                        });

                        table.Header(header =>
                        {
                            header.Cell().Background("#4F46E5").Padding(5).Text("Date").FontColor("#FFFFFF").Bold();
                            if (isManagerOrAdmin)
                            {
                                header.Cell().Background("#4F46E5").Padding(5).Text("Employee").FontColor("#FFFFFF").Bold();
                            }
                            header.Cell().Background("#4F46E5").Padding(5).Text("Project").FontColor("#FFFFFF").Bold();
                            header.Cell().Background("#4F46E5").Padding(5).Text("Description").FontColor("#FFFFFF").Bold();
                            header.Cell().Background("#4F46E5").Padding(5).AlignRight().Text("Duration").FontColor("#FFFFFF").Bold();
                            header.Cell().Background("#4F46E5").Padding(5).AlignCenter().Text("Billable").FontColor("#FFFFFF").Bold();
                        });

                        var idx = 0;
                        foreach (var entry in summary.Entries)
                        {
                            var bg = idx % 2 == 0 ? "#FFFFFF" : "#F8FAFC";

                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).Text(entry.DateFormatted);
                            if (isManagerOrAdmin)
                            {
                                table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).Text(entry.UserName);
                            }
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).Text(entry.ProjectName);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).Text(entry.Description);
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).AlignRight().Text(entry.DurationFormatted).Bold();
                            table.Cell().Background(bg).BorderBottom(1).BorderColor("#F1F5F9").Padding(4).AlignCenter().Text(entry.IsBillable ? "Yes" : "No");

                            idx++;
                        }
                    });
                });

                // Footer
                page.Footer().Row(row =>
                {
                    row.RelativeItem().Text("TimePulse Enterprise Time Tracking").FontSize(8).FontColor("#94A3B8");
                    row.RelativeItem().AlignRight().Text(text =>
                    {
                        text.Span("Page ").FontSize(8).FontColor("#94A3B8");
                        text.CurrentPageNumber().FontSize(8).FontColor("#94A3B8");
                        text.Span(" of ").FontSize(8).FontColor("#94A3B8");
                        text.TotalPages().FontSize(8).FontColor("#94A3B8");
                    });
                });
            });
        });

        var pdfBytes = document.GeneratePdf();
        var fileName = $"TimePulse_Report_{startUtc:yyyyMMdd}_{endUtc:yyyyMMdd}.pdf";
        return (pdfBytes, fileName, "application/pdf");
    }

    private static void AddKpiRow(IXLWorksheet ws, int row, string metric, string value, string details)
    {
        ws.Cell(row, 1).Value = metric;
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 2).Value = value;
        ws.Cell(row, 2).Style.Font.Bold = true;
        ws.Cell(row, 2).Style.Font.FontColor = XLColor.FromHtml("#4F46E5");
        ws.Cell(row, 3).Value = details;
        ws.Cell(row, 3).Style.Font.Italic = true;
        ws.Cell(row, 3).Style.Font.FontColor = XLColor.FromHtml("#64748B");
    }

    private class KpiBox : IComponent
    {
        private readonly string _label;
        private readonly string _value;
        private readonly string _subtext;
        private readonly string _accentColor;

        public KpiBox(string label, string value, string subtext, string accentColor)
        {
            _label = label;
            _value = value;
            _subtext = subtext;
            _accentColor = accentColor;
        }

        public void Compose(IContainer container)
        {
            container
                .Background("#F8FAFC")
                .Border(1)
                .BorderColor("#E2E8F0")
                .Padding(8)
                .Column(col =>
                {
                    col.Item().Text(_label).FontSize(8).FontColor("#64748B").SemiBold();
                    col.Item().PaddingTop(2).Text(_value).FontSize(14).Bold().FontColor(_accentColor);
                    col.Item().Text(_subtext).FontSize(7).FontColor("#94A3B8");
                });
        }
    }

    private async Task<IReadOnlyList<TimeEntry>> FetchEntriesAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken)
    {
        Guid? effectiveUserId = filter.UserId;
        if (!isManagerOrAdmin)
        {
            // Employees can only view their own data
            effectiveUserId = callerUserId;
        }

        return await _timeEntryRepository.GetForReportAsync(
            effectiveUserId,
            filter.ProjectId,
            filter.IsBillable,
            startUtc,
            endUtc,
            cancellationToken);
    }

    private static (DateTime StartUtc, DateTime EndUtc) ResolveDateRange(ReportFilterRequest filter)
    {
        var preset = (filter.Preset ?? "").Trim().ToLowerInvariant();

        if (preset == "weekly")
        {
            var today = DateTime.UtcNow.Date;
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startUtc = DateTime.SpecifyKind(today.AddDays(-diff), DateTimeKind.Utc);
            var endUtc = DateTime.SpecifyKind(startUtc.AddDays(7).AddTicks(-1), DateTimeKind.Utc);
            return (startUtc, endUtc);
        }

        if (preset == "last_month")
        {
            var now = DateTime.UtcNow;
            var firstOfCurrent = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var startUtc = firstOfCurrent.AddMonths(-1);
            var endUtc = firstOfCurrent.AddTicks(-1);
            return (startUtc, endUtc);
        }

        if (preset == "monthly" || (!filter.StartDate.HasValue && !filter.EndDate.HasValue && preset != "custom"))
        {
            var now = DateTime.UtcNow;
            var startUtc = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endUtc = startUtc.AddMonths(1).AddTicks(-1);
            return (startUtc, endUtc);
        }

        var start = filter.StartDate?.ToUniversalTime() ?? DateTime.UtcNow.Date.AddDays(-30);
        var end = filter.EndDate?.ToUniversalTime().Date.AddDays(1).AddTicks(-1) ?? DateTime.UtcNow;
        return (start, end);
    }

    private static bool IsBillableEntry(TimeEntry e) => e.Project != null && e.Project.IsBillable;

    private static ReportSummaryDto BuildSummaryDto(IReadOnlyList<TimeEntry> entries, DateTime startUtc, DateTime endUtc)
    {
        var totalMinutes = entries.Sum(e => e.DurationMinutes);
        var billableMinutes = entries.Where(IsBillableEntry).Sum(e => e.DurationMinutes);
        var nonBillableMinutes = totalMinutes - billableMinutes;
        var billablePercentage = totalMinutes > 0 ? Math.Round((double)billableMinutes / totalMinutes * 100, 1) : 0;
        var totalHoursDecimal = Math.Round(totalMinutes / 60.0, 2);

        // Project Breakdown
        var projectGroups = entries
            .GroupBy(e => e.ProjectId)
            .Select(g =>
            {
                var dur = g.Sum(e => e.DurationMinutes);
                var bill = g.Where(IsBillableEntry).Sum(e => e.DurationMinutes);
                var pct = totalMinutes > 0 ? Math.Round((double)dur / totalMinutes * 100, 1) : 0;
                var proj = g.First().Project;
                return new ProjectReportBreakdownDto(
                    g.Key,
                    proj?.Name ?? "No Project",
                    proj?.ColorHex ?? "#94A3B8",
                    dur,
                    FormatDuration(dur),
                    bill,
                    pct
                );
            })
            .OrderByDescending(p => p.DurationMinutes)
            .ToList();

        // Employee Breakdown
        var employeeGroups = entries
            .GroupBy(e => e.UserId)
            .Select(g =>
            {
                var dur = g.Sum(e => e.DurationMinutes);
                var bill = g.Where(IsBillableEntry).Sum(e => e.DurationMinutes);
                var user = g.First().User;
                return new EmployeeReportBreakdownDto(
                    g.Key,
                    user?.FullName ?? "Unknown",
                    user?.Email ?? "",
                    dur,
                    FormatDuration(dur),
                    bill,
                    g.Count()
                );
            })
            .OrderByDescending(e => e.DurationMinutes)
            .ToList();

        // Daily Trends
        var dailyTrends = entries
            .GroupBy(e => e.StartTimeUtc.Date)
            .OrderBy(g => g.Key)
            .Select(g =>
            {
                var dur = g.Sum(e => e.DurationMinutes);
                return new DailyTrendDto(
                    g.Key.ToString("yyyy-MM-dd"),
                    g.Key.ToString("ddd"),
                    dur,
                    FormatDuration(dur)
                );
            })
            .ToList();

        // Detailed Items
        var dtos = entries.Select(e => new ReportTimeEntryDto(
            e.Id,
            e.StartTimeUtc,
            e.EndTimeUtc,
            e.StartTimeUtc.ToString("yyyy-MM-dd"),
            e.StartTimeUtc.ToString("HH:mm"),
            e.EndTimeUtc.ToString("HH:mm"),
            e.DurationMinutes,
            FormatDuration(e.DurationMinutes),
            e.UserId,
            e.User?.FullName ?? "Unknown",
            e.User?.Email ?? "",
            e.ProjectId,
            e.Project?.Name ?? "No Project",
            e.Project?.ColorHex ?? "#94A3B8",
            e.Description,
            e.Tag,
            IsBillableEntry(e)
        )).ToList();

        return new ReportSummaryDto(
            startUtc,
            endUtc,
            totalMinutes,
            FormatDuration(totalMinutes),
            totalHoursDecimal,
            billableMinutes,
            FormatDuration(billableMinutes),
            billablePercentage,
            nonBillableMinutes,
            FormatDuration(nonBillableMinutes),
            entries.Count,
            projectGroups,
            employeeGroups,
            dailyTrends,
            dtos
        );
    }

    private static string FormatDuration(int minutes)
    {
        var h = minutes / 60;
        var m = minutes % 60;
        return $"{h}h {m:D2}m";
    }

    private static string EscapeCsv(string text)
    {
        if (string.IsNullOrEmpty(text)) return "\"\"";
        return $"\"{text.Replace("\"", "\"\"")}\"";
    }
}
