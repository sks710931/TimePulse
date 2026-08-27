import { Zap, Lock, Download } from 'lucide-react'
import type { SettingsTabId } from './SettingsNavTabs'

interface ProfileQuickActionsCardProps {
  onNavigateTab?: (tab: SettingsTabId) => void
}

export function ProfileQuickActionsCard({ onNavigateTab }: ProfileQuickActionsCardProps) {
  const handleDownloadData = () => {
    const mockData = {
      exportDate: new Date().toISOString(),
      account: 'Active',
      preferences: {
        theme: 'System',
        timeZone: 'Eastern Time (US & Canada)',
        language: 'English (US)',
      },
    }
    const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timepulse-account-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Common account actions.
          </p>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Change Password */}
        <button
          type="button"
          onClick={() => onNavigateTab?.('security')}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all text-left flex items-start gap-3 group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Change Password
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Update your password
            </span>
          </div>
        </button>

        {/* Download My Data */}
        <button
          type="button"
          onClick={handleDownloadData}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all text-left flex items-start gap-3 group cursor-pointer"
        >
          <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0 shadow-xs">
            <Download className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Download My Data
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              Export your account data
            </span>
          </div>
        </button>
      </div>
    </div>
  )
}
