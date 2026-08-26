import { TimerWidget } from './TimerWidget'
import { TimeLogTable } from './TimeLogTable'

export function TimeTrackerTab() {
  return (
    <div className="space-y-6">
      <TimerWidget />
      <TimeLogTable />
    </div>
  )
}
