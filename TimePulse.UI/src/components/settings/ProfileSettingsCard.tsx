import { useState } from 'react'
import { RoleBadge } from '../common/RoleBadge'
import { Alert } from '../common/Alert'
import { User, Mail, CheckCircle2 } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'

interface ProfileSettingsCardProps {
  user: UserProfile | null
}

export function ProfileSettingsCard({ user }: ProfileSettingsCardProps) {
  const [name, setName] = useState(user?.name || user?.fullName || '')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const initials = name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Update your account personal details and view your roles.</p>
        </div>
      </div>

      {isSaved && <Alert type="success" message="Profile information saved successfully." />}

      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
          {initials}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {user?.name || user?.fullName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user?.email}
          </p>
          <div className="flex gap-1 pt-1 flex-wrap">
            {user?.roles?.map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address (Read-only)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  )
}
