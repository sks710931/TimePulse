import { useState, useEffect } from 'react'
import { WelcomeCard } from './WelcomeCard'
import { SummaryWidget } from './SummaryWidget'
import { Shield, Clock, Users, Settings, ArrowRight, Calendar, FolderKanban } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'
import type { BrandSettings } from '../../api/brandingApi'
import type { TabId } from '../layout/Sidebar'
import { leaveApi } from '../../api/leaveApi'
import { timeEntryApi } from '../../api/timeEntryApi'
import { projectApi, type UserProjectMonthlySummary } from '../../api/projectApi'

interface OverviewTabProps {
  user: UserProfile | null
  branding: BrandSettings
  onNavigateTab: (tabId: TabId) => void
}

export function OverviewTab({ user, branding, onNavigateTab }: OverviewTabProps) {
  const isAdmin = Boolean(user?.roles.includes('Admin'))
  const [leavesTaken, setLeavesTaken] = useState<number | null>(null)
  const [leavesSubtitle, setLeavesSubtitle] = useState<string>('Loading...')
  const [todayMinutes, setTodayMinutes] = useState<number | null>(null)
  const [todaySubtitle, setTodaySubtitle] = useState<string>('Loading...')
  const [projectSummaries, setProjectSummaries] = useState<UserProjectMonthlySummary[]>([])
  const [isProjectsLoading, setIsProjectsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchLeaves = async () => {
      try {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const monthName = now.toLocaleString('default', { month: 'short' })
        const lastDay = new Date(year, month + 1, 0).getDate()
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

        const leaves = await leaveApi.getLeaves(user?.id, startDate, endDate)
        if (!isMounted) return

        let total = 0
        let fullDays = 0
        let halfDays = 0

        for (const l of leaves) {
          if (l.leaveType === 'FullDay') {
            total += 1.0
            fullDays += 1
          } else if (l.leaveType === 'FirstHalf' || l.leaveType === 'SecondHalf') {
            total += 0.5
            halfDays += 1
          }
        }

        setLeavesTaken(total)
        if (total === 0) {
          setLeavesSubtitle(`No leaves in ${monthName} ${year}`)
        } else {
          const breakdownParts: string[] = []
          if (fullDays > 0) breakdownParts.push(`${fullDays} full`)
          if (halfDays > 0) breakdownParts.push(`${halfDays} half`)
          setLeavesSubtitle(`${monthName} ${year} • ${breakdownParts.join(', ')}`)
        }
      } catch {
        if (isMounted) {
          setLeavesTaken(0)
          setLeavesSubtitle('No leaves recorded')
        }
      }
    }

    fetchLeaves()
    return () => {
      isMounted = false
    }
  }, [user?.id])

  useEffect(() => {
    let isMounted = true
    const fetchTodayTracked = async () => {
      try {
        const now = new Date()
        const todayStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)).toISOString()
        const todayEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)).toISOString()

        const res = await timeEntryApi.getTimeEntries(1, 100, todayStart, todayEnd)
        if (!isMounted) return

        const totalMinutes = res.items.reduce((sum, item) => sum + item.durationMinutes, 0)
        setTodayMinutes(totalMinutes)
        if (res.items.length === 0) {
          setTodaySubtitle('No time logged today')
        } else {
          setTodaySubtitle(`${res.items.length} ${res.items.length === 1 ? 'entry' : 'entries'} logged today`)
        }
      } catch {
        if (isMounted) {
          setTodayMinutes(0)
          setTodaySubtitle('No time logged today')
        }
      }
    }

    fetchTodayTracked()
    return () => {
      isMounted = false
    }
  }, [user?.id])

  useEffect(() => {
    let isMounted = true
    const fetchProjectSummaries = async () => {
      try {
        setIsProjectsLoading(true)
        const summaries = await projectApi.getMyMonthlySummary()
        if (isMounted) {
          setProjectSummaries(summaries)
        }
      } catch {
        if (isMounted) {
          setProjectSummaries([])
        }
      } finally {
        if (isMounted) {
          setIsProjectsLoading(false)
        }
      }
    }

    fetchProjectSummaries()
    return () => {
      isMounted = false
    }
  }, [user?.id])

  const formatTrackedTime = (mins: number | null) => {
    if (mins === null) return '...'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${String(m).padStart(2, '0')}m`
  }

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeCard userName={user?.name || user?.fullName} appName={branding.appName} />

      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <SummaryWidget
          title="Your Role"
          value={user?.roles.join(', ') || 'User'}
          subtitle={`User ID: ${user?.id ? user.id.slice(0, 8) : 'N/A'}...`}
          icon={Shield}
          iconColor="text-emerald-500"
        />

        <SummaryWidget
          title="Today's Tracked"
          value={formatTrackedTime(todayMinutes)}
          subtitle={todaySubtitle}
          icon={Clock}
          iconColor="text-purple-500"
        />

        <SummaryWidget
          title="Leaves This Month"
          value={leavesTaken !== null ? `${leavesTaken} ${leavesTaken === 1 ? 'day' : 'days'}` : '...'}
          subtitle={leavesSubtitle}
          icon={Calendar}
          iconColor="text-amber-500"
        />
      </div>

      {/* Per-Project Monthly Tracked Time Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-indigo-500" />
            <span>Projects • {currentMonthName} Tracked</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {projectSummaries.length} {projectSummaries.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {isProjectsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse h-28"
              />
            ))}
          </div>
        ) : projectSummaries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
            No projects currently assigned to you.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projectSummaries.map((p) => (
              <div
                key={p.projectId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: p.colorHex || '#6366F1' }}
                />
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate block">
                      {p.projectCode || 'PROJECT'}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate mt-0.5" title={p.projectName}>
                      {p.projectName}
                    </h4>
                  </div>
                  <span
                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                    style={{ backgroundColor: p.colorHex || '#6366F1' }}
                  />
                </div>

                <div className="mt-2">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {p.hoursFormatted}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                    <span>{p.entryCount} {p.entryCount === 1 ? 'entry' : 'entries'}</span>
                    {p.clientName && (
                      <span className="truncate max-w-[100px] text-[11px] font-medium text-slate-400" title={p.clientName}>
                        {p.clientName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Quick Launch & Operations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigateTab('timetracker')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Time Tracker</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start recording time against projects and tasks</div>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigateTab('users')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">User Management</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">View system users and manage role assignments</div>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Settings</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage profile, themes, whitelabeling, and security</div>
          </button>
        </div>
      </div>
    </div>
  )
}
