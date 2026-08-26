import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../store/slices/authSlice'
import { increment, decrement, reset } from '../store/slices/counterSlice'
import {
  Clock,
  LogOut,
  Users,
  Shield,
  CloudSun,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
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
  const counter = useAppSelector((state) => state.counter.value)

  const [forecasts, setForecasts] = useState<WeatherItem[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const isAdmin = user?.roles.includes('Admin')

  const fetchWeather = async () => {
    setForecastLoading(true)
    setForecastError(null)
    try {
      const res = await fetch('/weatherforecast', { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
      }
      const data = await res.json()
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
      const res = await fetch('/api/users', { credentials: 'include' })
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.status}`)
      }
      const data = await res.json()
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

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">TimePulse</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Time & Pulse Tracking</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-white">{user?.name}</span>
            <span className="text-xs text-slate-400">{user?.email}</span>
          </div>

          <div className="flex gap-1.5">
            {user?.roles.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600/20 border border-indigo-500/30 text-indigo-300"
              >
                <Shield className="w-3 h-3" />
                {r}
              </span>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-xs font-medium text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/40 border border-indigo-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.name}! 👋</h1>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                You are securely authenticated using <strong>JWT in httpOnly cookies</strong> (1-min access token + 7-day refresh token rotation).
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-medium shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>JWT Cookie Active</span>
            </div>
          </div>
        </div>

        {/* Admin Management Section */}
        {isAdmin && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">User Management (Admin Only)</h2>
              </div>
              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {usersError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {usersError}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b border-slate-800">Name</th>
                    <th className="px-4 py-3 border-b border-slate-800">Email</th>
                    <th className="px-4 py-3 border-b border-slate-800">Assigned Roles</th>
                    <th className="px-4 py-3 border-b border-slate-800">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{u.fullName}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 border border-indigo-800/60 text-indigo-300"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(u.createdAtUtc).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Two-Column Grid: Weather API Test & Redux State Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protected API Test */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">Protected API Test: Weather Forecast</h2>
                </div>
                <button
                  onClick={fetchWeather}
                  disabled={forecastLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${forecastLoading ? 'animate-spin' : ''}`} />
                  <span>Fetch Forecast</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Validates the <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded font-mono">/weatherforecast</code> endpoint protected by <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded font-mono">[Authorize]</code>.
              </p>

              {forecastError && (
                <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  {forecastError}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {forecasts.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center flex flex-col justify-between">
                    <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>{f.date}</span>
                    </div>
                    <div className="text-xl font-bold text-white my-1">
                      {f.temperatureC}°C
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {f.temperatureF}°F
                    </div>
                    <div className="mt-2 text-xs font-medium text-indigo-400 truncate">
                      {f.summary}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Redux State Demo */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Redux State Demo</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Verified Redux Toolkit slice state management alongside authentication.
              </p>

              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/60 border border-slate-800 mb-4">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">
                  Counter Value
                </span>
                <span className="text-4xl font-extrabold text-white font-mono">{counter}</span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => dispatch(decrement())}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-lg flex items-center justify-center transition-all cursor-pointer"
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
                  className="px-4 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              <span>Redux Toolkit + React Router + Tailwind</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
