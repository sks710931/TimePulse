import { FolderKanban, Plus } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'
import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  projects: ProjectDto[]
  canManage: boolean
  onEdit: (project: ProjectDto) => void
  onDelete: (project: ProjectDto) => void
  onAddNew: () => void
}

export function ProjectList({
  projects,
  canManage,
  onEdit,
  onDelete,
  onAddNew,
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <FolderKanban className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No projects found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            {canManage
              ? 'Get started by creating your first organizational project or adjusting your search filters.'
              : 'There are currently no projects matching your query.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={onAddNew}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          project={p}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
