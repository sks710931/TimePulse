import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { saveBranding, resetBranding, clearBrandingMessages } from '../store/slices/brandingSlice'
import { increment, decrement, reset } from '../store/slices/counterSlice'
import { apiClient } from '../api/apiClient'
import { Sidebar } from '../components/Sidebar'
import type { TabId } from '../components/Sidebar'
import {
  Users,
  Shield,
  CloudSun,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Palette,
  Upload,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Menu,
  Clock,
  Play,
  Pause,
  Square,
} from 'lucide-react'

interface WeatherItem {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string
}

interface UserItem {
  id: string
  email: string
  fullName: string
  createdAtUtc: string
  roles: string[]
}

export function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)
  const counter = useAppSelector((state) => state.counter.value)

  // Sidebar & Navigation State
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tp_sidebar_collapsed') === 'true'
    } catch {
      return false
    }
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem('tp_sidebar_collapsed', String(next))
      } catch {
        // Ignore
      }
      return next
    })
  }

  // Timer Demo State
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Weather & Users State
  const [forecasts, setForecasts] = useState<WeatherItem[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Branding Customization State (Admin)
  const [customAppName, setCustomAppName] = useState(branding.appName || '')
  const [customLogoData, setCustomLogoData] = useState<string | null>(branding.logoData)
  const [customLogoType, setCustomLogoType] = useState<string>(branding.logoType)
  const [uploadFileName, setUploadFileName] = useState<string>('')

  const isAdmin = user?.roles.includes('Admin')

  useEffect(() => {
    setCustomAppName(branding.appName || '')
    setCustomLogoData(branding.logoData)
    setCustomLogoType(branding.logoType)
  }, [branding.appName, branding.logoData, branding.logoType])

  const fetchWeather = async () => {
    setForecastLoading(true)
    setForecastError(null)
    try {
      const data = await apiClient.get<WeatherItem[]>('/weatherforecast')
      setForecasts(data)
    } catch (err: unknown) {
      setForecastError(err instanceof Error ? err.message : 'Error loading forecast')
    } finally {
      setForecastLoading(false)
    }
  }

  const fetchUsers = async () => {
    if (!isAdmin) return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await apiClient.get<UserItem[]>('/api/users')
      setUsers(data)
    } catch (err: unknown) {
      setUsersError(err instanceof Error ? err.message : 'Error loading users')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadFileName(file.name)
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg')

    const reader = new FileReader()
    if (isSvg) {
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCustomLogoData(content)
        setCustomLogoType('Svg')
      }
      reader.readAsText(file)
    } else {
      reader.onload = (event) => {
        const content = event.target?.result as string
        setCustomLogoData(content)
        setCustomLogoType('Image')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveBranding = async () => {
    dispatch(clearBrandingMessages())
    await dispatch(
      saveBranding({
        appName: customAppName,
        logoData: customLogoData,
        logoType: customLogoType,
      })
    )
  }

  const handleResetBranding = async () => {
    dispatch(clearBrandingMessages())
    setUploadFileName('')
    await dispatch(resetBranding())
  }

  const tabTitles: Record<TabId, string> = {
    overview: 'Overview Dashboard',
    timetracker: 'Time Tracker',
    users: 'User Management',
    branding: 'Whitelabeling & Branding',
    weather: 'Protected API Tester',
    redux: 'Redux Toolkit Demo',
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Hamburger Button (Toggles sidebar on desktop, opens drawer on mobile) */}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen(true)
                } else {
                  handleToggleCollapse()
                }
              }}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {tabTitles[activeTab]}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {branding.appName || 'TimePulse'} Enterprise Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex gap-1">
              {user?.roles.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300"
                >
                  <Shield className="w-3 h-3" />
                  {r}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/60 dark:via-slate-900/60 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden transition-colors duration-200">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      Welcome, {user?.name}! 👋
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                      Authenticated in <strong>{branding.appName || 'TimePulse'}</strong> via secure <strong>httpOnly JWT cookies</strong> with refresh rotation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-medium shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Session Active</span>
                  </div>
                </div>
              </div>

              {/* Quick Summary Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">App Name</span>
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white truncate">
                    {branding.appName || 'TimePulse'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {branding.isCustom ? 'Custom Branding Active' : 'Default Branding'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Your Role</span>
                    <Shield className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {user?.roles.join(', ') || 'User'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isAdmin ? 'Full Administrative Access' : 'Standard Member'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Users</span>
                    <Users className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {isAdmin ? users.length : '—'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isAdmin ? 'Registered accounts' : 'Admin only'}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Timer</span>
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    {formatTimer(timerSeconds)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isTimerRunning ? 'Timer running' : 'Timer stopped'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIME TRACKER TAB */}
          {activeTab === 'timetracker' && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg text-center space-y-6">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Clock className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-wider">
                  {formatTimer(timerSeconds)}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  {isTimerRunning ? 'Pulse Tracking is active' : 'Click Start to track your time entry'}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {!isTimerRunning ? (
                  <button
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Timer</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTimerRunning(false)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause Timer</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsTimerRunning(false)
                    setTimerSeconds(0)
                  }}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all cursor-pointer"
                >
                  <Square className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* USER MANAGEMENT TAB (ADMIN) */}
          {activeTab === 'users' && isAdmin && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Registered Users</h2>
                </div>
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Users</span>
                </button>
              </div>

              {usersError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                  {usersError}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Name</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Email</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Assigned Roles</th>
                      <th className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.fullName}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{u.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <span
                                key={r}
                                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(u.createdAtUtc).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WHITELABELING TAB (ADMIN) */}
          {activeTab === 'branding' && isAdmin && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Whitelabeling & Custom Branding</h2>
                </div>
                {branding.isCustom ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    <Sparkles className="w-3 h-3" />
                    Custom Branding Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    Default TimePulse Branding
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Customize the application name and upload your company logo (supports <strong>SVG vector</strong>, <strong>PNG</strong>, and <strong>WebP/JPG images</strong>). Changes will apply globally across Login, Register, Sidebar, and Dashboard.
              </p>

              {branding.error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{branding.error}</span>
                </div>
              )}

              {branding.successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{branding.successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Settings Form */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Application Name (Optional - default is TimePulse)
                    </label>
                    <input
                      type="text"
                      value={customAppName}
                      onChange={(e) => setCustomAppName(e.target.value)}
                      placeholder="Leave blank for TimePulse or enter custom name"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Upload Custom Logo (SVG, PNG, JPG, WebP)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all">
                        <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Choose File...</span>
                        <input
                          type="file"
                          accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {uploadFileName || (customLogoData ? `Logo (${customLogoType}) loaded` : 'No file chosen (using default logo)')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={handleSaveBranding}
                      disabled={branding.isSaving}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-60 cursor-pointer"
                    >
                      {branding.isSaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Save Branding</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleResetBranding}
                      disabled={branding.isSaving}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Default</span>
                    </button>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center flex flex-col items-center justify-center transition-colors duration-200">
                  <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
                    Live Preview
                  </span>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl w-full flex items-center justify-center gap-3 shadow-sm">
                    {customLogoType === 'Svg' && customLogoData ? (
                      <div
                        className="w-10 h-10 flex items-center justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                        dangerouslySetInnerHTML={{ __html: customLogoData }}
                      />
                    ) : customLogoData ? (
                      <img
                        src={customLogoData}
                        alt="Logo preview"
                        className="w-10 h-10 object-contain rounded-lg"
                      />
                    ) : (
                      <Clock className="w-8 h-8 text-indigo-500" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {customAppName || 'TimePulse'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-2">
                    Format: {customLogoType} | Status: {customLogoData ? 'Custom' : 'Default'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PROTECTED API TEST TAB */}
          {activeTab === 'weather' && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Protected API Test: Weather Forecast</h2>
                </div>
                <button
                  onClick={fetchWeather}
                  disabled={forecastLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-600/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${forecastLoading ? 'animate-spin' : ''}`} />
                  <span>Fetch Forecast</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Validates the <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.5 rounded font-mono">/weatherforecast</code> endpoint protected by <code className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.5 rounded font-mono">[Authorize]</code>.
              </p>

              {forecastError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
                  {forecastError}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {forecasts.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between transition-colors">
                    <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{f.date}</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white my-1">
                      {f.temperatureC}°C
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {f.temperatureF}°F
                    </div>
                    <div className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 truncate">
                      {f.summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REDUX DEMO TAB */}
          {activeTab === 'redux' && (
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none flex flex-col justify-between transition-colors duration-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Redux Toolkit State Demo</h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Verified Redux Toolkit slice state management alongside authentication and branding.
                </p>

                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-4 max-w-sm mx-auto">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">
                    Counter Value
                  </span>
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{counter}</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => dispatch(decrement())}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => dispatch(increment())}
                    className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg flex items-center justify-center transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => dispatch(reset())}
                    className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <Layers className="w-3.5 h-3.5" />
                <span>Redux Toolkit + React Router + Tailwind v4</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
