import { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import type { ProjectDto } from '../../api/projectApi'
import { ProjectsHeader, type StatusFilter } from './ProjectsHeader'
import { ProjectTable } from './ProjectTable'
import { CreateProjectModal } from './CreateProjectModal'
import { EditProjectModal } from './EditProjectModal'
import { DeleteProjectModal } from './DeleteProjectModal'
import { Alert } from '../common/Alert'

interface ProjectsTabProps {
  projects: ProjectDto[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  canManage: boolean
}

export function ProjectsTab({
  projects,
  isLoading,
  error,
  onRefresh,
  canManage,
}: ProjectsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectDto | null>(null)
  const [deletingProject, setDeletingProject] = useState<ProjectDto | null>(null)

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search matching
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.isActive) ||
        (statusFilter === 'archived' && !p.isActive)

      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  return (
    <>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200 space-y-6">
        {/* Header and Toolbar */}
        <ProjectsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onRefresh={onRefresh}
          isLoading={isLoading}
          canManage={canManage}
          onAddNew={() => setIsCreateModalOpen(true)}
          totalCount={projects.length}
        />

        {error && <Alert type="error" message={error} />}

        {/* Main Table / States */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs">Loading projects...</span>
          </div>
        ) : (
          <ProjectTable
            projects={filteredProjects}
            canManage={canManage}
            onEdit={(p) => setEditingProject(p)}
            onDelete={(p) => setDeletingProject(p)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={onRefresh}
      />

      <EditProjectModal
        isOpen={Boolean(editingProject)}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onProjectUpdated={onRefresh}
      />

      <DeleteProjectModal
        isOpen={Boolean(deletingProject)}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onProjectDeleted={onRefresh}
      />
    </>
  )
}
