import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface AlertProps {
  type?: 'error' | 'success' | 'info'
  message: string
  className?: string
}

export function Alert({ type = 'error', message, className = '' }: AlertProps) {
  const config = {
    error: {
      bg: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
      icon: AlertCircle,
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
    },
    info: {
      bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
      icon: Info,
    },
  }[type]

  const Icon = config.icon

  return (
    <div
      className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in ${config.bg} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}
