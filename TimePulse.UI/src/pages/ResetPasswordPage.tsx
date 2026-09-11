import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { authApi } from '../api/authApi'
import { AuthCard } from '../components/auth/AuthCard'
import { Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const { appName } = useAppSelector((state) => state.branding)

  const [isValidating, setIsValidating] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [associatedEmail, setAssociatedEmail] = useState<string | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setValidationError('No reset token was found in the link. Please request a new password reset link.')
      setIsValidating(false)
      return
    }

    setIsValidating(true)
    setValidationError(null)

    authApi
      .validateResetToken(token)
      .then((data) => {
        setAssociatedEmail(data.email || null)
      })
      .catch((err: unknown) => {
        setValidationError(err instanceof Error ? err.message : 'This password reset link is invalid or has expired.')
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!newPassword || newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword({
        token,
        newPassword,
        confirmPassword,
      })

      setIsSuccess(true)

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state while verifying token
  if (isValidating) {
    return (
      <AuthCard appName={appName} subtitle="Verifying your reset link...">
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-xs font-medium">Validating password reset link...</p>
        </div>
      </AuthCard>
    )
  }

  // Token invalid or expired
  if (validationError) {
    return (
      <AuthCard appName={appName} subtitle="Password Reset">
        <div className="space-y-6 text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Invalid or Expired Link
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {validationError}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/forgot-password"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Request New Reset Link
            </Link>

            <Link
              to="/login"
              className="inline-block text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </AuthCard>
    )
  }

  // Password reset successful
  if (isSuccess) {
    return (
      <AuthCard appName={appName} subtitle="Password Reset Complete">
        <div className="space-y-6 text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Password Changed Successfully!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your password has been updated. You can now sign in using your new password.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Redirecting to sign in shortly...
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      appName={appName}
      subtitle={associatedEmail ? `Set a new password for ${associatedEmail}` : 'Enter your new password below'}
      error={submitError}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Must be at least 6 characters.
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <span>Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
