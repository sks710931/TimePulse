import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerUser, clearError } from '../store/slices/authSlice'
import { AuthCard } from '../components/auth/AuthCard'
import { RegisterForm } from '../components/auth/RegisterForm'
import { ShieldCheck } from 'lucide-react'

export function RegisterPage() {
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

  const handleRegister = async (userData: { fullName: string; email: string; password: string }) => {
    await dispatch(registerUser(userData))
  }

  const roleNotice = (
    <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-xs">
      <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      <span>New signups automatically receive full <strong>Admin</strong> privileges.</span>
    </div>
  )

  return (
    <AuthCard
      appName={appName}
      subtitle="Create your administrator account"
      error={error}
      notice={roleNotice}
    >
      <RegisterForm isLoading={isLoading} onSubmit={handleRegister} />
    </AuthCard>
  )
}
