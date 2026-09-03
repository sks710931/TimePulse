import { useState } from 'react'
import { FolderKanban, Users, CalendarDays, TrendingUp } from 'lucide-react'
import type { ReportSummary } from '../../api/reportApi'

interface ReportBreakdownProps {
  summary: ReportSummary | null
  isManagerOrAdmin: boolean
}

type BreakdownTab = 'projects' | 'employees' | 'daily'

export function ReportBreakdown({ summary, isManagerOrAdmin }: ReportBreakdownProps) {
  const [activeTab, setActiveTab] = useState<BreakdownTab>('projects')

  if (!summary) return null

  const { projects, employees, dailyTrends, totalDurationMinutes } = summary

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Time Distribution & Analytics</h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          {isManagerOrAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'employees'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Members ({employees.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Daily Activity ({dailyTrends.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {/* 1. Project Breakdown */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No projects found for the selected period.</p>
          ) : (
            projects.map((proj) => (
              <div key={proj.projectId ?? 'no-project'} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: proj.colorHex || '#94A3B8' }}
                    />
                    <span>{proj.projectName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{proj.hoursFormatted}</span>
                    <span>({proj.percentageOfTotal.toFixed(1)}%)</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(2, Math.min(100, proj.percentageOfTotal))}%`,
                      backgroundColor: proj.colorHex || '#4F46E5',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Team Member Breakdown */}
      {activeTab === 'employees' && isManagerOrAdmin && (
        <div className="space-y-3">
          {employees.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No team activity found for the selected period.</p>
          ) : (
            employees.map((emp) => {
              const pct = totalDurationMinutes > 0 ? (emp.durationMinutes / totalDurationMinutes) * 100 : 0
              const initials = (emp.fullName || emp.email || '?')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()

              return (
                <div key={emp.userId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                        {initials}
                      </div>
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{emp.fullName}</span>
                        <span className="text-slate-400 ml-1.5 text-[11px] hidden sm:inline">{emp.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="text-[11px] text-slate-400">{emp.entryCount} entries</span>
                      {(emp.leavesTaken ?? 0) > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Leaves: {emp.leavesTaken}
                        </span>
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white">{emp.hoursFormatted}</span>
                      <span>({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* 3. Daily Activity */}
      {activeTab === 'daily' && (
        <div className="space-y-2">
          {dailyTrends.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No daily logs found for the selected period.</p>
          ) : (
            dailyTrends.map((day) => {
              const maxMinutes = Math.max(...dailyTrends.map((d) => d.durationMinutes), 1)
              const barPct = (day.durationMinutes / maxMinutes) * 100

              return (
                <div key={day.date} className="flex items-center gap-3 text-xs py-1">
                  <div className="w-24 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {day.date} <span className="font-sans font-medium text-slate-400">({day.dayOfWeek})</span>
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(3, barPct)}%` }}
                    />
                  </div>
                  <div className="w-16 text-right font-semibold text-slate-800 dark:text-slate-200">
                    {day.hoursFormatted}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
