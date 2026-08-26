import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
}

const STORAGE_KEY = 'tp_theme_mode'

function adjustHex(hex: string, percent: number): string {
  try {
    let cleanHex = hex.replace('#', '')
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('')
    }
    const num = parseInt(cleanHex, 16)
    if (isNaN(num)) return hex
    const amt = Math.round(2.55 * percent)
    const R = Math.max(0, Math.min(255, (num >> 16) + amt))
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
    const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`
  } catch {
    return hex
  }
}

export function applyThemeToDom(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'dark') {
    root.classList.add('dark')
  } else if (mode === 'light') {
    root.classList.remove('dark')
  } else {
    // System setting
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

export function applyBrandColorsToDom(
  primaryLight: string | null,
  primaryDark: string | null,
  themeMode: ThemeMode
) {
  const root = document.documentElement
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const activeColor = isDark
    ? primaryDark || primaryLight || '#6366f1'
    : primaryLight || '#4f46e5'

  root.style.setProperty('--color-primary', activeColor)
  root.style.setProperty('--color-primary-hover', adjustHex(activeColor, -15))
}

const getInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      return saved
    }
  } catch {
    // Ignore localStorage errors
  }
  return 'system'
}

const initialMode = getInitialTheme()
applyThemeToDom(initialMode)

const initialState: ThemeState = {
  mode: initialMode,
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      try {
        localStorage.setItem(STORAGE_KEY, action.payload)
      } catch {
        // Ignore localStorage errors
      }
      applyThemeToDom(action.payload)
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
