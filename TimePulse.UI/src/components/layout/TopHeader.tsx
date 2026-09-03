import { Menu } from 'lucide-react'
import { RoleBadge } from '../common/RoleBadge'
import type { UserProfile } from '../../api/authApi'

interface TopHeaderProps {
  title: string
  appName: string | null
  user: UserProfile | null
  isCollapsed: boolean
  onToggleCollapse: () => void
  onOpenMobile: () => void
}

export function TopHeader({
  title,
  appName,
  user,
  isCollapsed,
  onToggleCollapse,
  onOpenMobile,
}: TopHeaderProps) {
  const handleHamburgerClick = () => {
    if (window.innerWidth < 1024) {
      onOpenMobile()
    } else {
      onToggleCollapse()
    }
  }

  return (
    <header className="h-16 shrink-0 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={handleHamburgerClick}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            {appName ? `${appName} Enterprise Edition` : 'Enterprise Edition'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex gap-1">
          {user?.roles?.map((role: string) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>
    </header>
  )
}
