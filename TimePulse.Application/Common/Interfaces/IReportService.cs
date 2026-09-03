using TimePulse.Application.Reports;

namespace TimePulse.Application.Common.Interfaces;

public interface IReportService
{
    Task<ReportSummaryDto> GetReportSummaryAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default);

    Task<(byte[] Content, string FileName, string ContentType)> ExportCsvAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default);

    Task<(byte[] Content, string FileName, string ContentType)> ExportExcelAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default);

    Task<(byte[] Content, string FileName, string ContentType)> ExportPdfAsync(
        Guid callerUserId,
        bool isManagerOrAdmin,
        ReportFilterRequest filter,
        CancellationToken cancellationToken = default);
}
