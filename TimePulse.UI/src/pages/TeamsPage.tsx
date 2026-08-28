import { useState, useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import { teamApi, type TeamDto } from '../api/teamApi'
import { userApi, type UserItemDto } from '../api/userApi'
import { projectApi, type ProjectDto } from '../api/projectApi'
import { TeamsTab } from '../components/teams/TeamsTab'

export function TeamsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'admin'))
  const isManager = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'manager'))
  const canManage = isAdmin || isManager

  const [teams, setTeams] = useState<TeamDto[]>([])
  const [allUsers, setAllUsers] = useState<UserItemDto[]>([])
  const [allProjects, setAllProjects] = useState<ProjectDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const teamsData = await teamApi.getTeams()
      setTeams(teamsData)

      // Only fetch users and projects if user has management permissions
      if (canManage) {
        try {
          const [usersData, projectsData] = await Promise.all([
            userApi.getUsers(),
            projectApi.getProjects(),
          ])
          setAllUsers(usersData)
          setAllProjects(projectsData)
        } catch {
          // Non-blocking fallback
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading teams.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [canManage])

  return (
    <TeamsTab
      teams={teams}
      allUsers={allUsers}
      allProjects={allProjects}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchData}
      canManage={canManage}
    />
  )
}
