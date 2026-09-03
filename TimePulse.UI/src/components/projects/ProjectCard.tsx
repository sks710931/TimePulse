import { Building2, Calendar, Edit2, Trash2, Hash } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface ProjectCardProps {
  project: ProjectDto
  canManage: boolean
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
}

export function ProjectCard({
  project,
  canManage,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const accentColor = project.colorHex || '#4F46E5'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group relative overflow-hidden">
      {/* Accent Color Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Header info */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {project.name}
              </h3>
              {project.code && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Hash className="w-2.5 h-2.5" />
                  {project.code}
                </span>
              )}
            </div>

            {project.clientName && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.clientName}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                project.isBillable
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {project.isBillable ? 'Billable' : 'Non-billable'}
            </span>
            <ProjectStatusBadge isActive={project.isActive} />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed min-h-[36px]">
          {project.description || (
            <span className="italic text-slate-400 dark:text-slate-500">
              No description provided.
            </span>
          )}
        </p>
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{new Date(project.createdAtUtc).toLocaleDateString()}</span>
        </div>

        {canManage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(project)}
              title="Edit project"
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project)}
              title="Delete project"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
