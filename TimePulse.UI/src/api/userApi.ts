import { apiClient } from './apiClient'

export interface UserItemDto {
  id: string
  email: string
  fullName: string
  name?: string
  createdAtUtc: string
  roles: string[]
}

export interface CreateUserPayload {
  fullName: string
  email: string
  password: string
  role: string
}

export interface UpdateUserPayload {
  fullName: string
  roles: string[]
}

export const userApi = {
  async getUsers(): Promise<UserItemDto[]> {
    return apiClient.get<UserItemDto[]>('/api/users')
  },

  async createUser(payload: CreateUserPayload): Promise<UserItemDto> {
    return apiClient.post<UserItemDto>('/api/users', payload)
  },

  async updateUser(userId: string, payload: UpdateUserPayload): Promise<UserItemDto> {
    return apiClient.put<UserItemDto>(`/api/users/${userId}`, payload)
  },
}
