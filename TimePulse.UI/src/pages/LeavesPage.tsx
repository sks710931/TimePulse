import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, Sun, Clock, Users, Loader2 } from 'lucide-react'
import { leaveApi } from '../api/leaveApi'
import type { LeaveDto, CreateLeaveRequest } from '../api/leaveApi'
import { userApi } from '../api/userApi'
import type { UserItemDto } from '../api/userApi'
import { useAppSelector } from '../store/hooks'
import { ApplyLeaveModal } from '../components/leaves/ApplyLeaveModal'
import { LeaveListTable } from '../components/leaves/LeaveListTable'

export function LeavesPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isManagerOrAdmin = Boolean(
    user?.roles?.some((r: string) => r.toLowerCase() === 'admin' || r.toLowerCase() === 'manager')
  )

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [users, setUsers] = useState<UserItemDto[]>([])

  const [leaves, setLeaves] = useState<LeaveDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  // Fetch users if Manager or Admin
  useEffect(() => {
    if (isManagerOrAdmin) {
      userApi.getUsers().then(setUsers).catch(() => {})
    }
  }, [isManagerOrAdmin])

  const loadLeaves = useCallback(async () => {
    setIsLoading(true)
    try {
      const startDate = `${selectedYear}-01-01`
      const endDate = `${selectedYear}-12-31`
      const data = await leaveApi.getLeaves(
        selectedUserId || undefined,
        startDate,
        endDate
      )
      setLeaves(data)
    } catch {
      setLeaves([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedUserId, selectedYear])

  useEffect(() => {
    loadLeaves()
  }, [loadLeaves])

  const handleApplyLeave = async (data: CreateLeaveRequest) => {
    await leaveApi.createLeave(data)
    await loadLeaves()
  }

  const handleDeleteLeave = async (id: string) => {
    await leaveApi.deleteLeave(id)
    await loadLeaves()
  }

  // Summary Metrics
  const totalLeaves = leaves.length
  const fullDayLeaves = leaves.filter((l) => l.leaveType === 'FullDay').length
  const halfDayLeaves = leaves.filter((l) => l.leaveType === 'FirstHalf' || l.leaveType === 'SecondHalf').length

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Leave Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your full-day and half-day leaves with automatic timesheet conflict validation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Leaves */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Leaves ({selectedYear})</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalLeaves}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Recorded days off</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Full Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Full Days</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{fullDayLeaves}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Complete days off</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sun className="w-6 h-6" />
          </div>
        </div>

        {/* Half Days */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Half Days</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{halfDayLeaves}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">First / Second Halves</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Filter (Managers & Admins only) */}
          {isManagerOrAdmin && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="">All Employees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Full Day
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            First Half (&le; 1 PM)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Second Half (&ge; 1 PM)
          </span>
        </div>
      </div>

      {/* Leaves List Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading leave entries...</p>
        </div>
      ) : (
        <LeaveListTable
          leaves={leaves}
          showEmployee={isManagerOrAdmin && !selectedUserId}
          onDelete={handleDeleteLeave}
        />
      )}

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSubmit={handleApplyLeave}
      />
    </div>
  )
}
