import { useState, useMemo } from 'react'
import { Search, FileSpreadsheet, CheckCircle2, Tag } from 'lucide-react'
import type { ReportTimeEntry } from '../../api/reportApi'

interface ReportEntriesTableProps {
  entries: ReportTimeEntry[]
  isManagerOrAdmin: boolean
}

export function ReportEntriesTable({ entries, isManagerOrAdmin }: ReportEntriesTableProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return entries

    const term = searchTerm.toLowerCase()
    return entries.filter(
      (e) =>
        e.description.toLowerCase().includes(term) ||
        e.projectName.toLowerCase().includes(term) ||
        (e.tag && e.tag.toLowerCase().includes(term)) ||
        e.userName.toLowerCase().includes(term) ||
        e.userEmail.toLowerCase().includes(term) ||
        e.dateFormatted.includes(term)
    )
  }, [entries, searchTerm])

  const totalMinutes = useMemo(
    () => filteredEntries.reduce((sum, e) => sum + e.durationMinutes, 0),
    [filteredEntries]
  )

  const formattedTotal = useMemo(() => {
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${h}h ${m.toString().padStart(2, '0')}m`
  }, [totalMinutes])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Search and Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Itemized Time Entries ({filteredEntries.length})
          </h2>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search entries, projects, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Date</th>
              {isManagerOrAdmin && <th className="px-4 py-3">Employee</th>}
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Time Range</th>
              <th className="px-4 py-3 text-right">Duration</th>
              <th className="px-4 py-3 text-center">Billable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEntries.length === 0 ? (
              <tr>
                <td
                  colSpan={isManagerOrAdmin ? 8 : 7}
                  className="px-4 py-8 text-center text-slate-400 text-xs"
                >
                  No time entries found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Date */}
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {entry.dateFormatted}
                  </td>

                  {/* Employee (for Manager/Admin) */}
                  {isManagerOrAdmin && (
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="font-medium">{entry.userName}</div>
                      <div className="text-[10px] text-slate-400">{entry.userEmail}</div>
                    </td>
                  )}

                  {/* Project */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.projectColor || '#94A3B8' }}
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {entry.projectName}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {entry.description || <span className="text-slate-400 italic">No description</span>}
                  </td>

                  {/* Tag */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.tag ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        {entry.tag}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  {/* Time Range */}
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {entry.startTimeFormatted} - {entry.endTimeFormatted}
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {entry.durationFormatted}
                  </td>

                  {/* Billable */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {entry.isBillable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Billable
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Non-billable
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Footer total row */}
          {filteredEntries.length > 0 && (
            <tfoot className="bg-slate-50 dark:bg-slate-800/60 font-bold border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <tr>
                <td colSpan={isManagerOrAdmin ? 6 : 5} className="px-4 py-2.5 text-right">
                  Filtered Total:
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                  {formattedTotal}
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
