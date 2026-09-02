import { useState, useEffect, useCallback } from 'react'
import { UserTable } from './UserTable'
import { PendingInvitationsTable } from './PendingInvitationsTable'
import { AcceptedInvitationsTable } from './AcceptedInvitationsTable'
import { UserNavTabs, type UserTabId } from './UserNavTabs'
import { CreateUserModal } from './CreateUserModal'
import { EditUserModal } from './EditUserModal'
import { Alert } from '../common/Alert'
import { Users, UserPlus, RefreshCw, Loader2 } from 'lucide-react'
import { userApi, type UserItemDto, type InvitationItemDto } from '../../api/userApi'

interface UserManagementTabProps {
  users: UserItemDto[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
  isAdmin: boolean
  isManager: boolean
  currentUserId?: string
}

export function UserManagementTab({
  users,
  isLoading,
  error,
  onRefresh,
  isAdmin,
  isManager,
  currentUserId,
}: UserManagementTabProps) {
  const [activeTab, setActiveTab] = useState<UserTabId>('users')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItemDto | null>(null)

  // Invitations state
  const [pendingInvitations, setPendingInvitations] = useState<InvitationItemDto[]>([])
  const [acceptedInvitations, setAcceptedInvitations] = useState<InvitationItemDto[]>([])
  const [invitationsLoading, setInvitationsLoading] = useState(false)
  const [invitationsError, setInvitationsError] = useState<string | null>(null)
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null)

  const fetchInvitations = useCallback(async () => {
    setInvitationsLoading(true)
    setInvitationsError(null)
    try {
      const [pending, accepted] = await Promise.all([
        userApi.getInvitations('pending'),
        userApi.getInvitations('accepted'),
      ])
      setPendingInvitations(pending)
      setAcceptedInvitations(accepted)
    } catch (err: unknown) {
      setInvitationsError(err instanceof Error ? err.message : 'Failed to load invitations.')
    } finally {
      setInvitationsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  const handleRefreshAll = () => {
    setActionSuccessMessage(null)
    onRefresh()
    fetchInvitations()
  }

  const handleResendInvitation = async (id: string) => {
    setActionSuccessMessage(null)
    setInvitationsError(null)
    try {
      await userApi.resendInvitation(id)
      setActionSuccessMessage('Invitation email resent successfully.')
      await fetchInvitations()
    } catch (err: unknown) {
      setInvitationsError(err instanceof Error ? err.message : 'Failed to resend invitation.')
    }
  }

  const handleRevokeInvitation = async (id: string) => {
    setActionSuccessMessage(null)
    setInvitationsError(null)
    try {
      await userApi.revokeInvitation(id)
      setActionSuccessMessage('Invitation revoked.')
      await fetchInvitations()
    } catch (err: unknown) {
      setInvitationsError(err instanceof Error ? err.message : 'Failed to revoke invitation.')
    }
  }

  const handleEditUser = (user: UserItemDto) => {
    setEditingUser(user)
  }

  const isCurrentLoading = activeTab === 'users' ? isLoading : invitationsLoading
  const currentError = error || invitationsError

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
                  ? 'Manage user accounts, send invitations, and view pending or accepted invites.'
                  : 'Manage team employee accounts, track invitations, and view team members.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleRefreshAll}
              disabled={isCurrentLoading}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCurrentLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <UserNavTabs
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActionSuccessMessage(null)
            setActiveTab(tab)
          }}
          usersCount={users.length}
          pendingCount={pendingInvitations.length}
          acceptedCount={acceptedInvitations.length}
        />

        {actionSuccessMessage && (
          <Alert type="success" message={actionSuccessMessage} />
        )}

        {currentError && <Alert type="error" message={currentError} />}

        {/* Tab 1: Users Directory */}
        {activeTab === 'users' && (
          <>
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs">Loading user directory...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                No active users found. Click &quot;Invite User&quot; to invite the first account.
              </div>
            ) : (
              <UserTable
                users={users}
                onEditUser={handleEditUser}
                isCallerAdmin={isAdmin}
                isCallerManager={isManager}
                currentUserId={currentUserId}
              />
            )}
          </>
        )}

        {/* Tab 2: Invitations Pending */}
        {activeTab === 'pending' && (
          <>
            {invitationsLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                <span className="text-xs">Loading pending invitations...</span>
              </div>
            ) : (
              <PendingInvitationsTable
                invitations={pendingInvitations}
                onResend={handleResendInvitation}
                onRevoke={handleRevokeInvitation}
              />
            )}
          </>
        )}

        {/* Tab 3: Invitations Accepted */}
        {activeTab === 'accepted' && (
          <>
            {invitationsLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs">Loading accepted invitations...</span>
              </div>
            ) : (
              <AcceptedInvitationsTable invitations={acceptedInvitations} />
            )}
          </>
        )}
      </div>

      {/* Invite User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => {
          handleRefreshAll()
          setActiveTab('pending') // Switch to pending tab so user sees the new invitation
        }}
        isAdmin={isAdmin}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleRefreshAll}
        isCallerAdmin={isAdmin}
        isCallerManager={isManager}
        currentUserId={currentUserId}
      />
    </>
  )
}
