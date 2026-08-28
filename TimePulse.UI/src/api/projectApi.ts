import { apiClient } from './apiClient'

export interface ProjectTeamDto {
  teamId: string
  name: string
  description?: string | null
  colorHex?: string | null
  memberCount: number
  assignedAtUtc: string
}

export interface ProjectDto {
  id: string
  name: string
  code?: string | null
  description?: string | null
  clientName?: string | null
  colorHex?: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc?: string | null
  teams?: ProjectTeamDto[]
}

export interface CreateProjectPayload {
  name: string
  code?: string
  description?: string
  clientName?: string
  colorHex?: string
  isActive?: boolean
  teamIds?: string[]
}

export interface UpdateProjectPayload {
  name: string
  code?: string
  description?: string
  clientName?: string
  colorHex?: string
  isActive: boolean
}

export const projectApi = {
  async getProjects(): Promise<ProjectDto[]> {
    return apiClient.get<ProjectDto[]>('/api/projects')
  },

  async getProjectById(id: string): Promise<ProjectDto> {
    return apiClient.get<ProjectDto>(`/api/projects/${id}`)
  },

  async createProject(payload: CreateProjectPayload): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>('/api/projects', payload)
  },

  async updateProject(id: string, payload: UpdateProjectPayload): Promise<ProjectDto> {
    return apiClient.put<ProjectDto>(`/api/projects/${id}`, payload)
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/projects/${id}`)
  },

  async setProjectTeams(projectId: string, teamIds: string[]): Promise<ProjectDto> {
    return apiClient.put<ProjectDto>(`/api/projects/${projectId}/teams`, { teamIds })
  },
}
