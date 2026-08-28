import { Shield, Briefcase, UserCheck, User } from 'lucide-react'

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const normalized = role.toLowerCase()

  if (normalized === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 ${className}`}
      >
        <Shield className="w-3 h-3 text-indigo-500" />
        <span>Admin</span>
      </span>
    )
  }

  if (normalized === 'manager') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 ${className}`}
      >
        <Briefcase className="w-3 h-3 text-amber-500" />
        <span>Manager</span>
      </span>
    )
  }

  if (normalized === 'employee') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 ${className}`}
      >
        <UserCheck className="w-3 h-3 text-sky-500" />
        <span>Employee</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
    >
      <User className="w-3 h-3 text-slate-400" />
      <span>{role}</span>
    </span>
  )
}
