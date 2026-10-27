import { create } from 'zustand'
import { applyTheme, readThemePref, type ThemePref } from '@/lib/theme'

// Device-level UI preferences. They live in localStorage (not Dexie) because the
// inline boot script in index.html must read them synchronously before first paint.

export type TextScale = 'sm' | 'md' | 'lg' | 'xl'
export type MotionPref = 'system' | 'reduce'

export const TEXT_SCALE: Record<TextScale, number> = { sm: 0.9, md: 1, lg: 1.125, xl: 1.25 }

const KEYS = { text: 'leapy:text-scale', motion: 'leapy:motion' } as const

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* storage blocked: the preference still applies for this visit */
  }
}

const isTextScale = (v: string | null): v is TextScale => !!v && v in TEXT_SCALE

export function applyTextScale(scale: TextScale) {
  document.documentElement.style.setProperty('--text-scale', String(TEXT_SCALE[scale]))
  write(KEYS.text, scale === 'md' ? null : scale)
}

export function applyMotion(pref: MotionPref) {
  const root = document.documentElement
  if (pref === 'reduce') root.dataset.motion = 'reduce'
  else delete root.dataset.motion
  write(KEYS.motion, pref === 'reduce' ? 'reduce' : null)
}

/** True when animations should not run: user setting or OS setting. */
export function motionReduced() {
  return (
    document.documentElement.dataset.motion === 'reduce' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

interface PrefsState {
  theme: ThemePref
  textScale: TextScale
  motion: MotionPref
  setTheme: (t: ThemePref) => void
  setTextScale: (s: TextScale) => void
  setMotion: (m: MotionPref) => void
}

export const usePrefs = create<PrefsState>((set) => {
  const text = read(KEYS.text)
  return {
    theme: readThemePref(),
    textScale: isTextScale(text) ? text : 'md',
    motion: read(KEYS.motion) === 'reduce' ? 'reduce' : 'system',
    setTheme: (theme) => {
      applyTheme(theme)
      set({ theme })
    },
    setTextScale: (textScale) => {
      applyTextScale(textScale)
      set({ textScale })
    },
    setMotion: (motion) => {
      applyMotion(motion)
      set({ motion })
    },
  }
})
