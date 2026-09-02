import { useState, useRef, useEffect } from 'react'
import { Tag, DollarSign, Play, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { TimeEntryDto } from '../../api/timeEntryApi'

interface TimeEntryRowProps {
  entry: TimeEntryDto
  onDuplicate: (entry: TimeEntryDto) => void
  onEdit: (entry: TimeEntryDto) => void
  onDelete: (id: string) => void
}

export function TimeEntryRow({
  entry,
  onDuplicate,
  onEdit,
  onDelete,
}: TimeEntryRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const formatTimeOnly = (isoString: string) => {
    const d = new Date(isoString)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const formatDuration = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors text-xs">
      {/* Left Details: Description + Project */}
      <div className="flex-1 flex flex-wrap items-center gap-3 min-w-0">
        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[280px]">
          {entry.description || <span className="text-slate-400 italic">No description</span>}
        </span>

        {/* Project Tag */}
        {entry.projectName ? (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.projectColorHex || '#0284c7' }}
            />
            <span className="truncate max-w-[140px]">{entry.projectName}</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-600 text-[11px]">—</span>
        )}
      </div>

      {/* Middle/Right: Tag, Billable, Time range, Duration, Duplicate, Menu */}
      <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
        {/* Tag */}
        {entry.tag ? (
          <div className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-900/40">
            <Tag className="w-3 h-3" />
            <span className="truncate max-w-[90px]">{entry.tag}</span>
          </div>
        ) : (
          <Tag className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
        )}

        {/* Billable */}
        <DollarSign
          className={`w-3.5 h-3.5 ${
            entry.isBillable
              ? 'text-sky-500 font-bold'
              : 'text-slate-300 dark:text-slate-700'
          }`}
        />

        {/* Time Range */}
        <span className="font-mono text-slate-500 dark:text-slate-400 text-xs tracking-tight">
          {formatTimeOnly(entry.startTimeUtc)} - {formatTimeOnly(entry.endTimeUtc)}
        </span>

        {/* Duration */}
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs w-16 text-right">
          {formatDuration(entry.durationMinutes)}
        </span>

        {/* Duplicate / Re-add icon (Play style) */}
        <button
          type="button"
          onClick={() => onDuplicate(entry)}
          title="Reuse this time entry"
          className="p-1.5 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5" />
        </button>

        {/* 3-dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Options"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-75">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  onEdit(entry)
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-slate-400" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  onDelete(entry.id)
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
