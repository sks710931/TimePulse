import { useState, useEffect } from 'react'
import { ProfileHeaderBanner } from './ProfileHeaderBanner'
import { UserProfileCard } from './UserProfileCard'
import { PersonalDetailsCard } from './PersonalDetailsCard'
import { AccountPreferencesCard } from './AccountPreferencesCard'
import { SecurityOverviewCard } from './SecurityOverviewCard'
import { ProfileQuickActionsCard } from './ProfileQuickActionsCard'
import type { UserProfile } from '../../api/authApi'
import type { SettingsTabId } from './SettingsNavTabs'

interface ProfileSettingsCardProps {
  user: UserProfile | null
  onNavigateTab?: (tab: SettingsTabId) => void
}

export function ProfileSettingsCard({ user, onNavigateTab }: ProfileSettingsCardProps) {
  const [currentDisplayName, setCurrentDisplayName] = useState(user?.fullName || user?.name || '')

  useEffect(() => {
    if (user) {
      setCurrentDisplayName(user.fullName || user.name || '')
    }
  }, [user])

  const handleNameUpdate = (_fullName: string, displayName: string) => {
    setCurrentDisplayName(displayName)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <ProfileHeaderBanner />

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (~60% width) */}
        <div className="lg:col-span-7 space-y-6">
          <UserProfileCard
            user={user}
            displayName={currentDisplayName}
          />

          <PersonalDetailsCard
            user={user}
            onNameChange={handleNameUpdate}
          />
        </div>

        {/* Right Column (~40% width) */}
        <div className="lg:col-span-5 space-y-6">
          <AccountPreferencesCard />

          <SecurityOverviewCard
            onNavigateTab={onNavigateTab}
          />

          <ProfileQuickActionsCard
            onNavigateTab={onNavigateTab}
          />
        </div>
      </div>
    </div>
  )
}
