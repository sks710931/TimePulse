import { TimeEntryRow } from './TimeEntryRow'
import type { TimeEntryDto, UpdateTimeEntryPayload } from '../../api/timeEntryApi'
import type { ProjectDto } from '../../api/projectApi'

interface DayGroupProps {
  dateLabel: string
  entries: TimeEntryDto[]
  projects: ProjectDto[]
  onSave: (id: string, payload: UpdateTimeEntryPayload) => Promise<void>
  onDuplicate: (entry: TimeEntryDto) => void
  onDelete: (id: string) => void
}

export function DayGroup({
  dateLabel,
  entries,
  projects,
  onSave,
  onDuplicate,
  onDelete,
}: DayGroupProps) {
  const totalMinutes = entries.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0)

  const formatTotalTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }

  return (
    <div className="space-y-1">
      {/* Day Group Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 dark:bg-slate-800/40 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{dateLabel}</span>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>Total:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {formatTotalTime(totalMinutes)}
          </span>
        </div>
      </div>

      {/* List of Entries for this Day */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
        {entries.map((entry) => (
          <TimeEntryRow
            key={entry.id}
            entry={entry}
            projects={projects}
            onSave={onSave}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
