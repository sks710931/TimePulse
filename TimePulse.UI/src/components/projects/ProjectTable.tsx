import { Edit2, Trash2, Building2, Hash, Users2 } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface ProjectTableProps {
  projects: ProjectDto[]
  canManage: boolean
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
  onManageTeams?: (project: ProjectDto) => void
}

export function ProjectTable({
  projects,
  canManage,
  onEdit,
  onDelete,
  onManageTeams,
}: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400">
        No projects found matching the current search and filter.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Assigned Teams</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created Date</th>
            {canManage && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
          {projects.map((p) => {
            const accentColor = p.colorHex || '#4F46E5'
            const initial = p.name.charAt(0).toUpperCase()
            const projectTeams = p.teams || []

            return (
              <tr
                key={p.id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
              >
                {/* Project Name & Description */}
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
                        {p.name}
                      </div>
                      {p.description && (
                        <p className="text-xs font-normal text-slate-500 dark:text-slate-400 truncate max-w-md mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Project Code */}
                <td className="px-4 py-3.5">
                  {p.code ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Hash className="w-3 h-3 text-slate-400" />
                      {p.code}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {/* Client Name */}
                <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300">
                  {p.clientName ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.clientName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>

                {/* Assigned Teams */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {projectTeams.length > 0 ? (
                      projectTeams.slice(0, 2).map((t) => (
                        <span
                          key={t.teamId}
                          title={`${t.name} (${t.memberCount} members)`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          <Users2 className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate max-w-[100px]">{t.name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No teams assigned</span>
                    )}

                    {projectTeams.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        +{projectTeams.length - 2} more
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3.5">
                  <ProjectStatusBadge isActive={p.isActive} />
                </td>

                {/* Created Date */}
                <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                  {p.createdAtUtc ? new Date(p.createdAtUtc).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                {canManage && (
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {onManageTeams && (
                        <button
                          onClick={() => onManageTeams(p)}
                          title="Manage Teams"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                        >
                          <Users2 className="w-3.5 h-3.5" />
                          <span>Teams</span>
                        </button>
                      )}

                      <button
                        onClick={() => onEdit(p)}
                        title={`Edit ${p.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => onDelete(p)}
                        title={`Delete ${p.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-300 rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
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
