import { DayGroup } from './DayGroup'
import type { TimeEntryDto, UpdateTimeEntryPayload } from '../../api/timeEntryApi'
import type { ProjectDto } from '../../api/projectApi'

export interface DayGroupData {
  dateLabel: string
  entries: TimeEntryDto[]
}

interface WeekGroupProps {
  weekLabel: string
  totalMinutes: number
  dayGroups: DayGroupData[]
  projects: ProjectDto[]
  onSave: (id: string, payload: UpdateTimeEntryPayload) => Promise<void>
  onDuplicate: (entry: TimeEntryDto) => void
  onDelete: (id: string) => void
}

export function WeekGroup({
  weekLabel,
  totalMinutes,
  dayGroups,
  projects,
  onSave,
  onDuplicate,
  onDelete,
}: WeekGroupProps) {
  const formatTotalTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }

  return (
    <div className="space-y-3">
      {/* Week Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
          {weekLabel}
        </span>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span>Week total:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
            {formatTotalTime(totalMinutes)}
          </span>
        </div>
      </div>

      {/* Days within this Week */}
      <div className="space-y-4 pl-1">
        {dayGroups.map((group) => (
          <DayGroup
            key={group.dateLabel}
            dateLabel={group.dateLabel}
            entries={group.entries}
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
