import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { authApi } from '../api/authApi'
import { AuthCard } from '../components/auth/AuthCard'
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

export function ForgotPasswordPage() {
  const { appName } = useAppSelector((state) => state.branding)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await authApi.forgotPassword(email.trim())
      setIsSubmitted(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthCard appName={appName} subtitle="Check your email">
        <div className="space-y-6 text-center animate-in fade-in duration-150">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Password Reset Link Sent
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If an account exists with <strong className="text-slate-700 dark:text-slate-200">{email}</strong>, we have sent instructions to reset your password.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              The reset link will expire in <strong>2 hours</strong>. Be sure to check your spam or junk folder.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Return to Sign In
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false)
                setError(null)
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Did not receive the email? Try again
            </button>
          </div>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      appName={appName}
      subtitle="Forgot your password? Enter your email to receive a reset link."
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
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
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthCard>
  )
}
