import { useState, useEffect } from 'react'
import { useAppSelector } from '../store/hooks'
import { projectApi, type ProjectDto } from '../api/projectApi'
import { ProjectsTab } from '../components/projects/ProjectsTab'

export function ProjectsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'admin'))
  const isManager = Boolean(user?.roles?.some((r) => r.toLowerCase() === 'manager'))
  const canManage = isAdmin || isManager

  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await projectApi.getProjects()
      setProjects(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading projects.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <ProjectsTab
      projects={projects}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchProjects}
      canManage={canManage}
    />
  )
}
