export interface BrandSettings {
  appName: string
  logoData: string | null
  logoType: string
  isCustom: boolean
  updatedAtUtc?: string
}

export interface UpdateBrandPayload {
  appName: string
  logoData: string | null
  logoType: string
}

export const brandingApi = {
  async getBranding(): Promise<BrandSettings> {
    const res = await fetch('/api/branding')
    if (!res.ok) {
      throw new Error(`Failed to fetch branding settings (${res.status})`)
    }
    return res.json()
  },

  async updateBranding(payload: UpdateBrandPayload): Promise<BrandSettings> {
    const res = await fetch('/api/branding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to update branding settings')
    }
    return res.json()
  },

  async resetBranding(): Promise<BrandSettings> {
    const res = await fetch('/api/branding/reset', {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to reset branding settings')
    }
    return res.json()
  },
}
