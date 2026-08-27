import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { apiClient } from '../api/apiClient'
import { UserManagementTab } from '../components/dashboard/UserManagementTab'
import type { UserItem } from '../components/dashboard/UserTable'

export function UserManagementPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles.includes('Admin'))

  const [users, setUsers] = useState<UserItem[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!isAdmin) return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await apiClient.get<UserItem[]>('/api/users')
      setUsers(data)
    } catch (err: unknown) {
      setUsersError(err instanceof Error ? err.message : 'Error loading users')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return <Navigate to="/overview" replace />
  }

  return (
    <UserManagementTab
      users={users}
      isLoading={usersLoading}
      error={usersError}
      onRefresh={fetchUsers}
    />
  )
}
