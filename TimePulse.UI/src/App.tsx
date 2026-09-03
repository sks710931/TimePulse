import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import { fetchBranding } from './store/slices/brandingSlice'
import { applyThemeToDom, applyBrandColorsToDom } from './store/slices/themeSlice'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { PublicOnlyRoute } from './components/common/PublicOnlyRoute'
import { LoginPage } from './pages/LoginPage'
import { AcceptInvitationPage } from './pages/AcceptInvitationPage'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { OverviewPage } from './pages/OverviewPage'
import { TimeTrackerPage } from './pages/TimeTrackerPage'
import { LeavesPage } from './pages/LeavesPage'
import { ReportsPage } from './pages/ReportsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { TeamsPage } from './pages/TeamsPage'
import { UserManagementPage } from './pages/UserManagementPage'
import { SettingsPage } from './pages/SettingsPage'
import { Loader2 } from 'lucide-react'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)
  const { appName, primaryColorLight, primaryColorDark } = useAppSelector((state) => state.branding)
  const themeMode = useAppSelector((state) => state.theme.mode)

  useEffect(() => {
    dispatch(checkAuth())
    dispatch(fetchBranding())
  }, [dispatch])

  useEffect(() => {
    if (appName) {
      document.title = appName
    }
  }, [appName])

  useEffect(() => {
    applyThemeToDom(themeMode)
    applyBrandColorsToDom(primaryColorLight, primaryColorDark, themeMode)

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        applyThemeToDom('system')
        applyBrandColorsToDom(primaryColorLight, primaryColorDark, 'system')
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [themeMode, primaryColorLight, primaryColorDark])

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route: / => if authenticated /overview else /login */}
        <Route
          path="/"
          element={
            isCheckingAuth ? (
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
                <p className="text-sm font-medium">Loading {appName || 'TimePulse'}...</p>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/overview" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Invitation Accept Route */}
        <Route path="/invite/accept" element={<AcceptInvitationPage />} />

        {/* Public Routes (Redirect to /overview if already authenticated) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
        </Route>

        {/* Protected Application Routes with DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/timetracker" element={<TimeTrackerPage />} />
            <Route path="/leaves" element={<LeavesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:subTab" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all: redirect to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
