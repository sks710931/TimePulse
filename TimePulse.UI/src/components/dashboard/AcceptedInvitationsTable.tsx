import { RoleBadge } from '../common/RoleBadge'
import { CheckCircle2, Calendar, Users } from 'lucide-react'
import type { InvitationItemDto } from '../../api/userApi'

interface AcceptedInvitationsTableProps {
  invitations: InvitationItemDto[]
}

export function AcceptedInvitationsTable({ invitations }: AcceptedInvitationsTableProps) {
  if (invitations.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        No accepted invitations yet.
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
            <th className="px-4 py-3">Invited Date</th>
            <th className="px-4 py-3">Accepted Date</th>
            <th className="px-4 py-3 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {invitations.map((inv) => {
            return (
              <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-900/40 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {inv.email}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Account created
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
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(inv.createdAtUtc).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  {inv.consumedAtUtc ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        {new Date(inv.consumedAtUtc).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Activated</span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
