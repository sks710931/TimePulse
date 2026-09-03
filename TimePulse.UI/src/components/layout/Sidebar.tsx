import { useAppSelector } from '../../store/hooks'
import { SidebarBrand } from './SidebarBrand'
import { SidebarNav, type TabId } from './SidebarNav'
import { SidebarUserProfile } from './SidebarUserProfile'

export type { TabId }

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
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)
  const isAdmin = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'admin'))
  const isManager = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'manager'))

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
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <SidebarBrand
          appName={branding.appName}
          isCollapsed={isCollapsed}
          onCloseMobile={onCloseMobile}
        />

        {/* Navigation List */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isAdmin={isAdmin}
          isManager={isManager}
          isCollapsed={isCollapsed}
          onCloseMobile={onCloseMobile}
        />

        {/* User Profile & Theme Toggle */}
        <SidebarUserProfile
          user={user}
          isAdmin={isAdmin}
          isCollapsed={isCollapsed}
        />
      </aside>
    </>
  )
}
