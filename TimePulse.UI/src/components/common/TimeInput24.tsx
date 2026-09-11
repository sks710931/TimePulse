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
 * Supports: "14:45", "1445", "930", "14:4", "1:34", "14", "9", etc.
 */
export function normalize24HourTime(input: string): string | null {
  const cleaned = input.trim()
  if (!cleaned) return null

  // If separated by colon: e.g. "14:30", "9:05", "14:4", "1:34", ":34"
  if (cleaned.includes(':')) {
    const parts = cleaned.split(':')
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10)
      if (isNaN(h)) h = 0
      let mStr = parts[1]
      // If user typed 1 digit minute e.g. "14:4", treat as 14:40
      if (mStr.length === 1) {
        mStr = mStr + '0'
      }
      let m = parseInt(mStr, 10)
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
  const isDeletingRef = useRef(false)

  useEffect(() => {
    setText(value || '00:00')
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const selectionStart = e.target.selectionStart ?? val.length

    // If user is deleting (Backspace / Delete), allow raw editing without auto-format
    if (isDeletingRef.current) {
      setText(val)
      return
    }

    let formatted = ''
    let cursorTarget = selectionStart

    // If the input already contains a colon (e.g. user edited hours or minutes in "12:34")
    if (val.includes(':')) {
      const [hRaw = '', ...rest] = val.split(':')
      const mRaw = rest.join('')
      let h = hRaw.replace(/\D/g, '').slice(0, 2)
      let m = mRaw.replace(/\D/g, '').slice(0, 2)

      if (h.length === 2) {
        let hNum = parseInt(h, 10)
        if (hNum > 23) h = '23'
      }
      if (m.length === 2) {
        let mNum = parseInt(m, 10)
        if (mNum > 59) m = '59'
      }

      formatted = `${h}:${m}`
      cursorTarget = selectionStart
    } else {
      // Raw digits without colon (e.g. typing digits from scratch or pasting "1445")
      const digits = val.replace(/\D/g, '')

      if (digits.length === 0) {
        formatted = ''
        cursorTarget = 0
      } else if (digits.length === 1) {
        // If first digit is 3..9, hour must be 03..09:
        if (digits > '2') {
          formatted = `0${digits}:`
          cursorTarget = 3
        } else {
          formatted = digits
          cursorTarget = 1
        }
      } else if (digits.length === 2) {
        let h = parseInt(digits, 10)
        if (h > 23) h = 23
        formatted = `${String(h).padStart(2, '0')}:`
        cursorTarget = 3
      } else if (digits.length === 3) {
        const h = digits.slice(0, 2)
        const m = digits.slice(2, 3)
        formatted = `${h}:${m}`
        cursorTarget = 4
      } else {
        // 4 or more digits: e.g. "1445" -> "14:45"
        let h = parseInt(digits.slice(0, 2), 10)
        let m = parseInt(digits.slice(2, 4), 10)
        if (h > 23) h = 23
        if (m > 59) m = 59
        formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        cursorTarget = 5
      }
    }

    setText(formatted)

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = Math.min(cursorTarget, formatted.length)
        inputRef.current.setSelectionRange(pos, pos)
      }
    })

    // Trigger onChange if it's a complete, valid HH:mm
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(formatted)) {
      onChange(formatted)
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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      isDeletingRef.current = true
      return
    }
    isDeletingRef.current = false

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
      onFocus={handleFocus}
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
