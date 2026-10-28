import { create } from 'zustand'
import { applyAccent, readAccent, type AccentId } from '@/lib/accent'
import { applyTheme, readThemePref, type ThemePref } from '@/lib/theme'

// Device-level UI preferences. They live in localStorage (not Dexie) because the
// inline boot script in index.html must read them synchronously before first paint.

export type MotionPref = 'system' | 'reduce'

const KEYS = { motion: 'leapy:motion' } as const

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
  motion: MotionPref
  accent: AccentId
  setTheme: (t: ThemePref) => void
  setAccent: (a: AccentId) => void
  setMotion: (m: MotionPref) => void
}

export const usePrefs = create<PrefsState>((set) => {
  // The text-size setting was removed; drop a value stored by older versions.
  write('leapy:text-scale', null)
  return {
    theme: readThemePref(),
    motion: read(KEYS.motion) === 'reduce' ? 'reduce' : 'system',
    accent: readAccent(),
    setAccent: (accent) => {
      applyAccent(accent)
      set({ accent })
    },
    setTheme: (theme) => {
      applyTheme(theme)
      set({ theme })
    },
    setMotion: (motion) => {
      applyMotion(motion)
      set({ motion })
    },
  }
})
