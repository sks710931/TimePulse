import { useState } from 'react'
import { X, AlertTriangle, Loader2, Trash2 } from 'lucide-react'
import type { UserItemDto } from '../../api/userApi'

interface DeleteUserModalProps {
  isOpen: boolean
  user: UserItemDto | null
  onClose: () => void
  onConfirm: (user: UserItemDto) => Promise<void>
  isSelfDelete?: boolean
}

export function DeleteUserModal({
  isOpen,
  user,
  onClose,
  onConfirm,
  isSelfDelete = false,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm(user)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayName = user.fullName || user.name || user.email

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/40">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1 pr-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isSelfDelete ? 'Delete Your Account' : 'Delete User'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isSelfDelete ? (
                <>
                  Are you sure you want to permanently delete your account? You will be signed out immediately and will lose all access.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">{displayName}</strong>?
                </>
              )}
            </p>
          </div>
        </div>

        {/* Warning / Details Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>This action cannot be undone:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700/90 dark:text-rose-400/90 pl-1">
            <li>Team memberships will be completely removed</li>
            <li>Assigned roles and permissions will be deleted</li>
            <li>Active session tokens will be immediately revoked</li>
          </ul>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSelfDelete ? 'Delete My Account' : 'Delete User'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
