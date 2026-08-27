import { useState, useEffect } from 'react'
import { RotateCcw, Check, Sun, Moon } from 'lucide-react'

interface ColorPickerInputProps {
  label: string
  themeType: 'light' | 'dark'
  description: string
  value: string | null
  defaultColor: string
  onChange: (hex: string | null) => void
}

const PRESET_COLORS = [
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Slate', hex: '#475569' },
  { name: 'Dark', hex: '#0f172a' },
]

export function ColorPickerInput({
  label,
  themeType,
  description,
  value,
  defaultColor,
  onChange,
}: ColorPickerInputProps) {
  const activeColor = value || defaultColor
  const [hexInput, setHexInput] = useState(activeColor.toUpperCase())

  useEffect(() => {
    setHexInput((value || defaultColor).toUpperCase())
  }, [value, defaultColor])

  const handleHexChange = (text: string) => {
    setHexInput(text)
    const cleaned = text.startsWith('#') ? text : `#${text}`
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
      onChange(cleaned)
    }
  }

  const handleColorPickerChange = (hex: string) => {
    setHexInput(hex.toUpperCase())
    onChange(hex)
  }

  const handleReset = () => {
    setHexInput(defaultColor.toUpperCase())
    onChange(null)
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {themeType === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {label}
          </span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {activeColor.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        {/* Color Swatch Trigger */}
        <div className="relative w-9 h-8 shrink-0 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-transform">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorPickerChange(e.target.value)}
            className="absolute -top-2 -left-2 w-16 h-16 opacity-0 cursor-pointer z-10"
            title="Choose custom color"
          />
          <div
            className="w-full h-full"
            style={{ backgroundColor: activeColor }}
          />
        </div>

        {/* Hex Text Field */}
        <input
          type="text"
          maxLength={7}
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder={defaultColor}
          className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-1.5 focus:ring-indigo-500 shadow-sm transition-all"
        />

        {/* Reset button */}
        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset to default theme color"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset Swatches Palette */}
      <div className="pt-0.5 space-y-1.5">
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
          Preset Palettes
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_COLORS.map((preset) => {
            const isChosen = activeColor.toLowerCase() === preset.hex.toLowerCase()
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => handleColorPickerChange(preset.hex)}
                title={`${preset.name} (${preset.hex})`}
                className={`w-5 h-5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                  isChosen
                    ? 'scale-110 ring-2 ring-indigo-500 ring-offset-1 shadow-sm'
                    : 'border border-slate-300/60 dark:border-slate-700 hover:scale-105'
                }`}
                style={{ backgroundColor: preset.hex }}
              >
                {isChosen && <Check className="w-3 h-3 text-white drop-shadow" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
