import { useState, useEffect } from 'react'
import { Pipette, RotateCcw, Check } from 'lucide-react'

interface ColorPickerInputProps {
  label: string
  description: string
  value: string | null
  defaultColor: string
  onChange: (hex: string | null) => void
}

const PRESET_COLORS = [
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Cyan', hex: '#0891b2' },
  { name: 'Slate', hex: '#475569' },
]

export function ColorPickerInput({
  label,
  description,
  value,
  defaultColor,
  onChange,
}: ColorPickerInputProps) {
  const activeColor = value || defaultColor
  const [hexInput, setHexInput] = useState(value || '')

  useEffect(() => {
    setHexInput(value || '')
  }, [value])

  const handleHexChange = (text: string) => {
    setHexInput(text)
    // Valid 3 or 6 digit hex with or without leading #
    const cleaned = text.startsWith('#') ? text : `#${text}`
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
      onChange(cleaned)
    }
  }

  const handleColorPickerChange = (hex: string) => {
    setHexInput(hex)
    onChange(hex)
  }

  const handleReset = () => {
    setHexInput('')
    onChange(null)
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
            {label}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
            style={{ backgroundColor: activeColor }}
            title={`Active: ${activeColor}`}
          />
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {value ? value.toUpperCase() : 'Default'}
          </span>
        </div>
      </div>

      {/* Main Color Picker & Hex Input row */}
      <div className="flex items-center gap-2">
        {/* Color input trigger */}
        <div className="relative w-11 h-10 shrink-0">
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorPickerChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Pick a color"
          />
          <div
            className="w-full h-full rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: activeColor }}
          >
            <Pipette className="w-4 h-4 text-white drop-shadow-md" />
          </div>
        </div>

        {/* Hex Text Field */}
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
            #
          </span>
          <input
            type="text"
            maxLength={7}
            placeholder={defaultColor.replace('#', '')}
            value={hexInput.replace('#', '')}
            onChange={(e) => handleHexChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
          />
        </div>

        {/* Clear to default */}
        {value && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Reset to default theme color"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Preset Swatches Palette */}
      <div className="pt-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1.5 block">
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
                className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                  isChosen
                    ? 'border-indigo-600 scale-110 ring-2 ring-indigo-500/30'
                    : 'border-slate-300/80 dark:border-slate-700 hover:scale-105'
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
