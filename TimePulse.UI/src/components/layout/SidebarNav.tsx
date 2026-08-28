import {
  LayoutDashboard,
  Users,
  Clock,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type TabId = 'overview' | 'timetracker' | 'users' | 'settings'

interface NavItemConfig {
  id: TabId
  label: string
  icon: LucideIcon
  roleRequirement?: 'admin' | 'manager_or_admin'
}

interface SidebarNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  isAdmin: boolean
  isManager: boolean
  isCollapsed: boolean
  onCloseMobile: () => void
}

export function SidebarNav({
  activeTab,
  onSelectTab,
  isAdmin,
  isManager,
  isCollapsed,
  onCloseMobile,
}: SidebarNavProps) {
  const navItems: NavItemConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timetracker', label: 'Time Tracker', icon: Clock },
    { id: 'users', label: 'User Management', icon: Users, roleRequirement: 'manager_or_admin' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const handleTabClick = (tabId: TabId) => {
    onSelectTab(tabId)
    onCloseMobile()
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
      {navItems.map((item) => {
        if (item.roleRequirement === 'admin' && !isAdmin) return null
        if (item.roleRequirement === 'manager_or_admin' && !isAdmin && !isManager) return null

        const isActive = activeTab === item.id
        const Icon = item.icon

        return (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
            {!isCollapsed && item.id === 'users' && isAdmin && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                Admin
              </span>
            )}
            {!isCollapsed && item.id === 'users' && !isAdmin && isManager && (
              <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                Manager
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
