import { Edit2, Trash2, Users, FolderKanban } from 'lucide-react'
import type { TeamDto } from '../../api/teamApi'

interface TeamTableProps {
  teams: TeamDto[]
  canManage: boolean
  onEdit: (team: TeamDto) => void
  onDelete: (team: TeamDto) => void
  onManageMembers: (team: TeamDto) => void
  onManageProjects: (team: TeamDto) => void
}

export function TeamTable({
  teams,
  canManage,
  onEdit,
  onDelete,
  onManageMembers,
  onManageProjects,
}: TeamTableProps) {
  if (teams.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        No teams found matching the current search or filter.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">Members</th>
            <th className="px-4 py-3">Assigned Projects</th>
            <th className="px-4 py-3">Created Date</th>
            {canManage && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {teams.map((t) => {
            const accentColor = t.colorHex || '#4F46E5'
            const initial = t.name.charAt(0).toUpperCase()

            return (
              <tr
                key={t.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                {/* Team Name & Description */}
                <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 shadow-xs text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {t.name}
                      </div>
                      {t.description && (
                        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Team Members */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.members.length > 0 ? (
                      t.members.slice(0, 3).map((m) => (
                        <span
                          key={m.userId}
                          title={`${m.fullName || m.email} (${m.roles.join(', ')})`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span className="truncate max-w-[90px]">{m.fullName || m.email}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No members assigned</span>
                    )}

                    {t.members.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        +{t.members.length - 3} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Assigned Projects */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.projects.length > 0 ? (
                      t.projects.slice(0, 2).map((p) => (
                        <span
                          key={p.projectId}
                          title={p.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          <FolderKanban className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[110px]">{p.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No projects assigned</span>
                    )}

                    {t.projects.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        +{t.projects.length - 2} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Created Date */}
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                  {t.createdAtUtc ? new Date(t.createdAtUtc).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                {canManage && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onManageMembers(t)}
                        title="Manage Members"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Members</span>
                      </button>

                      <button
                        onClick={() => onManageProjects(t)}
                        title="Manage Projects"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                      >
                        <FolderKanban className="w-3.5 h-3.5" />
                        <span>Projects</span>
                      </button>

                      <button
                        onClick={() => onEdit(t)}
                        title={`Edit ${t.name}`}
                        className="inline-flex items-center gap-1 p-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(t)}
                        title={`Delete ${t.name}`}
                        className="inline-flex items-center gap-1 p-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
