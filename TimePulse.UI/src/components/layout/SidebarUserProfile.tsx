import { useAppDispatch } from '../../store/hooks'
import { logoutUser } from '../../store/slices/authSlice'
import { ThemeToggle } from '../common/ThemeToggle'
import { Shield, LogOut } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'

interface SidebarUserProfileProps {
  user: UserProfile | null
  isAdmin: boolean
  isCollapsed: boolean
}

export function SidebarUserProfile({ user, isAdmin, isCollapsed }: SidebarUserProfileProps) {
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const displayName = user?.name || user?.fullName || ''
  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
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
          title={displayName}
        >
          {initials}
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {displayName}
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
  )
}
