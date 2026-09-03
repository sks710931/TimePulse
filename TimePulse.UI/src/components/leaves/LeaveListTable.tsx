import { useState } from 'react'
import { Trash2, Sun, Sunrise, Sunset, Calendar, User, Loader2 } from 'lucide-react'
import type { LeaveDto, LeaveType } from '../../api/leaveApi'

interface LeaveListTableProps {
  leaves: LeaveDto[]
  showEmployee?: boolean
  onDelete: (id: string) => Promise<void>
}

export function LeaveListTable({ leaves, showEmployee = false, onDelete }: LeaveListTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this leave record?')) {
      return
    }

    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const renderTypeBadge = (type: LeaveType) => {
    switch (type) {
      case 'FullDay':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            Full Day
          </span>
        )
      case 'FirstHalf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Sunrise className="w-3.5 h-3.5 text-orange-500" />
            First Half (Morning)
          </span>
        )
      case 'SecondHalf':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Sunset className="w-3.5 h-3.5 text-sky-500" />
            Second Half (Afternoon)
          </span>
        )
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number)
      const date = new Date(y, m - 1, d)
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Leaves Found</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No leaves recorded for the selected time range. Click &quot;Apply for Leave&quot; to log a scheduled day off.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">Date</th>
              {showEmployee && <th className="py-3.5 px-4">Employee</th>}
              <th className="py-3.5 px-4">Duration / Type</th>
              <th className="py-3.5 px-4">Reason</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {leaves.map((leave) => (
              <tr
                key={leave.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{formatDate(leave.date)}</span>
                  </div>
                </td>

                {/* Employee (for Manager view) */}
                {showEmployee && (
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {leave.userName}
                        </span>
                        <span className="text-[11px] text-slate-400 block">{leave.userEmail}</span>
                      </div>
                    </div>
                  </td>
                )}

                {/* Leave Type */}
                <td className="py-3.5 px-4 whitespace-nowrap">{renderTypeBadge(leave.leaveType)}</td>

                {/* Reason */}
                <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400">
                  {leave.reason || <span className="italic text-slate-400">No reason provided</span>}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleDelete(leave.id)}
                    disabled={deletingId === leave.id}
                    title="Cancel Leave"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {deletingId === leave.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
