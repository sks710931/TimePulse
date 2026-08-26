import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUser, clearError } from '../store/slices/authSlice'
import { AuthCard } from '../components/auth/AuthCard'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const { appName } = useAppSelector((state) => state.branding)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (credentials: { email: string; password: string }) => {
    await dispatch(loginUser(credentials))
  }

  return (
    <AuthCard
      appName={appName}
      subtitle="Sign in to access your dashboard"
      error={error}
    >
      <LoginForm isLoading={isLoading} onSubmit={handleLogin} />
    </AuthCard>
  )
}
