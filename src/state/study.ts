import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// What the learner studies: one exam and its subjects. Kept in localStorage for the
// shell; in E2 it moves into the Dexie profile behind ProgressStore (same shape).

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
    { name: 'leapy:study', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
