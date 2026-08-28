import { Shield, Palette, ChevronRight, Settings } from 'lucide-react'
import type { SettingsTabId } from './SettingsNavTabs'

interface ProfileQuickActionsCardProps {
  onNavigateTab?: (tab: SettingsTabId) => void
}

export function ProfileQuickActionsCard({ onNavigateTab }: ProfileQuickActionsCardProps) {
  const links: { id: SettingsTabId; label: string; description: string; icon: typeof Shield }[] = [
    {
      id: 'security',
      label: 'Security & Password',
      description: 'Change your password and manage session settings',
      icon: Shield,
    },
    {
      id: 'appearance',
      label: 'Appearance & Theme',
      description: 'Customize light, dark, or system color preferences',
      icon: Palette,
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Quick Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access other account and interface settings.
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigateTab?.(link.id)}
              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {link.description}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
