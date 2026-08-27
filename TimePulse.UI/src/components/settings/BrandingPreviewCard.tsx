import { Clock, Check, Sun, Moon } from 'lucide-react'

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
  const effectivePrimary = primaryColor || (isLight ? '#1e3a8a' : '#f59e0b')

  return (
    <div
      className={`rounded-2xl border p-4 space-y-3.5 shadow-sm transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 text-slate-800'
          : 'bg-[#0f172a] border-slate-800 text-slate-100'
      }`}
    >
      {/* Title with Theme Icon */}
      <div className="flex items-center gap-1.5">
        {isLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span className="text-xs font-bold tracking-tight">
          {title}
        </span>
      </div>

      {/* Mini App Header (Logo on Left, Badge on Right) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-2 min-w-0">
          {activeType === 'Svg' && activeData ? (
            <div
              className="h-6 max-w-[130px] flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-h-6 [&>svg]:max-w-[130px] [&>svg]:object-contain overflow-hidden shrink-0"
              dangerouslySetInnerHTML={{ __html: activeData }}
            />
          ) : activeData ? (
            <img
              src={activeData}
              alt="Logo preview"
              className="h-6 max-w-[130px] object-contain shrink-0"
            />
          ) : (
            <Clock className="w-5 h-5 shrink-0" style={{ color: effectivePrimary }} />
          )}

          {appName && (
            <span
              className={`font-bold text-sm truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {appName}
            </span>
          )}
        </div>

        {/* Dynamic Badge */}
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm shrink-0"
          style={{ backgroundColor: effectivePrimary }}
        >
          Badge
        </span>
      </div>

      {/* Color Demo Button Section */}
      <div className="pt-2 space-y-2">
        <span
          className={`text-[9px] uppercase font-bold tracking-wider block ${
            isLight ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          COLOR DEMO
        </span>

        <button
          type="button"
          className="w-full py-2 px-3 rounded-lg text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-default transition-all"
          style={{ backgroundColor: effectivePrimary }}
        >
          <Check className="w-3.5 h-3.5 text-white" />
          <span>Primary Button</span>
        </button>
      </div>
    </div>
  )
}
