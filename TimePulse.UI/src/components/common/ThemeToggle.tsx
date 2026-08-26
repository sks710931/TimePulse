import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setTheme, type ThemeMode } from '../../store/slices/themeSlice'
import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeToggleProps {
  compact?: boolean
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const dispatch = useAppDispatch()
  const mode = useAppSelector((state) => state.theme.mode)

  const handleSelect = (newMode: ThemeMode) => {
    dispatch(setTheme(newMode))
  }

  const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ]

  if (compact) {
    const nextMode: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    }

    const current = modes.find((m) => m.id === mode) || modes[0]
    const Icon = current.icon

    return (
      <button
        onClick={() => handleSelect(nextMode[mode])}
        title={`Theme: ${current.label} (Click to switch)`}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Icon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl">
      {modes.map(({ id, label, icon: Icon }) => {
        const isActive = mode === id
        return (
          <button
            key={id}
            onClick={() => handleSelect(id)}
            title={`Switch to ${label} mode`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="capitalize">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
