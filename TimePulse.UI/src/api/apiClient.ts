let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function requestTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      return res.ok
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit = {
    ...init,
    credentials: 'include',
  }

  const response = await fetch(input, options)

  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : (input as Request).url

  // If 401 Unauthorized and not already calling auth endpoints like login/refresh
  if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh') && !url.includes('/api/auth/register')) {
    const refreshed = await requestTokenRefresh()
    if (refreshed) {
      // Retry original request once with fresh cookie
      return fetch(input, options)
    }
  }

  return response
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const res = await apiFetch(url, { method: 'GET' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Request failed with status ${res.status}`)
    }
    return res.json()
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiFetch(url, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Request failed with status ${res.status}`)
    }
    return res.json()
  },

  async put<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiFetch(url, {
      method: 'PUT',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Request failed with status ${res.status}`)
    }
    return res.json()
  },

  async delete<T>(url: string): Promise<T> {
    const res = await apiFetch(url, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Request failed with status ${res.status}`)
    }
    return res.json()
  },
}
