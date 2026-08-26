import { User, Palette, Sparkles, Bell, Shield, type LucideIcon } from 'lucide-react'

export type SettingsTabId = 'profile' | 'appearance' | 'whitelabeling' | 'notifications' | 'security'

interface SettingsNavTabsProps {
  activeTab: SettingsTabId
  onSelectTab: (tab: SettingsTabId) => void
  isAdmin: boolean
}

interface TabItem {
  id: SettingsTabId
  label: string
  icon: LucideIcon
  adminOnly?: boolean
}

export function SettingsNavTabs({ activeTab, onSelectTab, isAdmin }: SettingsNavTabsProps) {
  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'whitelabeling', label: 'Whitelabeling', icon: Sparkles, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
      {tabs.map((t) => {
        if (t.adminOnly && !isAdmin) return null
        const isActive = activeTab === t.id
        const Icon = t.icon

        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>{t.label}</span>
            {t.adminOnly && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                Admin
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
