import { Settings, Clock, Globe, ChevronRight } from 'lucide-react'

export function AccountPreferencesCard() {
  const preferences = [
    {
      id: 'timezone',
      icon: Clock,
      label: 'Time Zone',
      value: '(UTC-05:00) Eastern Time (US & Canada)',
    },
    {
      id: 'language',
      icon: Globe,
      label: 'Language',
      value: 'English (US)',
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Account Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage how your account works.
          </p>
        </div>
      </div>

      {/* Preferences List */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {preferences.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                    {item.value}
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
