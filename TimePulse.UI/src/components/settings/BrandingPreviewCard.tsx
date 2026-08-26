import { Clock, Check } from 'lucide-react'

interface BrandingPreviewCardProps {
  themeType: 'light' | 'dark'
  title: string
  logoData: string | null
  logoType: string
  fallbackLogoData?: string | null
  fallbackLogoType?: string
  appName: string
  primaryColor?: string | null
}

export function BrandingPreviewCard({
  themeType,
  title,
  logoData,
  logoType,
  fallbackLogoData,
  fallbackLogoType,
  appName,
  primaryColor,
}: BrandingPreviewCardProps) {
  const isLight = themeType === 'light'
  const activeData = logoData || fallbackLogoData
  const activeType = logoData ? logoType : fallbackLogoType || 'Default'
  const effectivePrimary = primaryColor || (isLight ? '#4f46e5' : '#6366f1')

  return (
    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block text-center">
        {title}
      </span>

      {/* Brand Header Preview */}
      <div
        className={`p-3 border rounded-xl w-full min-h-[60px] flex items-center justify-center gap-2 shadow-sm ${
          isLight
            ? 'bg-white border-slate-200'
            : 'bg-slate-950 border-slate-800'
        }`}
      >
        {activeType === 'Svg' && activeData ? (
          <div
            className="h-7 max-w-[140px] flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-h-7 [&>svg]:max-w-[140px] [&>svg]:object-contain overflow-hidden"
            dangerouslySetInnerHTML={{ __html: activeData }}
          />
        ) : activeData ? (
          <img
            src={activeData}
            alt="Logo preview"
            className="h-7 max-w-[140px] object-contain"
          />
        ) : (
          <Clock className="w-6 h-6" style={{ color: effectivePrimary }} />
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

      {/* Primary Color Elements Preview */}
      <div
        className={`p-3 border rounded-xl space-y-2 text-xs ${
          isLight
            ? 'bg-white border-slate-200 text-slate-700'
            : 'bg-slate-950 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            Color Demo
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: effectivePrimary }}
          >
            Badge
          </span>
        </div>

        <button
          type="button"
          className="w-full py-1.5 px-3 rounded-lg text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1 cursor-default"
          style={{ backgroundColor: effectivePrimary }}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Primary Button</span>
        </button>
      </div>
    </div>
  )
}
