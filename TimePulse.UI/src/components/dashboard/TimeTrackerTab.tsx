import { useState, useEffect, useCallback, useMemo } from 'react'
import { ManualEntryBar } from './ManualEntryBar'
import { WeekGroup, type DayGroupData } from './WeekGroup'
import { PaginationControls } from './PaginationControls'
import { ToastContainer, useToast } from '../common/Toast'
import { Alert } from '../common/Alert'
import { Loader2, Calendar } from 'lucide-react'
import { timeEntryApi, type TimeEntryDto, type CreateTimeEntryPayload, type UpdateTimeEntryPayload } from '../../api/timeEntryApi'
import { projectApi, type ProjectDto } from '../../api/projectApi'

interface FormattedWeekGroup {
  weekKey: string
  weekLabel: string
  totalMinutes: number
  dayGroups: DayGroupData[]
}

export function TimeTrackerTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [entries, setEntries] = useState<TimeEntryDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toasts, addToast, removeToast } = useToast()

  const fetchEntries = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    setError(null)
    try {
      const res = await timeEntryApi.getTimeEntries(page, pageSize)
      setEntries(res.items)
      setTotalCount(res.totalCount)
      setTotalPages(res.totalPages)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries.')
    } finally {
      if (!quiet) setIsLoading(false)
    }
  }, [page, pageSize])

  // Initial load of projects
  useEffect(() => {
    projectApi
      .getProjects()
      .then((projs) => setProjects(projs))
      .catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Continuously group entries by Week, then by Day
  const continuousWeekGroups = useMemo<FormattedWeekGroup[]>(() => {
    if (entries.length === 0) return []

    const todayStr = new Date().toDateString()
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString()

    // Helper to get Monday of the given date
    const getMonday = (d: Date) => {
      const date = new Date(d)
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const mon = new Date(date.setDate(diff))
      mon.setHours(0, 0, 0, 0)
      return mon
    }

    const weeksMap = new Map<
      string,
      {
        weekLabel: string
        totalMinutes: number
        daysMap: Map<string, { dateLabel: string; entries: TimeEntryDto[] }>
      }
    >()

    for (const entry of entries) {
      const entryDate = new Date(entry.startTimeUtc)
      const monday = getMonday(entryDate)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const weekKey = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`

      if (!weeksMap.has(weekKey)) {
        const startStr = monday.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })
        const endStr = sunday.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: monday.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        })
        const weekLabel = `${startStr} - ${endStr}`

        weeksMap.set(weekKey, {
          weekLabel,
          totalMinutes: 0,
          daysMap: new Map(),
        })
      }

      const weekData = weeksMap.get(weekKey)!
      weekData.totalMinutes += entry.durationMinutes || 0

      // Day grouping inside this week
      const dateKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`

      if (!weekData.daysMap.has(dateKey)) {
        let dateLabel = entryDate.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        if (entryDate.toDateString() === todayStr) {
          dateLabel = `Today, ${entryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        } else if (entryDate.toDateString() === yesterdayStr) {
          dateLabel = `Yesterday, ${entryDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        }

        weekData.daysMap.set(dateKey, {
          dateLabel,
          entries: [],
        })
      }

      weekData.daysMap.get(dateKey)!.entries.push(entry)
    }

    // Convert map to ordered array
    const result: FormattedWeekGroup[] = []
    weeksMap.forEach((weekData, weekKey) => {
      const dayGroups: DayGroupData[] = []
      weekData.daysMap.forEach((dayData) => {
        dayGroups.push({
          dateLabel: dayData.dateLabel,
          entries: dayData.entries,
        })
      })

      result.push({
        weekKey,
        weekLabel: weekData.weekLabel,
        totalMinutes: weekData.totalMinutes,
        dayGroups,
      })
    })

    return result
  }, [entries])

  const handleAddEntry = async (payload: CreateTimeEntryPayload) => {
    setError(null)
    try {
      await timeEntryApi.createTimeEntry(payload)
      addToast('Time entry added successfully')
      if (page !== 1) {
        setPage(1)
      } else {
        await fetchEntries()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add time entry.'
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const handleSaveInline = async (id: string, payload: UpdateTimeEntryPayload) => {
    try {
      await timeEntryApi.updateTimeEntry(id, payload)
      addToast('Time entry saved')
      await fetchEntries(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes.'
      addToast(msg, 'error')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return
    }
    setError(null)
    try {
      await timeEntryApi.deleteTimeEntry(id)
      addToast('Time entry deleted')
      await fetchEntries(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete time entry.'
      setError(msg)
      addToast(msg, 'error')
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Manual Time Entry Bar */}
      <ManualEntryBar
        projects={projects}
        onAddEntry={handleAddEntry}
      />

      {error && <Alert type="error" message={error} />}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-6">
        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            <span className="text-xs">Loading time entries...</span>
          </div>
        ) : continuousWeekGroups.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              No time entries found.
            </div>
            <p>Use the bar above to add your first time entry.</p>
          </div>
        ) : (
          /* Continuous List of Weeks -> Days -> Tasks */
          <div className="space-y-8">
            {continuousWeekGroups.map((weekGroup) => (
              <WeekGroup
                key={weekGroup.weekKey}
                weekLabel={weekGroup.weekLabel}
                totalMinutes={weekGroup.totalMinutes}
                dayGroups={weekGroup.dayGroups}
                projects={projects}
                onSave={handleSaveInline}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <PaginationControls
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[50, 100, 200, 500]}
        />
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  )
}
