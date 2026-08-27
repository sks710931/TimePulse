import { useAppSelector } from '../store/hooks'
import { SettingsTab } from '../components/settings/SettingsTab'

export function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const isAdmin = Boolean(user?.roles.includes('Admin'))

  return <SettingsTab user={user} isAdmin={isAdmin} />
}
