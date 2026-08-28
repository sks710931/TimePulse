import { useState, useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import { projectApi, type ProjectDto } from '../api/projectApi'
import { teamApi, type TeamDto } from '../api/teamApi'
import { ProjectsTab } from '../components/projects/ProjectsTab'

export function ProjectsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'admin'))
  const isManager = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'manager'))
  const canManage = isAdmin || isManager

  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [allTeams, setAllTeams] = useState<TeamDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await projectApi.getProjects()
      setProjects(data)

      if (canManage) {
        try {
          const teamsData = await teamApi.getTeams()
          setAllTeams(teamsData)
        } catch {
          // Non-blocking fallback
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading projects.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [canManage])

  return (
    <ProjectsTab
      projects={projects}
      allTeams={allTeams}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchData}
      canManage={canManage}
    />
  )
}
