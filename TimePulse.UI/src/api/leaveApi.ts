import { apiClient } from './apiClient'

export type LeaveType = 'FullDay' | 'FirstHalf' | 'SecondHalf'

export interface LeaveDto {
  id: string
  userId: string
  userName: string
  userEmail: string
  date: string // YYYY-MM-DD
  leaveType: LeaveType
  leaveTypeDisplayName: string
  reason?: string | null
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface CreateLeaveRequest {
  date: string
  leaveType: LeaveType
  reason?: string
}

export interface UpdateLeaveRequest {
  date: string
  leaveType: LeaveType
  reason?: string
}

export interface LeaveSummaryDto {
  totalLeaves: number
  fullDayCount: number
  firstHalfCount: number
  secondHalfCount: number
  leaves: LeaveDto[]
}

export const leaveApi = {
  async getLeaves(targetUserId?: string, startDate?: string, endDate?: string): Promise<LeaveDto[]> {
    const params = new URLSearchParams()
    if (targetUserId) params.append('targetUserId', targetUserId)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<LeaveDto[]>(`/api/leaves${query}`)
  },

  async getSummary(targetUserId?: string, year?: number): Promise<LeaveSummaryDto> {
    const params = new URLSearchParams()
    if (targetUserId) params.append('targetUserId', targetUserId)
    if (year) params.append('year', year.toString())

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<LeaveSummaryDto>(`/api/leaves/summary${query}`)
  },

  async createLeave(request: CreateLeaveRequest): Promise<LeaveDto> {
    return apiClient.post<LeaveDto>('/api/leaves', request)
  },

  async updateLeave(id: string, request: UpdateLeaveRequest): Promise<LeaveDto> {
    return apiClient.put<LeaveDto>(`/api/leaves/${id}`, request)
  },

  async deleteLeave(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/leaves/${id}`)
  },
}
