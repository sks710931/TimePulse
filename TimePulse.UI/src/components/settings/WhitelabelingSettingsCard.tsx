import { useState, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  saveBranding,
  resetBranding,
  clearBrandingMessages,
} from '../../store/slices/brandingSlice'
import { LogoUploadCard } from './LogoUploadCard'
import { BrandingPreviewCard } from './BrandingPreviewCard'
import { Alert } from '../common/Alert'
import { Palette, Sparkles, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react'

export function WhitelabelingSettingsCard() {
  const dispatch = useAppDispatch()
  const branding = useAppSelector((state) => state.branding)

  const [customAppName, setCustomAppName] = useState(branding.appName || '')
  const [customLogoData, setCustomLogoData] = useState<string | null>(branding.logoData)
  const [customLogoType, setCustomLogoType] = useState<string>(branding.logoType)
  const [customLogoDarkData, setCustomLogoDarkData] = useState<string | null>(branding.logoDarkData)
  const [customLogoDarkType, setCustomLogoDarkType] = useState<string>(branding.logoDarkType)
  const [uploadFileNameLight, setUploadFileNameLight] = useState<string>('')
  const [uploadFileNameDark, setUploadFileNameDark] = useState<string>('')

  useEffect(() => {
    setCustomAppName(branding.appName || '')
    setCustomLogoData(branding.logoData)
    setCustomLogoType(branding.logoType)
    setCustomLogoDarkData(branding.logoDarkData)
    setCustomLogoDarkType(branding.logoDarkType)
  }, [branding.appName, branding.logoData, branding.logoType, branding.logoDarkData, branding.logoDarkType])

  const handleLightFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFileNameLight(file.name)
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg')
    const reader = new FileReader()
    if (isSvg) {
      reader.onload = (event) => {
        setCustomLogoData(event.target?.result as string)
        setCustomLogoType('Svg')
      }
      reader.readAsText(file)
    } else {
      reader.onload = (event) => {
        setCustomLogoData(event.target?.result as string)
        setCustomLogoType('Image')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDarkFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFileNameDark(file.name)
    const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg')
    const reader = new FileReader()
    if (isSvg) {
      reader.onload = (event) => {
        setCustomLogoDarkData(event.target?.result as string)
        setCustomLogoDarkType('Svg')
      }
      reader.readAsText(file)
    } else {
      reader.onload = (event) => {
        setCustomLogoDarkData(event.target?.result as string)
        setCustomLogoDarkType('Image')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    dispatch(clearBrandingMessages())
    await dispatch(
      saveBranding({
        appName: customAppName,
        logoData: customLogoData,
        logoType: customLogoType,
        logoDarkData: customLogoDarkData,
        logoDarkType: customLogoDarkType,
      })
    )
  }

  const handleReset = async () => {
    dispatch(clearBrandingMessages())
    setUploadFileNameLight('')
    setUploadFileNameDark('')
    await dispatch(resetBranding())
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Whitelabeling & Custom Branding
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize company name and logos across light/dark themes.
            </p>
          </div>
        </div>
        {branding.isCustom ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 self-start sm:self-auto">
            <Sparkles className="w-3 h-3" />
            Custom Branding Active
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
            Default Branding
          </span>
        )}
      </div>

      {branding.error && <Alert type="error" message={branding.error} />}
      {branding.successMessage && <Alert type="success" message={branding.successMessage} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Application Name (Optional - default is TimePulse)
            </label>
            <input
              type="text"
              value={customAppName}
              onChange={(e) => setCustomAppName(e.target.value)}
              placeholder="Leave blank for TimePulse or enter custom name"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Dual Logo Configuration (Light Mode & Dark Mode) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <LogoUploadCard
              title="☀️ Light Mode Logo"
              themeType="light"
              description="Used on light backgrounds (Login, Sidebar, Headers)."
              logoData={customLogoData}
              logoType={customLogoType}
              appName={customAppName}
              fileName={uploadFileNameLight}
              onFileUpload={handleLightFileUpload}
              onClear={() => {
                setCustomLogoData(null)
                setCustomLogoType('Default')
                setUploadFileNameLight('')
              }}
            />

            <LogoUploadCard
              title="🌙 Dark Mode Logo"
              themeType="dark"
              description="Used on dark backgrounds. Falls back to Light Logo if omitted."
              logoData={customLogoDarkData}
              logoType={customLogoDarkType}
              fallbackLogoData={customLogoData}
              fallbackLogoType={customLogoType}
              appName={customAppName}
              fileName={uploadFileNameDark}
              onFileUpload={handleDarkFileUpload}
              onClear={() => {
                setCustomLogoDarkData(null)
                setCustomLogoDarkType('Default')
                setUploadFileNameDark('')
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={branding.isSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-60 cursor-pointer"
            >
              {branding.isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Branding</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={branding.isSaving}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Live Preview Side Panel */}
        <div className="space-y-4">
          <BrandingPreviewCard
            themeType="light"
            title="☀️ Light Mode Preview"
            logoData={customLogoData}
            logoType={customLogoType}
            appName={customAppName}
          />

          <BrandingPreviewCard
            themeType="dark"
            title="🌙 Dark Mode Preview"
            logoData={customLogoDarkData}
            logoType={customLogoDarkType}
            fallbackLogoData={customLogoData}
            fallbackLogoType={customLogoType}
            appName={customAppName}
          />
        </div>
      </div>
    </div>
  )
}
