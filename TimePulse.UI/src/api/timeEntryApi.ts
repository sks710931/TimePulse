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

export interface PagedTimeEntriesResult {
  items: TimeEntryDto[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const timeEntryApi = {
  async getTimeEntries(
    page: number = 1,
    pageSize: number = 50,
    startDate?: string,
    endDate?: string
  ): Promise<PagedTimeEntriesResult> {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('pageSize', String(pageSize))
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return apiClient.get<PagedTimeEntriesResult>(`/api/time-entries?${params.toString()}`)
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
