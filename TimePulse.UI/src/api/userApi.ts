import { apiClient } from './apiClient'

export interface UserItemDto {
  id: string
  email: string
  fullName: string
  createdAtUtc: string
  roles: string[]
}

export interface CreateUserPayload {
  fullName: string
  email: string
  password: string
  role: string
}

export const userApi = {
  async getUsers(): Promise<UserItemDto[]> {
    return apiClient.get<UserItemDto[]>('/api/users')
  },

  async createUser(payload: CreateUserPayload): Promise<UserItemDto> {
    return apiClient.post<UserItemDto>('/api/users', payload)
  },
}
