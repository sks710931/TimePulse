import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { userApi, type UserItemDto } from '../api/userApi'
import { UserManagementTab } from '../components/dashboard/UserManagementTab'

export function UserManagementPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles.some((r) => r.toLowerCase() === 'admin'))
  const isManager = Boolean(user?.roles.some((r) => r.toLowerCase() === 'manager'))
  const canAccess = isAdmin || isManager

  const [users, setUsers] = useState<UserItemDto[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!canAccess) return
    setUsersLoading(true)
    setUsersError(null)
    try {
      const data = await userApi.getUsers()
      setUsers(data)
    } catch (err: unknown) {
      setUsersError(err instanceof Error ? err.message : 'Error loading users')
    } finally {
      setUsersLoading(false)
    }
  }

  useEffect(() => {
    if (canAccess) {
      fetchUsers()
    }
  }, [canAccess])

  if (!canAccess) {
    return <Navigate to="/overview" replace />
  }

  return (
    <UserManagementTab
      users={users}
      isLoading={usersLoading}
      error={usersError}
      onRefresh={fetchUsers}
      isAdmin={isAdmin}
      isManager={isManager}
      currentUserId={user?.id}
    />
  )
}
