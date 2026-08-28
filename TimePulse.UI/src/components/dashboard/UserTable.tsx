import { RoleBadge } from '../common/RoleBadge'
import { Edit2 } from 'lucide-react'
import type { UserItemDto } from '../../api/userApi'

export type UserItem = UserItemDto

interface UserTableProps {
  users: UserItemDto[]
  onEditUser?: (user: UserItemDto) => void
  isCallerAdmin?: boolean
  isCallerManager?: boolean
  currentUserId?: string
}

export function UserTable({
  users,
  onEditUser,
  isCallerAdmin = false,
  isCallerManager = false,
  currentUserId,
}: UserTableProps) {
  const canEditUser = (target: UserItemDto): boolean => {
    if (isCallerAdmin) return true

    if (isCallerManager) {
      // Manager can edit themselves
      if (currentUserId && target.id.toLowerCase() === currentUserId.toLowerCase()) {
        return true
      }
      // Manager can edit pure Employees (no Admin or Manager roles)
      const targetRoles = target.roles?.map((r) => r.toLowerCase()) || []
      const isTargetAdminOrManager = targetRoles.includes('admin') || targetRoles.includes('manager')
      return !isTargetAdminOrManager
    }

    return false
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Roles</th>
            <th className="px-4 py-3">Joined Date</th>
            {onEditUser && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {users.map((u) => {
            const displayName = u.fullName || u.name || u.email || 'User'
            const initial = displayName.charAt(0).toUpperCase()
            const userRoles = u.roles || []
            const allowEdit = canEditUser(u)

            return (
              <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {initial}
                    </div>
                    <span className="truncate">{displayName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {userRoles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">
                  {u.createdAtUtc ? new Date(u.createdAtUtc).toLocaleDateString() : 'N/A'}
                </td>
                {onEditUser && (
                  <td className="px-4 py-3 text-right">
                    {allowEdit ? (
                      <button
                        onClick={() => onEditUser(u)}
                        title={`Edit ${displayName}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 text-xs italic">
                        Restricted
                      </span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
