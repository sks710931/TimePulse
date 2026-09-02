import { apiClient } from './apiClient'

export interface UserItemDto {
  id: string
  email: string
  fullName: string
  name?: string
  createdAtUtc: string
  roles: string[]
}

export interface InviteUserPayload {
  email: string
  roles: string[]
  teamIds?: string[]
}

export interface InvitationResultDto {
  id: string
  email: string
  roles: string[]
  teamIds: string[]
  createdAtUtc: string
  expiresAtUtc: string
  isConsumed: boolean
  invitedByUserId: string
}

export interface UpdateUserPayload {
  fullName: string
  roles: string[]
}

export const userApi = {
  async getUsers(): Promise<UserItemDto[]> {
    return apiClient.get<UserItemDto[]>('/api/users')
  },

  async inviteUser(payload: InviteUserPayload): Promise<InvitationResultDto> {
    return apiClient.post<InvitationResultDto>('/api/users/invite', payload)
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserItemDto> {
    return apiClient.put<UserItemDto>(`/api/users/${userId}`, payload)
  },
}
