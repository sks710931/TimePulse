import { useState, useEffect } from 'react'
import { User, Mail, Save, X, CheckCircle2 } from 'lucide-react'
import type { UserProfile } from '../../api/authApi'

interface PersonalDetailsCardProps {
  user: UserProfile | null
  onNameChange: (fullName: string, displayName: string) => void
}

export function PersonalDetailsCard({ user, onNameChange }: PersonalDetailsCardProps) {
  const [fullName, setFullName] = useState(user?.name || user?.fullName || '')
  const [displayName, setDisplayName] = useState(user?.name || user?.fullName || '')
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (user) {
      const initialName = user.name || user.fullName || ''
      setFullName(initialName)
      setDisplayName(initialName)
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onNameChange(fullName, displayName)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleCancel = () => {
    const initialName = user?.name || user?.fullName || ''
    setFullName(initialName)
    setDisplayName(initialName)
    setIsSaved(false)
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Personal Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your personal information.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>Personal details updated successfully.</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (!displayName || displayName === fullName) {
                setDisplayName(e.target.value)
              }
            }}
            placeholder="e.g. S Kumar"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
          />
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. S Kumar"
            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
          />
        </div>

        {/* Email Address (read-only) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address (read-only)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              disabled
              value={user?.email || 'skumar@gleason.com'}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed select-all"
            />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  )
}
