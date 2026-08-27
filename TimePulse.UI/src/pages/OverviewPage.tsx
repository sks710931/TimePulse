import { useAppSelector } from '../store/hooks'
import { useNavigate } from 'react-router-dom'
import { OverviewTab } from '../components/dashboard/OverviewTab'
import type { TabId } from '../components/layout/SidebarNav'

export function OverviewPage() {
  const { user } = useAppSelector((state) => state.auth)
  const branding = useAppSelector((state) => state.branding)
  const navigate = useNavigate()

  const handleNavigateTab = (tabId: TabId) => {
    navigate(`/${tabId}`)
  }

  return (
    <OverviewTab
      user={user}
      branding={branding}
      onNavigateTab={handleNavigateTab}
    />
  )
}
