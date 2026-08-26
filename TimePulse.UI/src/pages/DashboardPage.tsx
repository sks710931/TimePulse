import { useState, useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import { apiClient } from '../api/apiClient'
import { Sidebar, type TabId } from '../components/layout/Sidebar'
import { TopHeader } from '../components/layout/TopHeader'
import { OverviewTab } from '../components/dashboard/OverviewTab'
import { TimeTrackerTab } from '../components/dashboard/TimeTrackerTab'
import { UserManagementTab } from '../components/dashboard/UserManagementTab'
import { WhitelabelingTab } from '../components/dashboard/WhitelabelingTab'
import { ApiTesterTab } from '../components/dashboard/ApiTesterTab'
import { ReduxDemoTab } from '../components/dashboard/ReduxDemoTab'
import type { UserItem } from '../components/dashboard/UserTable'
import type { WeatherItem } from '../components/dashboard/ForecastCard'

export function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)

  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('tp_sidebar_collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Protected API (Weather) State
  const [forecasts, setForecasts] = useState<WeatherItem[]>([])
  const [forecastLoading, setForecastLoading] = useState(false)
  const [forecastError, setForecastError] = useState<string | null>(null)

  // Users Management State
  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const isAdmin = Boolean(user?.roles.includes('Admin'))

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('tp_sidebar_collapsed', String(next))
      return next
    })
  }

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
        {/* Top Navbar Header */}
        <TopHeader
          title={tabTitles[activeTab]}
          appName={branding.appName}
          user={user}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onOpenMobile={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Tab Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              branding={branding}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'timetracker' && <TimeTrackerTab />}

          {activeTab === 'users' && isAdmin && (
            <UserManagementTab
              users={users}
              isLoading={usersLoading}
              error={usersError}
              onRefresh={fetchUsers}
            />
          )}

          {activeTab === 'branding' && isAdmin && <WhitelabelingTab />}

          {activeTab === 'weather' && (
            <ApiTesterTab
              forecasts={forecasts}
              isLoading={forecastLoading}
              error={forecastError}
              onRefresh={fetchWeather}
            />
          )}

          {activeTab === 'redux' && <ReduxDemoTab />}
        </main>
      </div>
    </div>
  )
}
