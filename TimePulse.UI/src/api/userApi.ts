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
  consumedAtUtc?: string | null
  invitedByUserId: string
}

export interface InvitationItemDto {
  id: string
  email: string
  roles: string[]
  teamIds: string[]
  createdAtUtc: string
  expiresAtUtc: string
  isConsumed: boolean
  consumedAtUtc?: string | null
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

  async getInvitations(status?: 'pending' | 'accepted'): Promise<InvitationItemDto[]> {
    const query = status ? `?status=${status}` : ''
    return apiClient.get<InvitationItemDto[]>(`/api/users/invitations${query}`)
  },

  async inviteUser(payload: InviteUserPayload): Promise<InvitationResultDto> {
    return apiClient.post<InvitationResultDto>('/api/users/invite', payload)
  },

  async resendInvitation(invitationId: string): Promise<InvitationItemDto> {
    return apiClient.post<InvitationItemDto>(`/api/users/invitations/${invitationId}/resend`, {})
  },

  async revokeInvitation(invitationId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/users/invitations/${invitationId}`)
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserItemDto> {
    return apiClient.put<UserItemDto>(`/api/users/${userId}`, payload)
  },

  async deleteUser(userId: string): Promise<{ success: boolean; isSelfDelete?: boolean }> {
    return apiClient.delete<{ success: boolean; isSelfDelete?: boolean }>(`/api/users/${userId}`)
  },
}
