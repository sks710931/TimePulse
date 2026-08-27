import type { ChangeEvent } from 'react'
import { Upload, Trash2, Clock, Sun, Moon } from 'lucide-react'

interface LogoUploadCardProps {
  title: string
  themeType: 'light' | 'dark'
  logoData: string | null
  logoType: string
  fallbackLogoData?: string | null
  fallbackLogoType?: string
  appName: string
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}

export function LogoUploadCard({
  title,
  themeType,
  logoData,
  logoType,
  fallbackLogoData,
  fallbackLogoType,
  appName,
  onFileUpload,
  onClear,
}: LogoUploadCardProps) {
  const isLight = themeType === 'light'
  const activeData = logoData || fallbackLogoData
  const activeType = logoData ? logoType : fallbackLogoType || 'Default'

  return (
    <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isLight ? (
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {title}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          {logoData ? logoType : isLight ? 'Default' : 'Inherits Light'}
        </span>
      </div>

      {/* Large Logo Display Box */}
      <div
        className={`rounded-xl h-24 flex items-center justify-center gap-2 p-3 border shadow-inner transition-all ${
          isLight
            ? 'bg-white border-slate-200/80'
            : 'bg-[#0b0f19] border-slate-800/80'
        }`}
      >
        {activeType === 'Svg' && activeData ? (
          <div
            className="h-9 max-w-[200px] flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-h-9 [&>svg]:max-w-[200px] [&>svg]:object-contain overflow-hidden"
            dangerouslySetInnerHTML={{ __html: activeData }}
          />
        ) : activeData ? (
          <img
            src={activeData}
            alt="Logo preview"
            className="h-9 max-w-[200px] object-contain"
          />
        ) : (
          <Clock className={`w-7 h-7 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
        )}
        {appName && (
          <span
            className={`font-bold text-base truncate max-w-[160px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {appName}
          </span>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-2">
        <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer shadow-sm transition-all">
          <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>{logoData ? `Change ${isLight ? 'Light' : 'Dark'} Logo` : `Upload ${isLight ? 'Light' : 'Dark'} Logo`}</span>
          <input
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,image/*"
            onChange={onFileUpload}
            className="hidden"
          />
        </label>

        {logoData && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-sm cursor-pointer"
            title="Remove logo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
