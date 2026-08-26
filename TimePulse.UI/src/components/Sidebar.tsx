import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/authSlice'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'
import {
  LayoutDashboard,
  Users,
  Palette,
  CloudSun,
  Sliders,
  LogOut,
  Shield,
  X,
  Clock,
} from 'lucide-react'

export type TabId = 'overview' | 'timetracker' | 'users' | 'branding' | 'weather' | 'redux'

interface SidebarProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  isCollapsed: boolean
  isMobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)

  const isAdmin = user?.roles.includes('Admin')

  const navItems: {
    id: TabId
    label: string
    icon: typeof LayoutDashboard
    adminOnly?: boolean
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'timetracker', label: 'Time Tracker', icon: Clock },
    { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
    { id: 'branding', label: 'Whitelabeling', icon: Palette, adminOnly: true },
    { id: 'weather', label: 'Protected API', icon: CloudSun },
    { id: 'redux', label: 'Redux Demo', icon: Sliders },
  ]

  const handleTabClick = (tabId: TabId) => {
    onSelectTab(tabId)
    onCloseMobile()
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  // Get User Initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top Header: Clean Brand Area (No chevron inside) */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          {isCollapsed ? (
            <div className="w-full flex items-center justify-center" title={branding.appName || 'Brand Logo'}>
              <Logo size="sm" showText={false} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 truncate flex-1">
              <Logo size="sm" showText={false} />
              {branding.appName && (
                <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {branding.appName}
                </span>
              )}
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null
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
                {!isCollapsed && item.adminOnly && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                    Admin
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Section: Theme Switcher & User Profile */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Theme Toggle */}
          <div className="flex justify-center">
            <ThemeToggle compact={isCollapsed} />
          </div>

          {/* User Profile Card */}
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {/* Avatar Initials */}
            <div
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0"
              title={user?.name}
            >
              {initials}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  {isAdmin && (
                    <span title="Admin User">
                      <Shield className="w-3 h-3 text-indigo-500 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Log Out"
              className={`p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer ${
                isCollapsed ? 'hidden' : 'block'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
