import { useState } from 'react'
import { UserTable, type UserItem } from './UserTable'
import { CreateUserModal } from './CreateUserModal'
import { Alert } from '../common/Alert'
import { Users, UserPlus, RefreshCw, Loader2 } from 'lucide-react'

interface UserManagementTabProps {
  users: UserItem[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  isAdmin: boolean
}

export function UserManagementTab({
  users,
  isLoading,
  error,
  onRefresh,
  isAdmin,
}: UserManagementTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-200 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-blue-100/80 dark:border-blue-900/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                User Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdmin
                  ? 'Manage organizational accounts, assign roles, and add new team members.'
                  : 'Manage team employee accounts and add new employees.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        {/* User Table / States */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-xs">Loading user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No users found. Click &quot;Add User&quot; to create the first account.
          </div>
        ) : (
          <UserTable users={users} />
        )}
      </div>

      {/* Add User Modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={onRefresh}
        isAdmin={isAdmin}
      />
    </>
  )
}
