import { useState } from 'react'
import { RoleBadge } from '../common/RoleBadge'
import { Mail, Clock, Send, Trash2, Loader2, Users } from 'lucide-react'
import type { InvitationItemDto } from '../../api/userApi'

interface PendingInvitationsTableProps {
  invitations: InvitationItemDto[]
  onResend: (id: string) => Promise<void>
  onRevoke: (id: string) => Promise<void>
}

export function PendingInvitationsTable({
  invitations,
  onResend,
  onRevoke,
}: PendingInvitationsTableProps) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'resend' | 'revoke' | null>(null)

  const handleResend = async (id: string) => {
    setLoadingActionId(id)
    setActionType('resend')
    try {
      await onResend(id)
    } finally {
      setLoadingActionId(null)
      setActionType(null)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation? The invitation link will no longer work.')) {
      return
    }
    setLoadingActionId(id)
    setActionType('revoke')
    try {
      await onRevoke(id)
    } finally {
      setLoadingActionId(null)
      setActionType(null)
    }
  }

  const getExpiryStatus = (expiresAtUtc: string) => {
    const diff = new Date(expiresAtUtc).getTime() - Date.now()
    if (diff <= 0) {
      return { label: 'Expired', isExpired: true }
    }
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) {
      return { label: 'Expires soon', isExpired: false }
    }
    if (hours < 24) {
      return { label: `Expires in ${hours}h`, isExpired: false }
    }
    const days = Math.floor(hours / 24)
    return { label: `Expires in ${days}d`, isExpired: false }
  }

  if (invitations.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        No pending invitations found. Click &quot;Invite User&quot; to invite a team member.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <th className="px-4 py-3">Invited Email</th>
            <th className="px-4 py-3">Assigned Roles</th>
            <th className="px-4 py-3">Teams</th>
            <th className="px-4 py-3">Sent At</th>
            <th className="px-4 py-3">Expiration</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {invitations.map((inv) => {
            const expiry = getExpiryStatus(inv.expiresAtUtc)
            const isRowLoading = loadingActionId === inv.id

            return (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {inv.email}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Pending acceptance</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {inv.roles && inv.roles.length > 0 ? (
                      inv.roles.map((role) => <RoleBadge key={role} role={role} />)
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                  {inv.teamIds && inv.teamIds.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{inv.teamIds.length} {inv.teamIds.length === 1 ? 'team' : 'teams'}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">None</span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(inv.createdAtUtc).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      expiry.isExpired
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{expiry.label}</span>
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResend(inv.id)}
                      disabled={isRowLoading}
                      title="Resend invitation email"
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {isRowLoading && actionType === 'resend' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3" />
                      )}
                      <span>Resend</span>
                    </button>

                    <button
                      onClick={() => handleRevoke(inv.id)}
                      disabled={isRowLoading}
                      title="Revoke invitation"
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isRowLoading && actionType === 'revoke' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
