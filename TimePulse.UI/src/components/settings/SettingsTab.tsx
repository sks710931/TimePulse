import { ProfileSettingsCard } from './ProfileSettingsCard'
import { AppearanceSettingsCard } from './AppearanceSettingsCard'
import { NotificationSettingsCard } from './NotificationSettingsCard'
import { SecuritySettingsCard } from './SecuritySettingsCard'
import type { UserProfile } from '../../api/authApi'

interface SettingsTabProps {
  user: UserProfile | null
}

export function SettingsTab({ user }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileSettingsCard user={user} />
        <AppearanceSettingsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationSettingsCard />
        <SecuritySettingsCard />
      </div>
    </div>
  )
}
