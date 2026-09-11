import { useState, useEffect, useRef } from 'react'

export interface TimeInput24Props {
  value: string // Format: "HH:mm" (24-hour)
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  ariaLabel?: string
  disabled?: boolean
}

/**
 * Normalizes user-typed time string into a valid 24-hour "HH:mm" string.
 * Supports: "14:30", "9:30", "1430", "930", "14", "9", etc.
 */
export function normalize24HourTime(input: string): string | null {
  const cleaned = input.trim()
  if (!cleaned) return null

  // If already separated by colon: e.g. "14:30", "9:05", "9:5"
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':')
    if (parts.length === 2) {
      let h = parseInt(parts[0], 10)
      let m = parseInt(parts[1], 10)
      if (isNaN(h)) return null
      if (isNaN(m)) m = 0
      h = Math.max(0, Math.min(23, h))
      m = Math.max(0, Math.min(59, m))
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
  }

  // If digits only
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 0) return null

  if (digits.length <= 2) {
    let h = parseInt(digits, 10)
    h = Math.max(0, Math.min(23, h))
    return `${String(h).padStart(2, '0')}:00`
  }

  if (digits.length === 3) {
    let h = parseInt(digits.slice(0, 1), 10)
    let m = parseInt(digits.slice(1), 10)
    h = Math.max(0, Math.min(23, h))
    m = Math.max(0, Math.min(59, m))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  if (digits.length >= 4) {
    let h = parseInt(digits.slice(0, 2), 10)
    let m = parseInt(digits.slice(2, 4), 10)
    h = Math.max(0, Math.min(23, h))
    m = Math.max(0, Math.min(59, m))
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  return null
}

export function TimeInput24({
  value,
  onChange,
  onBlur,
  className = '',
  ariaLabel = '24-hour time (HH:mm)',
  disabled = false,
}: TimeInput24Props) {
  const [text, setText] = useState(value || '00:00')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(value || '00:00')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^\d:]/g, '')

    // Auto-insert colon after 2 digits if typing forward
    if (raw.length === 2 && !raw.includes(':') && text.length < 2) {
      const h = parseInt(raw, 10)
      if (h <= 23) {
        raw = raw + ':'
      }
    } else if (raw.length > 5) {
      raw = raw.slice(0, 5)
    }

    setText(raw)

    // If completely matches HH:mm, trigger change immediately
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(raw)) {
      onChange(raw)
    }
  }

  const handleBlur = () => {
    const normalized = normalize24HourTime(text)
    if (normalized) {
      setText(normalized)
      onChange(normalized)
    } else {
      setText(value || '00:00')
    }
    onBlur?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
      return
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const cursorPos = e.currentTarget.selectionStart ?? 0
      const isHours = cursorPos <= 2
      const currentNorm = normalize24HourTime(text) || value || '00:00'
      const [hStr, mStr] = currentNorm.split(':')
      let h = parseInt(hStr, 10) || 0
      let m = parseInt(mStr, 10) || 0

      if (e.key === 'ArrowUp') {
        if (isHours) {
          h = (h + 1) % 24
        } else {
          m = (m + 1) % 60
        }
      } else {
        if (isHours) {
          h = (h - 1 + 24) % 24
        } else {
          m = (m - 1 + 60) % 60
        }
      }

      const nextVal = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      setText(nextVal)
      onChange(nextVal)

      // Restore cursor position
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(cursorPos, cursorPos)
        }
      })
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      placeholder="00:00"
      maxLength={5}
      className={
        className ||
        'bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none w-[44px] text-center text-xs font-mono font-medium'
      }
    />
  )
}
