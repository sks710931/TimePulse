import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import { Loader2 } from 'lucide-react'

export function PublicOnlyRoute() {
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)
  const { appName } = useAppSelector((state) => state.branding)

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
        <p className="text-sm font-medium">Loading {appName || 'TimePulse'}...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
