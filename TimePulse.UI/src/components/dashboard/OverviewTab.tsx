import { WelcomeCard } from './WelcomeCard'
import { SummaryWidget } from './SummaryWidget'
import { Sparkles, Shield, Clock, Users, Palette, ArrowRight } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'
import type { BrandSettings } from '../../api/brandingApi'
import type { TabId } from '../layout/Sidebar'

interface OverviewTabProps {
  user: UserProfile | null
  branding: BrandSettings
  onNavigateTab: (tabId: TabId) => void
}

export function OverviewTab({ user, branding, onNavigateTab }: OverviewTabProps) {
  const isAdmin = Boolean(user?.roles.includes('Admin'))

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeCard userName={user?.name || user?.fullName} appName={branding.appName} />

      {/* Quick Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryWidget
          title="App Name"
          value={branding.appName || '(Logo only)'}
          subtitle={branding.isCustom ? 'Custom Branding Active' : 'Default Branding'}
          icon={Sparkles}
          iconColor="text-indigo-500"
        />

        <SummaryWidget
          title="Your Role"
          value={user?.roles.join(', ') || 'User'}
          subtitle={`User ID: ${user?.id ? user.id.slice(0, 8) : 'N/A'}...`}
          icon={Shield}
          iconColor="text-emerald-500"
        />

        <SummaryWidget
          title="Today's Tracked"
          value="0h 00m"
          subtitle="No active timers right now"
          icon={Clock}
          iconColor="text-purple-500"
        />

        <SummaryWidget
          title="Security"
          value="JWT httpOnly"
          subtitle="Automated refresh rotation"
          icon={Shield}
          iconColor="text-amber-500"
        />
      </div>

      {/* Quick Actions Card */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Quick Launch & Operations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              onClick={() => onNavigateTab('branding')}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">Whitelabeling</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure custom application name and dark/light logos</div>
            </button>
          )}

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
        </div>
      </div>
    </div>
  )
}
