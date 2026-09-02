import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { checkAuth } from '../store/slices/authSlice'
import { authApi, type ValidateInvitationResponse } from '../api/authApi'
import { AuthCard } from '../components/auth/AuthCard'
import { User, Lock, Mail, ShieldCheck, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'

export function AcceptInvitationPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { appName } = useAppSelector((state) => state.branding)

  const [isValidating, setIsValidating] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [invitationData, setInvitationData] = useState<ValidateInvitationResponse | null>(null)

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setValidationError('No invitation token was found in the link.')
      setIsValidating(false)
      return
    }

    setIsValidating(true)
    setValidationError(null)

    authApi
      .validateInvitation(token)
      .then((data) => {
        setInvitationData(data)
      })
      .catch((err: unknown) => {
        setValidationError(err instanceof Error ? err.message : 'Invalid or expired invitation link.')
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.')
      return
    }

    if (!password || password.length < 6) {
      setSubmitError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.acceptInvitation({
        token,
        fullName: fullName.trim(),
        password,
        confirmPassword,
      })

      setIsSuccess(true)

      // Refresh auth state in Redux so user is immediately logged in
      await dispatch(checkAuth())

      // Redirect to overview after short delay
      setTimeout(() => {
        navigate('/overview', { replace: true })
      }, 1200)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to activate account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state while checking token
  if (isValidating) {
    return (
      <AuthCard appName={appName} subtitle="Verifying your invitation...">
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-xs font-medium">Validating invitation link...</p>
        </div>
      </AuthCard>
    )
  }

  // Invalid or expired token error
  if (validationError) {
    return (
      <AuthCard appName={appName} subtitle="Invitation Link Invalid">
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700 dark:text-red-300">
              <p className="font-bold mb-1">Unable to activate account</p>
              <p>{validationError}</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            If you believe this is an error, please contact your workspace administrator to request a new invitation link.
          </p>

          <Link
            to="/login"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Return to Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </AuthCard>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthCard appName={appName} subtitle="Account Activated!">
        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Welcome to {appName || 'TimePulse'}!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your password has been set. Redirecting you to your dashboard...
          </p>
          <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin mt-2" />
        </div>
      </AuthCard>
    )
  }

  // Activation form
  return (
    <AuthCard
      appName={appName}
      subtitle="Complete your account setup to get started"
      error={submitError}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email & Roles Preview */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {invitationData?.email}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Assigned Role:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {invitationData?.roles.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Create Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <span>Set Password &amp; Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center pt-2">
          Already have an active account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthCard>
  )
}
