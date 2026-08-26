import type { LucideIcon } from 'lucide-react'

interface SummaryWidgetProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  iconColor?: string
}

export function SummaryWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-500',
}: SummaryWidgetProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {subtitle}
      </div>
    </div>
  )
}
