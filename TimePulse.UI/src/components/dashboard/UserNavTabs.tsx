import { Users, Clock, CheckCircle2, type LucideIcon } from 'lucide-react'

export type UserTabId = 'users' | 'pending' | 'accepted'

interface UserNavTabsProps {
  activeTab: UserTabId
  onSelectTab: (tab: UserTabId) => void
  usersCount?: number
  pendingCount?: number
  acceptedCount?: number
}

interface TabItem {
  id: UserTabId
  label: string
  icon: LucideIcon
  count?: number
  countColorClass?: string
}

export function UserNavTabs({
  activeTab,
  onSelectTab,
  usersCount,
  pendingCount,
  acceptedCount,
}: UserNavTabsProps) {
  const tabs: TabItem[] = [
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      count: usersCount,
      countColorClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
    {
      id: 'pending',
      label: 'Invitations Pending',
      icon: Clock,
      count: pendingCount,
      countColorClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'accepted',
      label: 'Invitations Accepted',
      icon: CheckCircle2,
      count: acceptedCount,
      countColorClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
      {tabs.map((t) => {
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
            <Icon
              className={`w-4 h-4 ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : t.countColorClass || 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
