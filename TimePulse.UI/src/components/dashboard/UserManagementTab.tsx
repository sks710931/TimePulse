import { UserTable, type UserItem } from './UserTable'
import { Alert } from '../common/Alert'
import { Users, RefreshCw, Loader2 } from 'lucide-react'

interface UserManagementTabProps {
  users: UserItem[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export function UserManagementTab({
  users,
  isLoading,
  error,
  onRefresh,
}: UserManagementTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/40 dark:shadow-none transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Registered Users</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Admin-restricted view of all system accounts and their assigned roles.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-xs">Loading users...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No users found.
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  )
}
