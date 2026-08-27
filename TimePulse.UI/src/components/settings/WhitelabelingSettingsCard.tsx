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
import { ColorPickerInput } from './ColorPickerInput'
import { BrandingNoteCard } from './BrandingNoteCard'
import { BrandingGuideModal } from './BrandingGuideModal'
import { Alert } from '../common/Alert'
import { Sparkles, RefreshCw, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react'

export function WhitelabelingSettingsCard() {
  const dispatch = useAppDispatch()
  const branding = useAppSelector((state) => state.branding)

  const [customAppName, setCustomAppName] = useState(branding.appName || '')
  const [customLogoData, setCustomLogoData] = useState<string | null>(branding.logoData)
  const [customLogoType, setCustomLogoType] = useState<string>(branding.logoType)
  const [customLogoDarkData, setCustomLogoDarkData] = useState<string | null>(branding.logoDarkData)
  const [customLogoDarkType, setCustomLogoDarkType] = useState<string>(branding.logoDarkType)
  const [customPrimaryColorLight, setCustomPrimaryColorLight] = useState<string | null>(branding.primaryColorLight)
  const [customPrimaryColorDark, setCustomPrimaryColorDark] = useState<string | null>(branding.primaryColorDark)
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  useEffect(() => {
    setCustomAppName(branding.appName || '')
    setCustomLogoData(branding.logoData)
    setCustomLogoType(branding.logoType)
    setCustomLogoDarkData(branding.logoDarkData)
    setCustomLogoDarkType(branding.logoDarkType)
    setCustomPrimaryColorLight(branding.primaryColorLight)
    setCustomPrimaryColorDark(branding.primaryColorDark)
  }, [
    branding.appName,
    branding.logoData,
    branding.logoType,
    branding.logoDarkData,
    branding.logoDarkType,
    branding.primaryColorLight,
    branding.primaryColorDark,
  ])

  const handleLightFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
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
        primaryColorLight: customPrimaryColorLight,
        primaryColorDark: customPrimaryColorDark,
      })
    )
  }

  const handleReset = async () => {
    dispatch(clearBrandingMessages())
    setCustomPrimaryColorLight(null)
    setCustomPrimaryColorDark(null)
    await dispatch(resetBranding())
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-blue-100/80 dark:border-blue-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Whitelabelling & Custom Branding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize how your application looks and feels. Update your brand identity, colors, and logos.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Custom Branding Guide</span>
          </button>
        </div>

        {/* Status Alerts */}
        {branding.error && <Alert type="error" message={branding.error} />}
        {branding.successMessage && <Alert type="success" message={branding.successMessage} />}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form Settings (Left 2/3 Column) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Application Identity */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Application Identity
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                  Application Name (Optional)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  This will be displayed in the application instead of the default name.
                </p>
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="TimePulse"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Section 2: Primary Theme Colors */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Primary Theme Colors
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose your brand colors that reflect in the application.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <ColorPickerInput
                  label="Light Mode Primary Color"
                  themeType="light"
                  description="Primary color used in light mode UI elements."
                  value={customPrimaryColorLight}
                  defaultColor="#1e3a8a"
                  onChange={setCustomPrimaryColorLight}
                />

                <ColorPickerInput
                  label="Dark Mode Primary Color"
                  themeType="dark"
                  description="Primary color used in dark mode UI elements."
                  value={customPrimaryColorDark}
                  defaultColor="#f59e0b"
                  onChange={setCustomPrimaryColorDark}
                />
              </div>
            </div>

            {/* Section 3: Brand Logos */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Brand Logos
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload your logo for light and dark themes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <LogoUploadCard
                  title="Light Mode Logo"
                  themeType="light"
                  logoData={customLogoData}
                  logoType={customLogoType}
                  appName={customAppName}
                  onFileUpload={handleLightFileUpload}
                  onClear={() => {
                    setCustomLogoData(null)
                    setCustomLogoType('Default')
                  }}
                />

                <LogoUploadCard
                  title="Dark Mode Logo"
                  themeType="dark"
                  logoData={customLogoDarkData}
                  logoType={customLogoDarkType}
                  fallbackLogoData={customLogoData}
                  fallbackLogoType={customLogoType}
                  appName={customAppName}
                  onFileUpload={handleDarkFileUpload}
                  onClear={() => {
                    setCustomLogoDarkData(null)
                    setCustomLogoDarkType('Default')
                  }}
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={branding.isSaving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
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
                className="px-4 py-2.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-60 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Live Preview Panel (Right 1/3 Column) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                Live Preview
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                See how your branding will look in the application.
              </p>
            </div>

            <BrandingPreviewCard
              themeType="light"
              title="Light Mode Preview"
              logoData={customLogoData}
              logoType={customLogoType}
              appName={customAppName}
              primaryColor={customPrimaryColorLight}
            />

            <BrandingPreviewCard
              themeType="dark"
              title="Dark Mode Preview"
              logoData={customLogoDarkData}
              logoType={customLogoDarkType}
              fallbackLogoData={customLogoData}
              fallbackLogoType={customLogoType}
              appName={customAppName}
              primaryColor={customPrimaryColorDark || customPrimaryColorLight}
            />

            <BrandingNoteCard />
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <BrandingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  )
}
