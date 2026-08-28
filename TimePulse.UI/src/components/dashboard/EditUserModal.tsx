import { useState, useEffect } from 'react'
import { X, UserCheck, Shield, Briefcase, User, Mail, Loader2, Save } from 'lucide-react'
import { userApi, type UserItemDto } from '../../api/userApi'

interface EditUserModalProps {
  isOpen: boolean
  user: UserItemDto | null
  onClose: () => void
  onUserUpdated: () => void
  isCallerAdmin: boolean
  isCallerManager: boolean
  currentUserId?: string
}

export function EditUserModal({
  isOpen,
  user,
  onClose,
  onUserUpdated,
  isCallerAdmin,
  isCallerManager: _isCallerManager,
  currentUserId,
}: EditUserModalProps) {
  const [fullName, setFullName] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelfEdit = Boolean(user && currentUserId && user.id.toLowerCase() === currentUserId.toLowerCase())

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || user.name || '')
      setSelectedRoles(user.roles || [])
      setError(null)
    }
  }, [user])

  if (!isOpen || !user) return null

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) => {
      const exists = prev.some((r) => r.toLowerCase() === role.toLowerCase())
      if (exists) {
        return prev.filter((r) => r.toLowerCase() !== role.toLowerCase())
      } else {
        return [...prev, role]
      }
    })
  }

  const hasRole = (role: string) => {
    return selectedRoles.some((r) => r.toLowerCase() === role.toLowerCase())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    if (selectedRoles.length === 0) {
      setError('A user must have at least one role assigned.')
      return
    }

    setIsLoading(true)
    try {
      await userApi.updateUser(user.id, {
        fullName: fullName.trim(),
        roles: selectedRoles,
      })
      onUserUpdated()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit User & Assign Roles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSelfEdit
                  ? 'Update your personal details and assigned roles.'
                  : `Modify details and permissions for ${user.email}.`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Email Address (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address (Read-Only)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed select-all"
              />
            </div>
          </div>

          {/* Multi-Role Assignment Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assigned Roles (Select Multiple)
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedRoles.length} selected
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Admin Role (Only for Admins) */}
              {isCallerAdmin && (
                <label
                  onClick={() => toggleRole('Admin')}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                    hasRole('Admin')
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasRole('Admin')}
                    onChange={() => {}} // Handled by parent label click
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Admin
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Full administrative control over settings, branding, and all users.
                    </p>
                  </div>
                </label>
              )}

              {/* Manager Role */}
              {(isCallerAdmin || (isSelfEdit && hasRole('Manager'))) && (
                <label
                  onClick={() => {
                    if (isCallerAdmin) {
                      toggleRole('Manager')
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                    isCallerAdmin ? 'cursor-pointer select-none' : 'cursor-default opacity-80'
                  } ${
                    hasRole('Manager')
                      ? 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hasRole('Manager')}
                    disabled={!isCallerAdmin}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 pointer-events-none"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Manager
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Team oversight and permission to create and manage Employee accounts.
                    </p>
                  </div>
                </label>
              )}

              {/* Employee Role */}
              <label
                onClick={() => toggleRole('Employee')}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                  hasRole('Employee')
                    ? 'border-sky-600 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-1 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasRole('Employee')}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Employee
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Standard employee access for time tracking and individual dashboards.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
