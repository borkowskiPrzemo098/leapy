import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { DEFAULT_GOALS, type Goals } from '@/engine/gamify'

// Learner settings that belong with their progress (goals, reminder, badges already shown).
// Stored in IndexedDB like the study choice, so they travel with the backup file.

const KEY = 'profile'
const store = () => import('@/storage').then((m) => m.progress())

const dexieStorage: StateStorage = {
  getItem: async () => (await (await store()).getKv<string>(KEY)) ?? null,
  setItem: async (_name, value) => {
    await (await store()).setKv(KEY, value)
  },
  removeItem: async () => {
    await (await store()).deleteKv(KEY)
  },
}

export interface Reminder {
  enabled: boolean
  /** "HH:MM", local time */
  time: string
}

interface ProfileState {
  goals: Goals
  reminder: Reminder
  /** Badge ids the learner has already been told about */
  seenBadges: string[]
  setGoals: (g: Partial<Goals>) => void
  setReminder: (r: Partial<Reminder>) => void
  markBadgesSeen: (ids: string[]) => void
}

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      goals: DEFAULT_GOALS,
      reminder: { enabled: false, time: '18:00' },
      seenBadges: [],
      setGoals: (g) => set((s) => ({ goals: { ...s.goals, ...g } })),
      setReminder: (r) => set((s) => ({ reminder: { ...s.reminder, ...r } })),
      markBadgesSeen: (ids) =>
        set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => dexieStorage),
      partialize: (s) => ({ goals: s.goals, reminder: s.reminder, seenBadges: s.seenBadges }),
      version: 1,
    },
  ),
)

export const rehydrateProfile = () => useProfile.persist.rehydrate()

export function useProfileHydrated() {
  return useSyncExternalStore(
    (cb) => useProfile.persist.onFinishHydration(cb),
    () => useProfile.persist.hasHydrated(),
    () => false,
  )
}

// First-run flag lives in localStorage: Start must know synchronously whether to send a new
// learner to onboarding, before IndexedDB has answered.
const ONBOARDED = 'leapy:onboarded'
export function isOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED) === '1'
  } catch {
    return true
  }
}
export function setOnboarded() {
  try {
    localStorage.setItem(ONBOARDED, '1')
  } catch {
    /* private mode: onboarding simply shows again next time */
  }
}
