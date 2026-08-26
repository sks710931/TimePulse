import { Clock, MoreVertical } from 'lucide-react'

export function TimeLogTable() {
  const dummyLogs = [
    { id: '1', title: 'Architecture Refactoring & Modularity', project: 'TimePulse Core', tag: 'Engineering', duration: '1h 45m', time: '10:30 AM - 12:15 PM' },
    { id: '2', title: 'Whitelabeling Dual Dark/Light Logo support', project: 'UI Platform', tag: 'Branding', duration: '2h 10m', time: '01:00 PM - 03:10 PM' },
    { id: '3', title: 'Security Token Rotation Verification', project: 'Auth API', tag: 'Security', duration: '0h 40m', time: '03:30 PM - 04:10 PM' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Today's Time Entries
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total recorded today: <span className="font-bold text-slate-900 dark:text-white">4h 35m</span>
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {dummyLogs.map((log) => (
          <div
            key={log.id}
            className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-xl px-3 -mx-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {log.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {log.project}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {log.tag}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-11 sm:pl-0">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {log.time}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {log.duration}
              </span>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
