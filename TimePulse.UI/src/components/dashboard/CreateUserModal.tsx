import { useState, useEffect } from 'react'
import { X, Mail, Briefcase, UserCheck, Loader2, Send, Check } from 'lucide-react'
import { userApi } from '../../api/userApi'
import { teamApi, type TeamDto } from '../../api/teamApi'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
  isAdmin: boolean
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
  isAdmin,
}: CreateUserModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'Manager' | 'Employee'>('Employee')
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setRole('Employee')
      setSelectedTeamIds([])
      setError(null)
      setSuccessMessage(null)

      // Load available teams for assignment
      setIsLoadingTeams(true)
      teamApi
        .getTeams()
        .then((data) => setTeams(data))
        .catch(() => setTeams([]))
        .finally(() => setIsLoadingTeams(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Email address is required.')
      return
    }

    const assignedRole = isAdmin ? role : 'Employee'

    setIsLoading(true)
    try {
      await userApi.inviteUser({
        email: normalizedEmail,
        roles: [assignedRole],
        teamIds: selectedTeamIds.length > 0 ? selectedTeamIds : undefined,
      })

      setSuccessMessage(`Invitation successfully sent to ${normalizedEmail}!`)
      setTimeout(() => {
        onUserCreated()
        onClose()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invite New User
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? 'Send an invitation link to onboard a Manager or Employee.'
                  : 'Send an invitation link to onboard an Employee.'}
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

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. colleague@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              The user will receive an email invitation to set up their password.
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign Role
            </label>

            {isAdmin ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Employee')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    role === 'Employee'
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 mt-0.5 shrink-0 ${role === 'Employee' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Employee</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Time tracking & team tasks
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Manager')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    role === 'Manager'
                      ? 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Briefcase className={`w-4 h-4 mt-0.5 shrink-0 ${role === 'Manager' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold block">Manager</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Team oversight & projects
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/60 dark:bg-sky-950/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">
                      Employee
                    </span>
                    <span className="text-[11px] text-sky-700 dark:text-sky-400 block">
                      Managers are authorized to invite Employee accounts.
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                  Fixed
                </span>
              </div>
            )}
          </div>

          {/* Add to Teams (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Add to Teams (Optional)
            </label>
            {isLoadingTeams ? (
              <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading available teams...</span>
              </div>
            ) : teams.length === 0 ? (
              <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                No teams available yet. You can assign teams later from the Teams page.
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40">
                {teams.map((t) => {
                  const isChecked = selectedTeamIds.includes(t.id)
                  return (
                    <label
                      key={t.id}
                      className="flex items-center justify-between p-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: t.colorHex || '#6366f1' }}
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {t.name}
                        </span>
                      </div>

                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTeam(t.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </label>
                  )
                })}
              </div>
            )}
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
              disabled={isLoading || Boolean(successMessage)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending Invitation...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
