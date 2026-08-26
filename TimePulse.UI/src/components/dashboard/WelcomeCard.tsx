import { CheckCircle2 } from 'lucide-react'

interface WelcomeCardProps {
  userName?: string
  appName: string | null
}

export function WelcomeCard({ userName, appName }: WelcomeCardProps) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/60 dark:via-slate-900/60 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-colors duration-200">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome, {userName}! 👋
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Authenticated in {appName ? <strong>{appName}</strong> : 'the application'} via secure <strong>httpOnly JWT cookies</strong> with refresh rotation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>Session Active</span>
        </div>
      </div>
    </div>
  )
}
