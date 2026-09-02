import { apiClient } from './apiClient'

export interface TimeEntryDto {
  id: string
  userId: string
  projectId?: string | null
  projectName?: string | null
  projectColorHex?: string | null
  clientName?: string | null
  description: string
  startTimeUtc: string
  endTimeUtc: string
  durationMinutes: number
  isBillable: boolean
  tag?: string | null
  createdAtUtc: string
}

export interface CreateTimeEntryPayload {
  startTimeUtc: string
  endTimeUtc: string
  description?: string
  projectId?: string | null
  isBillable?: boolean
  tag?: string | null
}

export interface UpdateTimeEntryPayload {
  startTimeUtc: string
  endTimeUtc: string
  description?: string
  projectId?: string | null
  isBillable?: boolean
  tag?: string | null
}

export const timeEntryApi = {
  async getTimeEntries(startDate?: string, endDate?: string): Promise<TimeEntryDto[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<TimeEntryDto[]>(`/api/time-entries${query}`)
  },

  async createTimeEntry(payload: CreateTimeEntryPayload): Promise<TimeEntryDto> {
    return apiClient.post<TimeEntryDto>('/api/time-entries', payload)
  },

  async updateTimeEntry(id: string, payload: UpdateTimeEntryPayload): Promise<TimeEntryDto> {
    return apiClient.put<TimeEntryDto>(`/api/time-entries/${id}`, payload)
  },

  async deleteTimeEntry(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/time-entries/${id}`)
  },
}
