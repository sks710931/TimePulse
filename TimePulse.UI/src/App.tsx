import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { checkAuth } from './store/slices/authSlice'
import { fetchBranding } from './store/slices/brandingSlice'
import { applyThemeToDom, applyBrandColorsToDom } from './store/slices/themeSlice'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { PublicOnlyRoute } from './components/common/PublicOnlyRoute'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
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
        {/* Root Route: / => if authenticated /dashboard else /login */}
        <Route
          path="/"
          element={
            isCheckingAuth ? (
              <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
                <p className="text-sm font-medium">Loading {appName || 'TimePulse'}...</p>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes (Redirect to /dashboard if already authenticated) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes (Redirect to /login if not authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Catch-all: redirect to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
