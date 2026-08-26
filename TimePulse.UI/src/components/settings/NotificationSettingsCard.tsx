import { useState } from 'react'
import { Bell, Clock, ShieldCheck, Mail } from 'lucide-react'

export function NotificationSettingsCard() {
  const [notifications, setNotifications] = useState({
    timerReminder: true,
    weeklyReport: true,
    securityAlerts: true,
  })

  const toggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure email and in-app alert preferences.</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Active Timer Reminders
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive notifications when a timer has been running continuously for over 4 hours.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('timerReminder')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              notifications.timerReminder ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notifications.timerReminder ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Weekly Time Summary Digest
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get a weekly email summary of logged project hours every Monday morning.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('weeklyReport')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              notifications.weeklyReport ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notifications.weeklyReport ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Account Security Alerts
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive notifications regarding new logins, password changes, and token rotations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggle('securityAlerts')}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              notifications.securityAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notifications.securityAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
