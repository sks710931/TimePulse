import { Logo } from '../common/Logo'
import { X } from 'lucide-react'

interface SidebarBrandProps {
  appName: string | null
  isCollapsed: boolean
  onCloseMobile: () => void
}

export function SidebarBrand({ appName, isCollapsed, onCloseMobile }: SidebarBrandProps) {
  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      {isCollapsed ? (
        <div className="w-full flex items-center justify-center" title={appName || 'Brand Logo'}>
          <Logo size="sm" isSquare={true} showText={false} />
        </div>
      ) : (
        <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
          <Logo size="md" showText={false} />
          {appName && (
            <span className="font-bold text-base text-slate-900 dark:text-white truncate">
              {appName}
            </span>
          )}
        </div>
      )}

      {/* Mobile Close Button */}
      <button
        onClick={onCloseMobile}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ml-2 cursor-pointer"
        title="Close sidebar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
