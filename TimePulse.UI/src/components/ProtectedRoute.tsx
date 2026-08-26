import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth)

  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
