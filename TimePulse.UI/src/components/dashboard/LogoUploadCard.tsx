import type { ChangeEvent } from 'react'
import { Upload, RotateCcw, Clock } from 'lucide-react'

interface LogoUploadCardProps {
  title: string
  themeType: 'light' | 'dark'
  description: string
  logoData: string | null
  logoType: string
  fallbackLogoData?: string | null
  fallbackLogoType?: string
  appName: string
  fileName: string
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
}

export function LogoUploadCard({
  title,
  themeType,
  description,
  logoData,
  logoType,
  fallbackLogoData,
  fallbackLogoType,
  appName,
  fileName,
  onFileUpload,
  onClear,
}: LogoUploadCardProps) {
  const isLight = themeType === 'light'
  const activeData = logoData || fallbackLogoData
  const activeType = logoData ? logoType : fallbackLogoType || 'Default'

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            {title}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {logoData ? logoType : isLight ? 'Default' : 'Inherits Light'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {/* Mini Preview Box */}
      <div
        className={`p-3 rounded-xl min-h-[58px] flex items-center justify-center gap-2 shadow-inner border ${
          isLight
            ? 'bg-slate-100 border-slate-300/80'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        {activeType === 'Svg' && activeData ? (
          <div
            className="h-7 max-w-[130px] flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-h-7 [&>svg]:max-w-[130px] [&>svg]:object-contain overflow-hidden"
            dangerouslySetInnerHTML={{ __html: activeData }}
          />
        ) : activeData ? (
          <img
            src={activeData}
            alt="Logo preview"
            className="h-7 max-w-[130px] object-contain"
          />
        ) : (
          <Clock className={`w-6 h-6 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
        )}
        {appName && (
          <span
            className={`font-bold text-sm truncate max-w-[120px] ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {appName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-all">
          <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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
            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            title="Clear logo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {fileName && (
        <span className="text-[11px] text-slate-500 truncate block">
          File: {fileName}
        </span>
      )}
    </div>
  )
}
