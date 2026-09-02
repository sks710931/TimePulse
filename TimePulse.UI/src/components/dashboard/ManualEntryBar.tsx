import { useState, useEffect, useRef } from 'react'
import { Tag, Calendar, Loader2 } from 'lucide-react'
import { ProjectPickerDropdown } from './ProjectPickerDropdown'
import type { ProjectDto } from '../../api/projectApi'
import type { CreateTimeEntryPayload } from '../../api/timeEntryApi'

interface ManualEntryBarProps {
  projects: ProjectDto[]
  onAddEntry: (payload: CreateTimeEntryPayload) => Promise<void>
}

export function ManualEntryBar({
  projects,
  onAddEntry,
}: ManualEntryBarProps) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [tag, setTag] = useState<string>('')
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)

  // Today formatted as YYYY-MM-DD for date input
  const getTodayDateString = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }

  const [dateStr, setDateStr] = useState(getTodayDateString())
  const [startTimeStr, setStartTimeStr] = useState('09:00')
  const [endTimeStr, setEndTimeStr] = useState('10:00')
  const [durationStr, setDurationStr] = useState('01:00:00')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const tagRef = useRef<HTMLDivElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const openDatePicker = () => {
    try {
      dateInputRef.current?.showPicker()
    } catch {
      dateInputRef.current?.focus()
    }
  }

  // Click outside to close tag popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setIsTagPopoverOpen(false)
      }
    }
    if (isTagPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTagPopoverOpen])

  // Recalculate duration whenever start or end time changes
  useEffect(() => {
    const [startH, startM] = startTimeStr.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)

    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      let diffMinutes = endH * 60 + endM - (startH * 60 + startM)
      if (diffMinutes < 0) diffMinutes = 0 // same-day constraint

      const hrs = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      setDurationStr(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`)
    }
  }, [startTimeStr, endTimeStr])

  const handleDurationChange = (newDurationStr: string) => {
    setDurationStr(newDurationStr)
    const parts = newDurationStr.split(':').map(Number)
    let totalMinutes = 0

    if (parts.length === 3 && !parts.some(isNaN)) {
      totalMinutes = parts[0] * 60 + parts[1] + Math.round(parts[2] / 60)
    } else if (parts.length === 2 && !parts.some(isNaN)) {
      totalMinutes = parts[0] * 60 + parts[1]
    } else {
      const num = parseInt(newDurationStr, 10)
      if (!isNaN(num)) totalMinutes = num
    }

    if (totalMinutes >= 0) {
      const [startH, startM] = startTimeStr.split(':').map(Number)
      if (!isNaN(startH) && !isNaN(startM)) {
        const endTotal = startH * 60 + startM + totalMinutes
        const endH = Math.min(23, Math.floor(endTotal / 60))
        const endM = endTotal % 60
        setEndTimeStr(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`)
      }
    }
  }

  const handleAdd = async () => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const [startH, startM] = startTimeStr.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)

    const start = new Date(Date.UTC(year, month - 1, day, startH, startM, 0))
    let end = new Date(Date.UTC(year, month - 1, day, endH, endM, 0))

    if (end < start) {
      end = start
    }

    setIsSubmitting(true)
    try {
      await onAddEntry({
        description: description.trim(),
        projectId,
        isBillable: false,
        tag: tag.trim() || null,
        startTimeUtc: start.toISOString(),
        endTimeUtc: end.toISOString(),
      })

      // Reset description after add
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Description & Project & Tag */}
        <div className="flex-1 flex flex-wrap items-center gap-2.5 min-w-0">
          <input
            type="text"
            placeholder="What have you worked on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
            className="flex-1 min-w-[200px] bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none px-2 py-1.5"
          />

          {/* Project Picker */}
          <ProjectPickerDropdown
            projects={projects}
            selectedProjectId={projectId}
            onSelectProject={setProjectId}
            disabled={isSubmitting}
          />

          {/* Tag Selector Popover */}
          <div className="relative" ref={tagRef}>
            <button
              type="button"
              onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)}
              title={tag ? `Tag: ${tag}` : 'Add Tag'}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                tag
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <Tag className="w-4 h-4" />
              {tag && <span className="max-w-[80px] truncate text-[11px]">{tag}</span>}
            </button>

            {isTagPopoverOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                  Enter Tag:
                </div>
                <input
                  type="text"
                  placeholder="e.g. Design, Meeting"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsTagPopoverOpen(false)
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
                <div className="mt-2 flex items-center justify-end gap-1.5">
                  {tag && (
                    <button
                      type="button"
                      onClick={() => setTag('')}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-rose-500"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsTagPopoverOpen(false)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time, Date, Duration & ADD Button */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Time range: 10:40 - 11:40 */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-[66px] cursor-pointer text-xs"
            />
            <span className="text-slate-400 dark:text-slate-600">-</span>
            <input
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-[66px] cursor-pointer text-xs"
            />
          </div>

          {/* Date Picker (Calendar + Today/Date) */}
          <div
            onClick={openDatePicker}
            className="relative flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={dateInputRef}
              type="date"
              value={dateStr}
              onClick={(e) => {
                e.stopPropagation()
                openDatePicker()
              }}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none text-xs cursor-pointer"
            />
          </div>

          {/* Duration Display: 01:00:00 */}
          <input
            type="text"
            value={durationStr}
            onChange={(e) => handleDurationChange(e.target.value)}
            title="Duration (hh:mm:ss)"
            className="w-24 px-2 py-1.5 text-center font-mono font-bold text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-xl"
          />

          {/* ADD Button */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer uppercase tracking-wider"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>ADD</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
