import { useParams, useNavigate } from 'react-router-dom'
import { SettingsNavTabs, type SettingsTabId } from './SettingsNavTabs'
import { ProfileSettingsCard } from './ProfileSettingsCard'
import { AppearanceSettingsCard } from './AppearanceSettingsCard'
import { WhitelabelingSettingsCard } from './WhitelabelingSettingsCard'
import { SecuritySettingsCard } from './SecuritySettingsCard'
import type { UserProfile } from '../../api/authApi'

interface SettingsTabProps {
  user: UserProfile | null
  isAdmin?: boolean
}

export function SettingsTab({ user, isAdmin = false }: SettingsTabProps) {
  const { subTab } = useParams<{ subTab?: string }>()
  const navigate = useNavigate()

  // Normalize subTab (support whitelabelling / whitelabeling)
  const normalizedSubTab: SettingsTabId =
    subTab === 'appearance' || subTab === 'security'
      ? subTab
      : subTab === 'whitelabelling' || subTab === 'whitelabeling'
      ? 'whitelabeling'
      : 'profile'

  const handleSelectTab = (tabId: SettingsTabId) => {
    navigate(`/settings/${tabId}`)
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Tabs Navigation */}
      <SettingsNavTabs
        activeTab={normalizedSubTab}
        onSelectTab={handleSelectTab}
        isAdmin={isAdmin}
      />

      {/* Focused Active Tab Content */}
      <div className="pt-2">
        {normalizedSubTab === 'profile' && (
          <ProfileSettingsCard
            user={user}
            onNavigateTab={handleSelectTab}
          />
        )}
        {normalizedSubTab === 'appearance' && <AppearanceSettingsCard />}
        {normalizedSubTab === 'whitelabeling' && isAdmin && <WhitelabelingSettingsCard />}
        {normalizedSubTab === 'security' && <SecuritySettingsCard />}
      </div>
    </div>
  )
}
