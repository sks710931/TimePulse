import { useState, useEffect } from 'react'
import { X, Loader2, DollarSign, Calendar, Clock } from 'lucide-react'
import { ProjectPickerDropdown } from './ProjectPickerDropdown'
import type { ProjectDto } from '../../api/projectApi'
import type { TimeEntryDto, UpdateTimeEntryPayload } from '../../api/timeEntryApi'

interface EditTimeEntryModalProps {
  isOpen: boolean
  entry: TimeEntryDto | null
  projects: ProjectDto[]
  onClose: () => void
  onSave: (id: string, payload: UpdateTimeEntryPayload) => Promise<void>
}

export function EditTimeEntryModal({
  isOpen,
  entry,
  projects,
  onClose,
  onSave,
}: EditTimeEntryModalProps) {
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isBillable, setIsBillable] = useState(false)
  const [tag, setTag] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [startTimeStr, setStartTimeStr] = useState('')
  const [endTimeStr, setEndTimeStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (entry && isOpen) {
      setDescription(entry.description || '')
      setProjectId(entry.projectId || null)
      setIsBillable(entry.isBillable || false)
      setTag(entry.tag || '')

      const start = new Date(entry.startTimeUtc)
      const end = new Date(entry.endTimeUtc)

      const yyyy = start.getFullYear()
      const mm = String(start.getMonth() + 1).padStart(2, '0')
      const dd = String(start.getDate()).padStart(2, '0')
      setDateStr(`${yyyy}-${mm}-${dd}`)

      setStartTimeStr(
        `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
      )
      setEndTimeStr(
        `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
      )
      setError(null)
    }
  }, [entry, isOpen])

  if (!isOpen || !entry) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const [year, month, day] = dateStr.split('-').map(Number)
    const [startH, startM] = startTimeStr.split(':').map(Number)
    const [endH, endM] = endTimeStr.split(':').map(Number)

    const start = new Date(Date.UTC(year, month - 1, day, startH, startM, 0))
    const end = new Date(Date.UTC(year, month - 1, day, endH, endM, 0))

    if (end < start) {
      setError('End time cannot be earlier than start time.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave(entry.id, {
        description: description.trim(),
        projectId,
        isBillable,
        tag: tag.trim() || null,
        startTimeUtc: start.toISOString(),
        endTimeUtc: end.toISOString(),
      })
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Edit Time Entry
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="What did you work on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Project & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project
              </label>
              <ProjectPickerDropdown
                projects={projects}
                selectedProjectId={projectId}
                onSelectProject={setProjectId}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Design, Meeting"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Date, Start Time & End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="time"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="time"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white focus:outline-none w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsBillable(!isBillable)}
              className={`p-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                isBillable
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>{isBillable ? 'Billable' : 'Non-billable'}</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
