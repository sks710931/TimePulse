import { Shield, Key, ShieldCheck, Smartphone, ChevronRight } from 'lucide-react'
import type { SettingsTabId } from './SettingsNavTabs'

interface SecurityOverviewCardProps {
  onNavigateTab?: (tab: SettingsTabId) => void
}

export function SecurityOverviewCard({ onNavigateTab }: SecurityOverviewCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Security Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your account security at a glance.
          </p>
        </div>
      </div>

      {/* Security Items List */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Item 1: Password */}
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Password
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Last changed 36 days ago
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            Strong
          </span>
        </div>

        {/* Item 2: Two-Factor Authentication */}
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Two-Factor Authentication
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                Not enabled
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
            Disabled
          </span>
        </div>

        {/* Item 3: Active Sessions */}
        <div className="p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Active Sessions
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                1 current session
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            1 Active
          </span>
        </div>
      </div>

      {/* Footer Navigation Link */}
      <button
        type="button"
        onClick={() => onNavigateTab?.('security')}
        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer group"
      >
        <span>Go to Security Settings</span>
        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}
