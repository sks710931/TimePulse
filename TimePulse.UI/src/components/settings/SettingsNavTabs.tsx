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
    { id: 'whitelabeling', label: 'Whitelabelling', icon: Sparkles, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      {tabs.map((t) => {
        if (t.adminOnly && !isAdmin) return null
        const isActive = activeTab === t.id
        const Icon = t.icon

        return (
          <button
            key={t.id}
            onClick={() => onSelectTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-[1px] ${
              isActive
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <span>{t.label}</span>
            {t.adminOnly && (
              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                Admin
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
