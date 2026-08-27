import { useState } from 'react'
import { SettingsNavTabs, type SettingsTabId } from './SettingsNavTabs'
import { ProfileSettingsCard } from './ProfileSettingsCard'
import { AppearanceSettingsCard } from './AppearanceSettingsCard'
import { WhitelabelingSettingsCard } from './WhitelabelingSettingsCard'
import { NotificationSettingsCard } from './NotificationSettingsCard'
import { SecuritySettingsCard } from './SecuritySettingsCard'
import type { UserProfile } from '../../api/authApi'

interface SettingsTabProps {
  user: UserProfile | null
  isAdmin?: boolean
}

export function SettingsTab({ user, isAdmin = false }: SettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTabId>('profile')

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs Navigation */}
      <SettingsNavTabs
        activeTab={activeSubTab}
        onSelectTab={setActiveSubTab}
        isAdmin={isAdmin}
      />

      {/* Focused Active Tab Content */}
      <div className="pt-2">
        {activeSubTab === 'profile' && (
          <ProfileSettingsCard
            user={user}
            onNavigateTab={setActiveSubTab}
          />
        )}
        {activeSubTab === 'appearance' && <AppearanceSettingsCard />}
        {activeSubTab === 'whitelabeling' && isAdmin && <WhitelabelingSettingsCard />}
        {activeSubTab === 'notifications' && <NotificationSettingsCard />}
        {activeSubTab === 'security' && <SecuritySettingsCard />}
      </div>
    </div>
  )
}
