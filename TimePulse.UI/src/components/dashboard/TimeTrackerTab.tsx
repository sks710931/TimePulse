import { useState, useEffect, useCallback, useMemo } from 'react'
import { ManualEntryBar } from './ManualEntryBar'
import { WeekHeader } from './WeekHeader'
import { DayGroup } from './DayGroup'
import { EditTimeEntryModal } from './EditTimeEntryModal'
import { Alert } from '../common/Alert'
import { Loader2, Calendar } from 'lucide-react'
import { timeEntryApi, type TimeEntryDto, type CreateTimeEntryPayload, type UpdateTimeEntryPayload } from '../../api/timeEntryApi'
import { projectApi, type ProjectDto } from '../../api/projectApi'

export function TimeTrackerTab() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [entries, setEntries] = useState<TimeEntryDto[]>([])
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntryDto | null>(null)
  const [duplicatePreset, setDuplicatePreset] = useState<{
    description?: string
    projectId?: string | null
    isBillable?: boolean
    tag?: string | null
  } | null>(null)

  // Calculate Monday to Sunday date range for the current weekOffset
  const { start: weekStart, end: weekEnd } = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDay()
    // In JS, Sunday is 0. If Sunday, go back 6 days to Monday, otherwise subtract (currentDay - 1)
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(now)
    monday.setDate(now.getDate() + distanceToMonday + weekOffset * 7)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    return { start: monday, end: sunday }
  }, [weekOffset])

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await timeEntryApi.getTimeEntries(
        weekStart.toISOString(),
        weekEnd.toISOString()
      )
      setEntries(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load time entries.')
    } finally {
      setIsLoading(false)
    }
  }, [weekStart, weekEnd])

  // Initial load of projects and entries
  useEffect(() => {
    projectApi
      .getProjects()
      .then((projs) => setProjects(projs))
      .catch(() => setProjects([]))
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Total duration in minutes for the week
  const weekTotalMinutes = useMemo(() => {
    return entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0)
  }, [entries])

  // Group entries by day (date formatted YYYY-MM-DD)
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: { label: string; date: Date; entries: TimeEntryDto[] } } = {}

    const todayStr = new Date().toDateString()
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString()

    // Sort entries descending
    const sorted = [...entries].sort(
      (a, b) => new Date(b.startTimeUtc).getTime() - new Date(a.startTimeUtc).getTime()
    )

    for (const entry of sorted) {
      const d = new Date(entry.startTimeUtc)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

      if (!groups[dateKey]) {
        let label = d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        if (d.toDateString() === todayStr) {
          label = `Today, ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        } else if (d.toDateString() === yesterdayStr) {
          label = `Yesterday, ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        }

        groups[dateKey] = {
          label,
          date: d,
          entries: [],
        }
      }

      groups[dateKey].entries.push(entry)
    }

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a)) // Latest date first
      .map((k) => groups[k])
  }, [entries])

  const handleAddEntry = async (payload: CreateTimeEntryPayload) => {
    setError(null)
    try {
      await timeEntryApi.createTimeEntry(payload)
      await fetchEntries()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add time entry.')
    }
  }

  const handleDuplicate = (entry: TimeEntryDto) => {
    setDuplicatePreset({
      description: entry.description,
      projectId: entry.projectId,
      isBillable: entry.isBillable,
      tag: entry.tag,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSaveEdit = async (id: string, payload: UpdateTimeEntryPayload) => {
    await timeEntryApi.updateTimeEntry(id, payload)
    await fetchEntries()
  }

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return
    }
    setError(null)
    try {
      await timeEntryApi.deleteTimeEntry(id)
      await fetchEntries()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete time entry.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Manual Time Entry Bar */}
      <ManualEntryBar
        projects={projects}
        onAddEntry={handleAddEntry}
        initialData={duplicatePreset}
      />

      {error && <Alert type="error" message={error} />}

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Week Header with Navigation & Week Total */}
        <WeekHeader
          startDate={weekStart}
          endDate={weekEnd}
          totalDurationMinutes={weekTotalMinutes}
          onPreviousWeek={() => setWeekOffset((prev) => prev - 1)}
          onNextWeek={() => setWeekOffset((prev) => prev + 1)}
          onCurrentWeek={() => setWeekOffset(0)}
          isCurrentWeek={weekOffset === 0}
        />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            <span className="text-xs">Loading time entries...</span>
          </div>
        ) : groupedEntries.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              No time entries recorded for this week.
            </div>
            <p>Use the bar above to add your first time entry.</p>
          </div>
        ) : (
          /* Day Groups List */
          <div className="space-y-5 pt-2">
            {groupedEntries.map((group) => (
              <DayGroup
                key={group.label}
                dateLabel={group.label}
                entries={group.entries}
                onDuplicate={handleDuplicate}
                onEdit={(entry) => setEditingEntry(entry)}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Entry Modal */}
      <EditTimeEntryModal
        isOpen={Boolean(editingEntry)}
        entry={editingEntry}
        projects={projects}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
