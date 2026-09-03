import { Calendar, FileSpreadsheet, FileText, FileDown, Loader2, RefreshCw, User, Folder, DollarSign } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'
import type { UserItemDto } from '../../api/userApi'

interface ReportFilterBarProps {
  preset: 'weekly' | 'monthly' | 'last_month' | 'custom'
  onSelectPreset: (preset: 'weekly' | 'monthly' | 'last_month' | 'custom') => void
  startDate: string
  endDate: string
  onChangeStartDate: (val: string) => void
  onChangeEndDate: (val: string) => void
  selectedUserId: string
  onChangeUserId: (val: string) => void
  selectedProjectId: string
  onChangeProjectId: (val: string) => void
  billableFilter: 'all' | 'billable' | 'non_billable'
  onChangeBillableFilter: (val: 'all' | 'billable' | 'non_billable') => void
  isManagerOrAdmin: boolean
  usersList: UserItemDto[]
  projectsList: ProjectDto[]
  onExport: (format: 'excel' | 'csv' | 'pdf') => void
  isExporting: string | null
  onRefresh: () => void
  isLoading: boolean
}

export function ReportFilterBar({
  preset,
  onSelectPreset,
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
  selectedUserId,
  onChangeUserId,
  selectedProjectId,
  onChangeProjectId,
  billableFilter,
  onChangeBillableFilter,
  isManagerOrAdmin,
  usersList,
  projectsList,
  onExport,
  isExporting,
  onRefresh,
  isLoading,
}: ReportFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Row: Presets & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Preset Tabs */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => onSelectPreset('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('last_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'last_month'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last Month
          </button>
          <button
            type="button"
            onClick={() => onSelectPreset('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              preset === 'custom'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Export & Refresh Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Report Data"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => onExport('excel')}
            disabled={Boolean(isExporting)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === 'excel' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>Excel</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => onExport('csv')}
            disabled={Boolean(isExporting)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === 'csv' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            )}
            <span>CSV</span>
          </button>

          {/* Export PDF */}
          <button
            type="button"
            onClick={() => onExport('pdf')}
            disabled={Boolean(isExporting)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Detailed Date Range & Granular Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* Date Range Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Start Date"
            />
          </div>
          <span className="text-xs text-slate-400">to</span>
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="End Date"
            />
          </div>
        </div>

        {/* Employee Filter (Managers & Admins only) */}
        {isManagerOrAdmin && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
              <User className="w-3.5 h-3.5" />
            </span>
            <select
              value={selectedUserId}
              onChange={(e) => onChangeUserId(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Team Members</option>
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName || u.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Project Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
            <Folder className="w-3.5 h-3.5" />
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => onChangeProjectId(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Projects</option>
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Billable Status Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
            <DollarSign className="w-3.5 h-3.5" />
          </span>
          <select
            value={billableFilter}
            onChange={(e) => onChangeBillableFilter(e.target.value as 'all' | 'billable' | 'non_billable')}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Hours</option>
            <option value="billable">Billable Only</option>
            <option value="non_billable">Non-Billable Only</option>
          </select>
        </div>
      </div>
    </div>
  )
}
