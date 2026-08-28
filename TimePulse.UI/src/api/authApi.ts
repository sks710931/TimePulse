import { apiFetch } from './apiClient'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  name: string
  roles: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  async getMe(): Promise<UserProfile> {
    const res = await apiFetch('/api/auth/me')
    if (!res.ok) {
      throw new Error(`Failed to fetch profile (${res.status})`)
    }
    const data = await res.json()
    // Map both fullName and name for safety
    return {
      ...data,
      name: data.name || data.fullName,
    }
  },

  async login(payload: LoginPayload): Promise<{ message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Invalid email or password')
    }
    return res.json()
  },

  async refresh(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors on logout
    }
  },
}
