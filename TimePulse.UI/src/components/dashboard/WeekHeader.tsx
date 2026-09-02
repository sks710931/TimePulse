import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekHeaderProps {
  startDate: Date
  endDate: Date
  totalDurationMinutes: number
  onPreviousWeek: () => void
  onNextWeek: () => void
  onCurrentWeek: () => void
  isCurrentWeek: boolean
}

export function WeekHeader({
  startDate,
  endDate,
  totalDurationMinutes,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek,
}: WeekHeaderProps) {
  const formatRange = () => {
    const startStr = startDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    const endStr = endDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
    return `${startStr} - ${endStr}`
  }

  const formatTotalTime = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-3 text-xs border-b border-slate-200 dark:border-slate-800">
      {/* Date Range & Navigation */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={onPreviousWeek}
            title="Previous Week"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            title="Next Week"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border-l border-slate-200 dark:border-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-tight">
          {formatRange()}
        </span>

        {!isCurrentWeek && (
          <button
            type="button"
            onClick={onCurrentWeek}
            className="px-2.5 py-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-md transition-colors cursor-pointer"
          >
            This week
          </button>
        )}
      </div>

      {/* Week Total */}
      <div className="flex items-center gap-2 self-end sm:self-auto text-slate-500 dark:text-slate-400 font-medium">
        <span>Week total:</span>
        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
          {formatTotalTime(totalDurationMinutes)}
        </span>
      </div>
    </div>
  )
}
