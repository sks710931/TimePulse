import { Clock } from 'lucide-react'

interface BrandingPreviewCardProps {
  themeType: 'light' | 'dark'
  title: string
  logoData: string | null
  logoType: string
  fallbackLogoData?: string | null
  fallbackLogoType?: string
  appName: string
}

export function BrandingPreviewCard({
  themeType,
  title,
  logoData,
  logoType,
  fallbackLogoData,
  fallbackLogoType,
  appName,
}: BrandingPreviewCardProps) {
  const isLight = themeType === 'light'
  const activeData = logoData || fallbackLogoData
  const activeType = logoData ? logoType : fallbackLogoType || 'Default'

  return (
    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-2 block">
        {title}
      </span>
      <div
        className={`p-3 border rounded-xl w-full min-h-[64px] flex items-center justify-center gap-2 shadow-sm ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        {activeType === 'Svg' && activeData ? (
          <div
            className="h-7 max-w-[140px] flex items-center justify-center [&>svg]:h-full [&>svg]:max-h-7 [&>svg]:w-auto [&>svg]:max-w-[140px] [&>svg]:object-contain overflow-hidden"
            dangerouslySetInnerHTML={{ __html: activeData }}
          />
        ) : activeData ? (
          <img
            src={activeData}
            alt="Logo preview"
            className="h-7 max-w-[140px] object-contain"
          />
        ) : (
          <Clock className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
        )}
        {appName && (
          <span
            className={`font-bold text-sm truncate max-w-[140px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {appName}
          </span>
        )}
      </div>
    </div>
  )
}
