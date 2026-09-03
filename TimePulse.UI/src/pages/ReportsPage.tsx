import { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '../store/hooks'
import { reportApi, type ReportSummary, type ReportFilterParams } from '../api/reportApi'
import { projectApi, type ProjectDto } from '../api/projectApi'
import { userApi, type UserItemDto } from '../api/userApi'
import { ReportFilterBar } from '../components/reports/ReportFilterBar'
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards'
import { ReportBreakdown } from '../components/reports/ReportBreakdown'
import { ReportEntriesTable } from '../components/reports/ReportEntriesTable'
import { AlertCircle } from 'lucide-react'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getPresetDates(preset: 'weekly' | 'monthly' | 'last_month'): { start: string; end: string } {
  const now = new Date()

  if (preset === 'weekly') {
    const day = now.getDay()
    const diff = (day + 6) % 7 // Monday = 0
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { start: formatDate(monday), end: formatDate(sunday) }
  }

  if (preset === 'last_month') {
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    return { start: formatDate(firstOfLastMonth), end: formatDate(lastOfLastMonth) }
  }

  // Monthly (current month)
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start: formatDate(firstOfMonth), end: formatDate(lastOfMonth) }
}

export function ReportsPage() {
  const { user } = useAppSelector((state) => state.auth)

  const isManagerOrAdmin = Boolean(
    user?.roles?.some((r) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'manager')
  )

  const initialDates = getPresetDates('monthly')
  const [preset, setPreset] = useState<'weekly' | 'monthly' | 'last_month' | 'custom'>('monthly')
  const [startDate, setStartDate] = useState(initialDates.start)
  const [endDate, setEndDate] = useState(initialDates.end)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [billableFilter, setBillableFilter] = useState<'all' | 'billable' | 'non_billable'>('all')

  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const [projectsList, setProjectsList] = useState<ProjectDto[]>([])
  const [usersList, setUsersList] = useState<UserItemDto[]>([])

  // Load auxiliary lists (projects and users)
  useEffect(() => {
    projectApi.getProjects()
      .then(setProjectsList)
      .catch((err) => console.error('Failed to load projects for reports:', err))

    if (isManagerOrAdmin) {
      userApi.getUsers()
        .then(setUsersList)
        .catch((err) => console.error('Failed to load users for reports:', err))
    }
  }, [isManagerOrAdmin])

  const loadReportData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params: ReportFilterParams = {
        preset: preset !== 'custom' ? preset : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: isManagerOrAdmin && selectedUserId ? selectedUserId : undefined,
        projectId: selectedProjectId || undefined,
        isBillable:
          billableFilter === 'billable'
            ? true
            : billableFilter === 'non_billable'
            ? false
            : undefined,
      }

      const data = await reportApi.getReportSummary(params)
      setSummary(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate report'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [preset, startDate, endDate, selectedUserId, selectedProjectId, billableFilter, isManagerOrAdmin])

  useEffect(() => {
    loadReportData()
  }, [loadReportData])

  const handleSelectPreset = (newPreset: 'weekly' | 'monthly' | 'last_month' | 'custom') => {
    setPreset(newPreset)
    if (newPreset !== 'custom') {
      const { start, end } = getPresetDates(newPreset)
      setStartDate(start)
      setEndDate(end)
    }
  }

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    setIsExporting(format)
    try {
      const params: ReportFilterParams = {
        preset: preset !== 'custom' ? preset : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: isManagerOrAdmin && selectedUserId ? selectedUserId : undefined,
        projectId: selectedProjectId || undefined,
        isBillable:
          billableFilter === 'billable'
            ? true
            : billableFilter === 'non_billable'
            ? false
            : undefined,
      }

      await reportApi.downloadExport(format, params)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to export ${format.toUpperCase()}`
      alert(msg)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Time & Productivity Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isManagerOrAdmin
            ? 'Monitor, analyze, and export time logs across all projects and team members.'
            : 'Track, analyze, and export your personal time entries across assigned projects.'}
        </p>
      </div>

      {/* Filter Bar */}
      <ReportFilterBar
        preset={preset}
        onSelectPreset={handleSelectPreset}
        startDate={startDate}
        endDate={endDate}
        onChangeStartDate={(val) => {
          setStartDate(val)
          setPreset('custom')
        }}
        onChangeEndDate={(val) => {
          setEndDate(val)
          setPreset('custom')
        }}
        selectedUserId={selectedUserId}
        onChangeUserId={setSelectedUserId}
        selectedProjectId={selectedProjectId}
        onChangeProjectId={setSelectedProjectId}
        billableFilter={billableFilter}
        onChangeBillableFilter={setBillableFilter}
        isManagerOrAdmin={isManagerOrAdmin}
        usersList={usersList}
        projectsList={projectsList}
        onExport={handleExport}
        isExporting={isExporting}
        onRefresh={loadReportData}
        isLoading={isLoading}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Highlight Summary Cards */}
      <ReportSummaryCards summary={summary} isLoading={isLoading} />

      {/* Visual Breakdowns (Project & Team) */}
      <ReportBreakdown summary={summary} isManagerOrAdmin={isManagerOrAdmin} />

      {/* Detailed Entries Table */}
      <ReportEntriesTable entries={summary?.entries || []} isManagerOrAdmin={isManagerOrAdmin} />
    </div>
  )
}
