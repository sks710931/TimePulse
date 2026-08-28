import { useState } from 'react'
import { User, Mail, Shield, KeyRound, Copy, Check } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'

interface PersonalDetailsCardProps {
  user: UserProfile | null
}

export function PersonalDetailsCard({ user }: PersonalDetailsCardProps) {
  const [copiedId, setCopiedId] = useState(false)

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const resolvedName = user?.fullName || user?.name || '—'
  const resolvedEmail = user?.email || '—'
  const roles = user?.roles && user.roles.length > 0 ? user.roles : ['User']

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Account Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your verified identity and credentials.
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <User className="w-3.5 h-3.5" />
            <span>Full Name</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {resolvedName}
          </p>
        </div>

        {/* Email Address */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Email Address</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {resolvedEmail}
          </p>
        </div>

        {/* Assigned Roles */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Assigned Roles</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Account ID */}
        <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>User ID</span>
            </div>
            {user?.id && (
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy User ID"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
            {user?.id || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
