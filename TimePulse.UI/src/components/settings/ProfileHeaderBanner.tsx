import { User } from 'lucide-react'

export function ProfileHeaderBanner() {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-3.5">
      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-blue-100/80 dark:border-blue-900/40">
        <User className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Profile Information
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details and account preferences.
        </p>
      </div>
    </div>
  )
}
