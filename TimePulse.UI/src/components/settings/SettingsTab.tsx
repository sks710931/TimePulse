import { useState } from 'react'
import { SettingsNavTabs, type SettingsTabId } from './SettingsNavTabs'
import { ProfileSettingsCard } from './ProfileSettingsCard'
import { AppearanceSettingsCard } from './AppearanceSettingsCard'
import { NotificationSettingsCard } from './NotificationSettingsCard'
import { SecuritySettingsCard } from './SecuritySettingsCard'
import type { UserProfile } from '../../api/authApi'

interface SettingsTabProps {
  user: UserProfile | null
}

export function SettingsTab({ user }: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTabId>('profile')

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs Navigation */}
      <SettingsNavTabs
        activeTab={activeSubTab}
        onSelectTab={setActiveSubTab}
      />

      {/* Focused Active Tab Content */}
      <div className="pt-2">
        {activeSubTab === 'profile' && <ProfileSettingsCard user={user} />}
        {activeSubTab === 'appearance' && <AppearanceSettingsCard />}
        {activeSubTab === 'notifications' && <NotificationSettingsCard />}
        {activeSubTab === 'security' && <SecuritySettingsCard />}
      </div>
    </div>
  )
}
