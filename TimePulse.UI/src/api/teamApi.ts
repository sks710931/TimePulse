import { apiClient } from './apiClient'

export interface TeamMemberDto {
  userId: string
  email: string
  fullName: string
  roles: string[]
  joinedAtUtc: string
}

export interface TeamProjectDto {
  projectId: string
  name: string
  code?: string | null
  clientName?: string | null
  colorHex?: string | null
  isActive: boolean
  assignedAtUtc: string
}

export interface TeamDto {
  id: string
  name: string
  description?: string | null
  colorHex?: string | null
  createdAtUtc: string
  updatedAtUtc?: string | null
  members: TeamMemberDto[]
  projects: TeamProjectDto[]
}

export interface CreateTeamPayload {
  name: string
  description?: string
  colorHex?: string
  memberUserIds?: string[]
  projectIds?: string[]
}

export interface UpdateTeamPayload {
  name: string
  description?: string
  colorHex?: string
}

export const teamApi = {
  async getTeams(): Promise<TeamDto[]> {
    return apiClient.get<TeamDto[]>('/api/teams')
  },

  async getTeamById(id: string): Promise<TeamDto> {
    return apiClient.get<TeamDto>(`/api/teams/${id}`)
  },

  async createTeam(payload: CreateTeamPayload): Promise<TeamDto> {
    return apiClient.post<TeamDto>('/api/teams', payload)
  },

  async updateTeam(id: string, payload: UpdateTeamPayload): Promise<TeamDto> {
    return apiClient.put<TeamDto>(`/api/teams/${id}`, payload)
  },

  async deleteTeam(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/teams/${id}`)
  },

  async setTeamMembers(teamId: string, userIds: string[]): Promise<TeamDto> {
    return apiClient.put<TeamDto>(`/api/teams/${teamId}/members`, { userIds })
  },

  async setTeamProjects(teamId: string, projectIds: string[]): Promise<TeamDto> {
    return apiClient.put<TeamDto>(`/api/teams/${teamId}/projects`, { projectIds })
  },
}
