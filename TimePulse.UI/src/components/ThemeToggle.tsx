import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setTheme } from '../store/slices/themeSlice'
import type { ThemeMode } from '../store/slices/themeSlice'
import { Sun, Moon, Laptop } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const dispatch = useAppDispatch()
  const currentMode = useAppSelector((state) => state.theme.mode)

  const modes: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'system', label: 'System', icon: Laptop },
    { mode: 'dark', label: 'Dark', icon: Moon },
  ]

  if (compact) {
    // Single toggle cycling: Light -> Dark -> System
    const nextModeMap: Record<ThemeMode, ThemeMode> = {
      light: 'dark',
      dark: 'system',
      system: 'light',
    }

    const currentIcon = modes.find((m) => m.mode === currentMode)?.icon || Laptop

    const Icon = currentIcon

    return (
      <button
        onClick={() => dispatch(setTheme(nextModeMap[currentMode]))}
        title={`Current: ${currentMode} mode. Click to switch.`}
        className={`p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer ${className}`}
      >
        <Icon className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 shadow-inner ${className}`}
    >
      {modes.map(({ mode, label, icon: Icon }) => {
        const isActive = currentMode === mode
        return (
          <button
            key={mode}
            onClick={() => dispatch(setTheme(mode))}
            title={`${label} theme ${mode === 'system' ? '(Default)' : ''}`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
