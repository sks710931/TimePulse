import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setTheme, type ThemeMode } from '../../store/slices/themeSlice'
import { Sun, Moon, Laptop, Palette } from 'lucide-react'

export function AppearanceSettingsCard() {
  const dispatch = useAppDispatch()
  const currentMode = useAppSelector((state) => state.theme.mode)

  const themeOptions: { mode: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    {
      mode: 'light',
      label: 'Light Mode',
      desc: 'Crisp, high-contrast light theme with slate accents.',
      icon: Sun,
    },
    {
      mode: 'dark',
      label: 'Dark Mode',
      desc: 'Eye-friendly deep dark theme for low-light environments.',
      icon: Moon,
    },
    {
      mode: 'system',
      label: 'System Preference',
      desc: 'Automatically syncs with your operating system appearance.',
      icon: Laptop,
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select how TimePulse looks on your device.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themeOptions.map((opt) => {
          const isSelected = currentMode === opt.mode
          const Icon = opt.icon

          return (
            <button
              key={opt.mode}
              type="button"
              onClick={() => dispatch(setTheme(opt.mode))}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {opt.label}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {opt.desc}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
