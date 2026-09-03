import { Clock, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import type { ReportSummary } from '../../api/reportApi'

interface ReportSummaryCardsProps {
  summary: ReportSummary | null
  isLoading: boolean
}

export function ReportSummaryCards({ summary, isLoading }: ReportSummaryCardsProps) {
  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-pulse h-28 flex flex-col justify-between"
          >
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  const totalHoursFormatted = summary?.totalHoursFormatted || '0h 00m'
  const totalHoursDecimal = summary?.totalHoursDecimal || 0
  const billableHoursFormatted = summary?.billableHoursFormatted || '0h 00m'
  const billablePct = summary?.billablePercentage || 0
  const nonBillableHoursFormatted = summary?.nonBillableHoursFormatted || '0h 00m'
  const totalEntries = summary?.totalEntriesCount || 0
  const activeProjectsCount = summary?.projects.length || 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Time Tracked */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tracked</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalHoursFormatted}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{totalHoursDecimal.toFixed(1)} decimal hrs</p>
        </div>
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Billable Time */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Billable Time</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {billableHoursFormatted}
          </p>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {billablePct.toFixed(1)}% Billable
            </span>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* 3. Non-Billable Time */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Non-Billable</p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {nonBillableHoursFormatted}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Internal / Administrative</p>
        </div>
        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      {/* 4. Total Logged Entries & Active Projects */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Entries</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {totalEntries}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Across {activeProjectsCount} projects</p>
        </div>
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
