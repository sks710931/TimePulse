import { Shield, UserCheck } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'

interface UserProfileCardProps {
  user: UserProfile | null
  displayName?: string
}

export function UserProfileCard({ user, displayName }: UserProfileCardProps) {
  const nameToDisplay = displayName || user?.fullName || user?.name || user?.email?.split('@')[0] || 'User'

  const initials = nameToDisplay
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const roles = user?.roles && user.roles.length > 0 ? user.roles : ['User']

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0 ring-4 ring-indigo-50 dark:ring-indigo-950/40">
          {initials}
        </div>

        <div className="space-y-1.5 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {nameToDisplay}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user?.email || '—'}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                <Shield className="w-3 h-3 text-indigo-500" />
                <span>{role}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Active Status */}
      <div className="flex items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Active Account</span>
        </span>
      </div>
    </div>
  )
}
