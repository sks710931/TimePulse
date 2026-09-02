import { useState, useRef, useEffect, useMemo } from 'react'
import { Tag, Trash2, Loader2 } from 'lucide-react'
import { ProjectPickerDropdown } from './ProjectPickerDropdown'
import type { TimeEntryDto, UpdateTimeEntryPayload } from '../../api/timeEntryApi'
import type { ProjectDto } from '../../api/projectApi'

interface TimeEntryRowProps {
  entry: TimeEntryDto
  projects: ProjectDto[]
  onSave: (id: string, payload: UpdateTimeEntryPayload) => Promise<void>
  onDelete: (id: string) => void
}

export function TimeEntryRow({
  entry,
  projects,
  onSave,
  onDelete,
}: TimeEntryRowProps) {
  const formatTimeOnly = (isoString: string) => {
    const d = new Date(isoString)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const [description, setDescription] = useState(entry.description || '')
  const [projectId, setProjectId] = useState<string | null>(entry.projectId || null)
  const [tag, setTag] = useState<string>(entry.tag || '')
  const [startTimeStr, setStartTimeStr] = useState(formatTimeOnly(entry.startTimeUtc))
  const [endTimeStr, setEndTimeStr] = useState(formatTimeOnly(entry.endTimeUtc))
  const [isSaving, setIsSaving] = useState(false)
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)

  const rowRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)

  // Sync state if entry prop updates from outside
  useEffect(() => {
    setDescription(entry.description || '')
    setProjectId(entry.projectId || null)
    setTag(entry.tag || '')
    setStartTimeStr(formatTimeOnly(entry.startTimeUtc))
    setEndTimeStr(formatTimeOnly(entry.endTimeUtc))
  }, [entry])

  // Click outside to close tag popover
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        if (isTagPopoverOpen) {
          setIsTagPopoverOpen(false)
          saveIfChanged({ tag })
        }
      }
    }
    if (isTagPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isTagPopoverOpen, tag])

  const hasChanges = (
    desc = description,
    pId = projectId,
    t = tag,
    sTime = startTimeStr,
    eTime = endTimeStr
  ) => {
    const entryStart = formatTimeOnly(entry.startTimeUtc)
    const entryEnd = formatTimeOnly(entry.endTimeUtc)
    const entryTag = entry.tag || ''
    const entryPid = entry.projectId || null

    return (
      desc.trim() !== (entry.description || '').trim() ||
      pId !== entryPid ||
      t.trim() !== entryTag.trim() ||
      sTime !== entryStart ||
      eTime !== entryEnd
    )
  }

  const saveIfChanged = async (override?: {
    description?: string
    projectId?: string | null
    tag?: string
    startTimeStr?: string
    endTimeStr?: string
  }) => {
    const nextDesc = override?.description !== undefined ? override.description : description
    const nextPid = override?.projectId !== undefined ? override.projectId : projectId
    const nextTag = override?.tag !== undefined ? override.tag : tag
    const nextStart = override?.startTimeStr !== undefined ? override.startTimeStr : startTimeStr
    const nextEnd = override?.endTimeStr !== undefined ? override.endTimeStr : endTimeStr

    if (!hasChanges(nextDesc, nextPid, nextTag, nextStart, nextEnd)) {
      return
    }

    const origStart = new Date(entry.startTimeUtc)
    const [startH, startM] = nextStart.split(':').map(Number)
    const [endH, endM] = nextEnd.split(':').map(Number)

    const newStart = new Date(origStart)
    newStart.setHours(startH, startM, 0, 0)

    let newEnd = new Date(origStart)
    newEnd.setHours(endH, endM, 0, 0)
    if (newEnd < newStart) {
      newEnd = newStart
    }

    setIsSaving(true)
    try {
      await onSave(entry.id, {
        description: nextDesc.trim(),
        projectId: nextPid,
        tag: nextTag.trim() || null,
        startTimeUtc: newStart.toISOString(),
        endTimeUtc: newEnd.toISOString(),
        isBillable: false,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRowBlur = (e: React.FocusEvent) => {
    // If the newly focused element is still within this row, do not save yet
    if (rowRef.current && rowRef.current.contains(e.relatedTarget as Node)) {
      return
    }
    // If tag popover is open, don't save via general blur
    if (isTagPopoverOpen) {
      return
    }
    saveIfChanged()
  }

  const handleSelectProject = (newProjectId: string | null) => {
    setProjectId(newProjectId)
    saveIfChanged({ projectId: newProjectId })
  }

  const currentDurationMinutes = useMemo(() => {
    const [startH, startM] = startTimeStr.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)
    if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
      const diff = endH * 60 + endM - (startH * 60 + startM)
      return Math.max(0, diff)
    }
    return entry.durationMinutes
  }, [startTimeStr, endTimeStr, entry.durationMinutes])

  const formatDuration = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
  }

  return (
    <div
      ref={rowRef}
      onBlur={handleRowBlur}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors text-xs"
    >
      {/* Description & Project */}
      <div className="flex-1 flex flex-wrap items-center gap-2.5 min-w-0">
        {/* Inline Description Input */}
        <input
          type="text"
          value={description}
          placeholder="Add description"
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur()
            }
          }}
          className="flex-1 min-w-[180px] bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-slate-100/90 dark:focus:bg-slate-800/90 rounded-lg px-2.5 py-1.5 transition-colors border border-transparent focus:border-slate-200 dark:focus:border-slate-700"
        />

        {/* Inline Project Picker Dropdown */}
        <ProjectPickerDropdown
          projects={projects}
          selectedProjectId={projectId}
          onSelectProject={handleSelectProject}
          disabled={isSaving}
        />
      </div>

      {/* Tag, Time range, Duration, Delete */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* Tag Picker Popover */}
        <div className="relative" ref={tagRef}>
          <button
            type="button"
            onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)}
            title={tag ? `Tag: ${tag}` : 'Add Tag'}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              tag
                ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            {tag && <span className="max-w-[80px] truncate text-[11px]">{tag}</span>}
          </button>

          {isTagPopoverOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                Tag:
              </div>
              <input
                type="text"
                placeholder="e.g. Design, Meeting"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsTagPopoverOpen(false)
                    saveIfChanged({ tag })
                  }
                }}
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              <div className="mt-2 flex items-center justify-end gap-1.5">
                {tag && (
                  <button
                    type="button"
                    onClick={() => {
                      setTag('')
                      setIsTagPopoverOpen(false)
                      saveIfChanged({ tag: '' })
                    }}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-rose-500"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsTagPopoverOpen(false)
                    saveIfChanged({ tag })
                  }}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inline Time Range: start - end */}
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-xs bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/60 focus-within:border-sky-400 dark:focus-within:border-sky-500 shrink-0">
          <input
            type="time"
            value={startTimeStr}
            onChange={(e) => setStartTimeStr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-[54px] text-center text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
          />
          <span className="text-slate-400 dark:text-slate-500">-</span>
          <input
            type="time"
            value={endTimeStr}
            onChange={(e) => setEndTimeStr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
            className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-[54px] text-center text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
          />
        </div>

        {/* Duration */}
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs w-20 min-w-[76px] text-right shrink-0">
          {formatDuration(currentDurationMinutes)}
        </span>

        {/* Saving Indicator or Delete Button */}
        <div className="w-7 flex items-center justify-center">
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
          ) : (
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              title="Delete entry"
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
