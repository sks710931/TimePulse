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
        wsSummary.Range("A1:I1").Merge();
        wsSummary.Cell("A1").Value = "TimePulse - Consolidated Employee Summary Report";
        wsSummary.Cell("A1").Style.Font.Bold = true;
        wsSummary.Cell("A1").Style.Font.FontSize = 14;
        wsSummary.Cell("A1").Style.Font.FontColor = XLColor.White;
        wsSummary.Cell("A1").Style.Fill.BackgroundColor = XLColor.FromHtml("#4F46E5"); // Indigo
        wsSummary.Cell("A1").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        wsSummary.Cell("A1").Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        wsSummary.Row(1).Height = 30;

        // Metadata Subtitle
        wsSummary.Range("A2:I2").Merge();
        wsSummary.Cell("A2").Value = $"Date Range: {startUtc:yyyy-MM-dd} to {endUtc:yyyy-MM-dd} UTC  |  Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC";
        wsSummary.Cell("A2").Style.Font.Italic = true;
        wsSummary.Cell("A2").Style.Font.FontSize = 10;
        wsSummary.Cell("A2").Style.Font.FontColor = XLColor.FromHtml("#64748B");
        wsSummary.Cell("A2").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        wsSummary.Row(2).Height = 20;

        // Row 3: Spacing
        wsSummary.Row(3).Height = 10;

        // Table Headers (Row 4)
        var summaryHeaders = new[]
        {
            "Name of Employee",
            "Projects Employee part of",
            "Project Code",
            "Total Hrs (Decimal)",
            "Total Billable",
            "Total Non Billable",
            "Total Hrs",
            "% of Billed Hrs",
            "List of Non-Duplicate Tasks"
        };

        for (int i = 0; i < summaryHeaders.Length; i++)
        {
            wsSummary.Cell(4, i + 1).Value = summaryHeaders[i];
        }

        var summaryHeaderRange = wsSummary.Range(4, 1, 4, summaryHeaders.Length);
        summaryHeaderRange.Style.Font.Bold = true;
        summaryHeaderRange.Style.Font.FontSize = 10;
        summaryHeaderRange.Style.Font.FontColor = XLColor.White;
        summaryHeaderRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#3730A3"); // Deep Indigo
        summaryHeaderRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        summaryHeaderRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
        wsSummary.Row(4).Height = 26;

        var currentRow = 5;

        // Group entries by Employee
        var employeeGroups = entries
            .GroupBy(e => e.UserId)
            .OrderBy(g => g.First().User?.FullName ?? "")
            .ToList();

        if (employeeGroups.Count == 0)
        {
            wsSummary.Range(5, 1, 5, 9).Merge();
            wsSummary.Cell(5, 1).Value = "No time entries found for the selected date range.";
            wsSummary.Cell(5, 1).Style.Font.Italic = true;
            wsSummary.Cell(5, 1).Style.Font.FontColor = XLColor.FromHtml("#64748B");
            wsSummary.Cell(5, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            currentRow = 6;
        }
        else
        {
            int empIndex = 0;
            foreach (var empGroup in employeeGroups)
            {
                var empName = empGroup.First().User?.FullName ?? "Unknown";
                var empEntries = empGroup.ToList();
                var empTotalMinutes = empEntries.Sum(e => e.DurationMinutes);
                var empBillableMinutes = empEntries.Where(IsBillableEntry).Sum(e => e.DurationMinutes);
                var empNonBillableMinutes = empTotalMinutes - empBillableMinutes;

                var empTotalHoursDec = Math.Round(empTotalMinutes / 60.0, 2);
                var empBillableHoursDec = Math.Round(empBillableMinutes / 60.0, 2);
                var empNonBillableHoursDec = Math.Round(empNonBillableMinutes / 60.0, 2);
                var empBilledPct = empTotalMinutes > 0 ? (double)empBillableMinutes / empTotalMinutes : 0.0;

                // Group by project for this employee
                var projectGroups = empEntries
                    .GroupBy(e => e.ProjectId)
                    .OrderByDescending(g => g.Sum(e => e.DurationMinutes))
                    .ToList();

                var projectCount = Math.Max(1, projectGroups.Count);
                var empStartRow = currentRow;
                var empEndRow = currentRow + projectCount - 1;
                var zebraBg = (empIndex % 2 == 1) ? XLColor.FromHtml("#F8FAFC") : XLColor.White;

                for (int p = 0; p < projectCount; p++)
                {
                    var r = empStartRow + p;
                    var projGroup = p < projectGroups.Count ? projectGroups[p] : null;

                    var projName = projGroup?.First().Project?.Name ?? "No Project";
                    var projCode = projGroup?.First().Project?.Code ?? "-";
                    var projMinutes = projGroup?.Sum(e => e.DurationMinutes) ?? 0;
                    var projHoursDec = Math.Round(projMinutes / 60.0, 2);

                    var uniqueTasks = projGroup != null
                        ? projGroup
                            .Select(e => e.Description?.Trim())
                            .Where(d => !string.IsNullOrWhiteSpace(d))
                            .OfType<string>()
                            .Distinct()
                            .ToList()
                        : new List<string>();

                    var tasksDisplay = uniqueTasks.Count > 0 ? string.Join(Environment.NewLine, uniqueTasks) : "-";

                    // Column B: Project Name
                    wsSummary.Cell(r, 2).Value = projName;
                    wsSummary.Cell(r, 2).Style.Font.Bold = true;
                    wsSummary.Cell(r, 2).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Column C: Project Code
                    wsSummary.Cell(r, 3).Value = projCode;
                    wsSummary.Cell(r, 3).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    wsSummary.Cell(r, 3).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Column D: Total hrs (decimal) for each project
                    wsSummary.Cell(r, 4).Value = projHoursDec;
                    wsSummary.Cell(r, 4).Style.NumberFormat.Format = "0.00";
                    wsSummary.Cell(r, 4).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    wsSummary.Cell(r, 4).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Column I: List of non duplicate tasks
                    wsSummary.Cell(r, 9).Value = tasksDisplay;
                    wsSummary.Cell(r, 9).Style.Alignment.WrapText = true;
                    wsSummary.Cell(r, 9).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                    // Row background & borders
                    var rowRange = wsSummary.Range(r, 1, r, 9);
                    rowRange.Style.Fill.BackgroundColor = zebraBg;
                    rowRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                    rowRange.Style.Border.InsideBorderColor = XLColor.FromHtml("#E2E8F0");
                    rowRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    rowRange.Style.Border.OutsideBorderColor = XLColor.FromHtml("#CBD5E1");
                }

                // If multiple projects, merge employee-level columns vertically
                if (projectCount > 1)
                {
                    wsSummary.Range(empStartRow, 1, empEndRow, 1).Merge();
                    wsSummary.Range(empStartRow, 5, empEndRow, 5).Merge();
                    wsSummary.Range(empStartRow, 6, empEndRow, 6).Merge();
                    wsSummary.Range(empStartRow, 7, empEndRow, 7).Merge();
                    wsSummary.Range(empStartRow, 8, empEndRow, 8).Merge();
                }

                // Column A: Name of Employee
                wsSummary.Cell(empStartRow, 1).Value = empName;
                wsSummary.Cell(empStartRow, 1).Style.Font.Bold = true;
                wsSummary.Cell(empStartRow, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Column E: Total Billable
                wsSummary.Cell(empStartRow, 5).Value = empBillableHoursDec;
                wsSummary.Cell(empStartRow, 5).Style.NumberFormat.Format = "0.00";
                wsSummary.Cell(empStartRow, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                wsSummary.Cell(empStartRow, 5).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Column F: Total Non Billable
                wsSummary.Cell(empStartRow, 6).Value = empNonBillableHoursDec;
                wsSummary.Cell(empStartRow, 6).Style.NumberFormat.Format = "0.00";
                wsSummary.Cell(empStartRow, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                wsSummary.Cell(empStartRow, 6).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Column G: Total hrs
                wsSummary.Cell(empStartRow, 7).Value = empTotalHoursDec;
                wsSummary.Cell(empStartRow, 7).Style.NumberFormat.Format = "0.00";
                wsSummary.Cell(empStartRow, 7).Style.Font.Bold = true;
                wsSummary.Cell(empStartRow, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                wsSummary.Cell(empStartRow, 7).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Column H: % of billed hrs of total hrs
                wsSummary.Cell(empStartRow, 8).Value = empBilledPct;
                wsSummary.Cell(empStartRow, 8).Style.NumberFormat.Format = "0.0%";
                wsSummary.Cell(empStartRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                wsSummary.Cell(empStartRow, 8).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                currentRow = empEndRow + 1;
                empIndex++;
            }

            // Grand Total Row
            wsSummary.Range(currentRow, 1, currentRow, 3).Merge();
            wsSummary.Cell(currentRow, 1).Value = "Grand Total";
            wsSummary.Cell(currentRow, 1).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            wsSummary.Cell(currentRow, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            // Column D: Sum of all project decimal hours
            wsSummary.Cell(currentRow, 4).FormulaA1 = $"=SUM(D5:D{currentRow - 1})";
            wsSummary.Cell(currentRow, 4).Style.NumberFormat.Format = "0.00";
            wsSummary.Cell(currentRow, 4).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 4).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            // Column E: Grand Billable
            var grandBillableHours = Math.Round(entries.Where(IsBillableEntry).Sum(e => e.DurationMinutes) / 60.0, 2);
            wsSummary.Cell(currentRow, 5).Value = grandBillableHours;
            wsSummary.Cell(currentRow, 5).Style.NumberFormat.Format = "0.00";
            wsSummary.Cell(currentRow, 5).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            // Column F: Grand Non-Billable
            var grandTotalMinutes = entries.Sum(e => e.DurationMinutes);
            var grandNonBillableHours = Math.Round((grandTotalMinutes - entries.Where(IsBillableEntry).Sum(e => e.DurationMinutes)) / 60.0, 2);
            wsSummary.Cell(currentRow, 6).Value = grandNonBillableHours;
            wsSummary.Cell(currentRow, 6).Style.NumberFormat.Format = "0.00";
            wsSummary.Cell(currentRow, 6).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            // Column G: Grand Total Hours
            var grandTotalHours = Math.Round(grandTotalMinutes / 60.0, 2);
            wsSummary.Cell(currentRow, 7).Value = grandTotalHours;
            wsSummary.Cell(currentRow, 7).Style.NumberFormat.Format = "0.00";
            wsSummary.Cell(currentRow, 7).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            // Column H: Overall % Billed
            var grandBilledPct = grandTotalMinutes > 0 ? (double)entries.Where(IsBillableEntry).Sum(e => e.DurationMinutes) / grandTotalMinutes : 0.0;
            wsSummary.Cell(currentRow, 8).Value = grandBilledPct;
            wsSummary.Cell(currentRow, 8).Style.NumberFormat.Format = "0.0%";
            wsSummary.Cell(currentRow, 8).Style.Font.Bold = true;
            wsSummary.Cell(currentRow, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

            // Column I: Empty for grand total
            wsSummary.Cell(currentRow, 9).Value = "";

            var totalRowRange = wsSummary.Range(currentRow, 1, currentRow, 9);
            totalRowRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#E0E7FF"); // Light Indigo
            totalRowRange.Style.Border.TopBorder = XLBorderStyleValues.Medium;
            totalRowRange.Style.Border.TopBorderColor = XLColor.FromHtml("#4F46E5");
            totalRowRange.Style.Border.BottomBorder = XLBorderStyleValues.Double;
            totalRowRange.Style.Border.BottomBorderColor = XLColor.FromHtml("#4F46E5");
            wsSummary.Row(currentRow).Height = 24;
        }

        // Column Widths
        wsSummary.Column(1).Width = 24;
        wsSummary.Column(2).Width = 26;
        wsSummary.Column(3).Width = 15;
        wsSummary.Column(4).Width = 18;
        wsSummary.Column(5).Width = 16;
        wsSummary.Column(6).Width = 18;
        wsSummary.Column(7).Width = 16;
        wsSummary.Column(8).Width = 20;
        wsSummary.Column(9).Width = 45;

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
