import { apiClient, apiFetch } from './apiClient'

export interface ReportFilterParams {
  preset?: 'weekly' | 'monthly' | 'last_month' | 'custom'
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  userId?: string
  projectId?: string
  isBillable?: boolean
}

export interface ProjectReportBreakdown {
  projectId?: string | null
  projectName: string
  colorHex: string
  durationMinutes: number
  hoursFormatted: string
  billableMinutes: number
  percentageOfTotal: number
}

export interface EmployeeReportBreakdown {
  userId: string
  fullName: string
  email: string
  durationMinutes: number
  hoursFormatted: string
  billableMinutes: number
  entryCount: number
  leavesTaken?: number
}

export interface DailyTrend {
  date: string
  dayOfWeek: string
  durationMinutes: number
  hoursFormatted: string
}

export interface ReportTimeEntry {
  id: string
  startTimeUtc: string
  endTimeUtc: string
  dateFormatted: string
  startTimeFormatted: string
  endTimeFormatted: string
  durationMinutes: number
  durationFormatted: string
  userId: string
  userName: string
  userEmail: string
  projectId?: string | null
  projectName: string
  projectColor: string
  description: string
  tag?: string | null
  isBillable: boolean
}

export interface ReportSummary {
  startDateUtc: string
  endDateUtc: string
  totalDurationMinutes: number
  totalHoursFormatted: string
  totalHoursDecimal: number
  billableDurationMinutes: number
  billableHoursFormatted: string
  billablePercentage: number
  nonBillableDurationMinutes: number
  nonBillableHoursFormatted: string
  totalEntriesCount: number
  totalLeavesTaken?: number
  projects: ProjectReportBreakdown[]
  employees: EmployeeReportBreakdown[]
  dailyTrends: DailyTrend[]
  entries: ReportTimeEntry[]
}

function buildQueryString(params: ReportFilterParams): string {
  const query = new URLSearchParams()
  if (params.preset) query.append('preset', params.preset)
  if (params.startDate) query.append('startDate', params.startDate)
  if (params.endDate) query.append('endDate', params.endDate)
  if (params.userId) query.append('userId', params.userId)
  if (params.projectId) query.append('projectId', params.projectId)
  if (params.isBillable !== undefined && params.isBillable !== null) {
    query.append('isBillable', String(params.isBillable))
  }
  return query.toString()
}

export const reportApi = {
  async getReportSummary(params: ReportFilterParams): Promise<ReportSummary> {
    const qs = buildQueryString(params)
    return apiClient.get<ReportSummary>(`/api/reports/summary${qs ? `?${qs}` : ''}`)
  },

  async downloadExport(format: 'excel' | 'csv' | 'pdf', params: ReportFilterParams): Promise<void> {
    const qs = buildQueryString(params)
    const url = `/api/reports/export/${format}${qs ? `?${qs}` : ''}`
    const defaultExtension = format === 'excel' ? 'xlsx' : format
    const defaultFilename = `TimePulse_Report.${defaultExtension}`

    const res = await apiFetch(url, { method: 'GET' })
    if (!res.ok) {
      throw new Error(`Export failed with status ${res.status}`)
    }

    const blob = await res.blob()
    let filename = defaultFilename
    const disposition = res.headers.get('content-disposition')
    if (disposition && disposition.includes('filename=')) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(downloadUrl)
  },
}
