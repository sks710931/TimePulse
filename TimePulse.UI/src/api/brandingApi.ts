import { apiClient } from './apiClient'

export interface BrandSettings {
  appName: string | null
  logoData: string | null
  logoType: string
  isCustom: boolean
  updatedAtUtc?: string
}

export interface UpdateBrandPayload {
  appName: string | null
  logoData: string | null
  logoType: string
}

export const brandingApi = {
  async getBranding(): Promise<BrandSettings> {
    return apiClient.get<BrandSettings>('/api/branding')
  },

  async updateBranding(payload: UpdateBrandPayload): Promise<BrandSettings> {
    return apiClient.put<BrandSettings>('/api/branding', payload)
  },

  async resetBranding(): Promise<BrandSettings> {
    return apiClient.post<BrandSettings>('/api/branding/reset')
  },
}
