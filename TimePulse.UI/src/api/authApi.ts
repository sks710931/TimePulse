export interface UserProfile {
  id: string
  email: string
  name: string
  roles: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
}

export const authApi = {
  async getMe(): Promise<UserProfile> {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (!res.ok) {
      throw new Error(`Failed to fetch profile (${res.status})`)
    }
    return res.json()
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

  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Registration failed')
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
