import type { ReactNode } from 'react'
import { Logo } from '../common/Logo'
import { ThemeToggle } from '../common/ThemeToggle'
import { Alert } from '../common/Alert'

interface AuthCardProps {
  appName: string | null
  subtitle: string
  error?: string | null
  children: ReactNode
  notice?: ReactNode
}

export function AuthCard({ appName, subtitle, error, children, notice }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative transition-colors duration-200">
      {/* Top Theme Switcher */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-2xl shadow-slate-300/40 dark:shadow-indigo-500/10 transition-colors duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          {appName && (
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{appName}</h1>
          )}
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
        </div>

        {/* Optional Role/Feature Notice */}
        {notice && <div className="mb-6">{notice}</div>}

        {/* Error Alert */}
        {error && <Alert type="error" message={error} className="mb-6" />}

        {/* Form Body */}
        {children}
      </div>
    </div>
  )
}
