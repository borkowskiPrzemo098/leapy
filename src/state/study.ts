import { useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

// What the learner studies: one exam and its subjects. Persisted in IndexedDB (kv table),
// so it travels with the backup file together with progress.

const KEY = 'study'

// IndexedDB (Dexie) is loaded on demand so it stays out of the first-screen bundle.
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

interface StudyState {
  exam: string | null
  subjects: string[]
  /** Switching exam clears subjects from the previous one */
  chooseExam: (exam: string) => void
  toggleSubject: (exam: string, subject: string) => void
  reset: () => void
}

export const useStudy = create<StudyState>()(
  persist(
    (set) => ({
      exam: null,
      subjects: [],
      chooseExam: (exam) => set((s) => (s.exam === exam ? s : { exam, subjects: [] })),
      toggleSubject: (exam, subject) =>
        set((s) => {
          const base = s.exam === exam ? s.subjects : []
          const subjects = base.includes(subject)
            ? base.filter((x) => x !== subject)
            : [...base, subject]
          return { exam, subjects }
        }),
      reset: () => set({ exam: null, subjects: [] }),
    }),
    {
      name: KEY,
      storage: createJSONStorage(() => dexieStorage),
      partialize: (s) => ({ exam: s.exam, subjects: s.subjects }),
      version: 1,
    },
  ),
)

/** Re-read after a backup import or reset replaced the database. */
export const rehydrateStudy = () => useStudy.persist.rehydrate()

/** True once the saved selection has been read from IndexedDB (reactive). */
export function useStudyHydrated() {
  return useSyncExternalStore(
    (cb) => useStudy.persist.onFinishHydration(cb),
    () => useStudy.persist.hasHydrated(),
    () => false,
  )
}
