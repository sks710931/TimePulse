import { useState, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import type { TeamDto } from '../../api/teamApi'
import type { UserItemDto } from '../../api/userApi'
import type { ProjectDto } from '../../api/projectApi'
import { TeamsHeader } from './TeamsHeader'
import { TeamTable } from './TeamTable'
import { CreateTeamModal } from './CreateTeamModal'
import { EditTeamModal } from './EditTeamModal'
import { ManageTeamMembersModal } from './ManageTeamMembersModal'
import { ManageTeamProjectsModal } from './ManageTeamProjectsModal'
import { DeleteTeamModal } from './DeleteTeamModal'
import { Alert } from '../common/Alert'

interface TeamsTabProps {
  teams: TeamDto[]
  allUsers: UserItemDto[]
  allProjects: ProjectDto[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  canManage: boolean
}

export function TeamsTab({
  teams,
  allUsers,
  allProjects,
  isLoading,
  error,
  onRefresh,
  canManage,
}: TeamsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamDto | null>(null)
  const [managingMembersTeam, setManagingMembersTeam] = useState<TeamDto | null>(null)
  const [managingProjectsTeam, setManagingProjectsTeam] = useState<TeamDto | null>(null)
  const [deletingTeam, setDeletingTeam] = useState<TeamDto | null>(null)

  // Filtered teams
  const filteredTeams = useMemo(() => {
    return teams.filter((t) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true

      const matchesName = t.name.toLowerCase().includes(q)
      const matchesDesc = (t.description || '').toLowerCase().includes(q)
      const matchesMember = t.members.some(
        (m) =>
          m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      )
      const matchesProject = t.projects.some((p) => p.name.toLowerCase().includes(q))

      return matchesName || matchesDesc || matchesMember || matchesProject
    })
  }, [teams, searchQuery])

  return (
    <>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200 space-y-6">
        {/* Header and Toolbar */}
        <TeamsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={onRefresh}
          isLoading={isLoading}
          canManage={canManage}
          onAddNew={() => setIsCreateModalOpen(true)}
          totalCount={teams.length}
        />

        {error && <Alert type="error" message={error} />}

        {/* Main Table / States */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs">Loading teams...</span>
          </div>
        ) : (
          <TeamTable
            teams={filteredTeams}
            canManage={canManage}
            onEdit={(t) => setEditingTeam(t)}
            onDelete={(t) => setDeletingTeam(t)}
            onManageMembers={(t) => setManagingMembersTeam(t)}
            onManageProjects={(t) => setManagingProjectsTeam(t)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={onRefresh}
      />

      <EditTeamModal
        isOpen={Boolean(editingTeam)}
        team={editingTeam}
        onClose={() => setEditingTeam(null)}
        onTeamUpdated={onRefresh}
      />

      <ManageTeamMembersModal
        isOpen={Boolean(managingMembersTeam)}
        team={managingMembersTeam}
        allUsers={allUsers}
        onClose={() => setManagingMembersTeam(null)}
        onMembersUpdated={onRefresh}
      />

      <ManageTeamProjectsModal
        isOpen={Boolean(managingProjectsTeam)}
        team={managingProjectsTeam}
        allProjects={allProjects}
        onClose={() => setManagingProjectsTeam(null)}
        onProjectsUpdated={onRefresh}
      />

      <DeleteTeamModal
        isOpen={Boolean(deletingTeam)}
        team={deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onTeamDeleted={onRefresh}
      />
    </>
  )
}
