import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { Sidebar, type TabId } from './Sidebar'
import { TopHeader } from './TopHeader'

export function DashboardLayout() {
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)
  const location = useLocation()
  const navigate = useNavigate()

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tp_sidebar_collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('tp_sidebar_collapsed', String(next))
      return next
    })
  }

  // Derive active tab from current route path
  const getActiveTab = (): TabId => {
    const path = location.pathname.toLowerCase()
    if (path.startsWith('/timetracker')) return 'timetracker'
    if (path.startsWith('/leaves')) return 'leaves'
    if (path.startsWith('/reports')) return 'reports'
    if (path.startsWith('/projects')) return 'projects'
    if (path.startsWith('/teams')) return 'teams'
    if (path.startsWith('/users')) return 'users'
    if (path.startsWith('/settings')) return 'settings'
    return 'overview'
  }

  const activeTab = getActiveTab()

  const handleSelectTab = (tabId: TabId) => {
    navigate(`/${tabId}`)
  }

  const tabTitles: Record<TabId, string> = {
    overview: 'Overview Dashboard',
    timetracker: 'Time Tracker',
    leaves: 'Leave Tracker',
    reports: 'Time & Productivity Reports',
    projects: 'Projects & Workspaces',
    teams: 'Teams & Departments',
    users: 'User Management',
    settings: 'Account & Application Settings',
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex overflow-hidden transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar Header */}
        <TopHeader
          title={tabTitles[activeTab]}
          appName={branding.appName}
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
