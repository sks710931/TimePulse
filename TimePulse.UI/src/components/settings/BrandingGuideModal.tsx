import { X, BookOpen, CheckCircle, Palette, Sparkles, Image as ImageIcon } from 'lucide-react'

interface BrandingGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BrandingGuideModal({ isOpen, onClose }: BrandingGuideModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Custom Branding Guide
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Best practices for configuring logos and theme accents.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guide Content */}
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <ImageIcon className="w-4 h-4 text-indigo-500" />
              <span>SVG vs Raster Logos (PNG / JPEG)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              We highly recommend vector SVG logos for lossless scaling across high-DPI screens and mobile devices. Transparent PNGs are also supported.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Dual Color Customization</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose darker shades (e.g., #1E3A8A) for Light Mode to maintain high contrast on white backgrounds, and vibrant/bright shades (e.g., #F59E0B) for Dark Mode.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Instant Global Theme Propagation</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When you save your branding, colors and logos immediately apply across the navigation bar, buttons, badges, and login screens for all users.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Got it</span>
          </button>
        </div>
      </div>
    </div>
  )
}
