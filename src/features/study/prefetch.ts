import { useEffect } from 'react'
import { loadPack } from '@/content/data'
import { useStudy } from '@/state/study'

/**
 * Fetches the packs of the learner's subjects in the background, so the service worker's
 * runtime cache holds them and they work offline from then on. Failures are ignored (offline).
 */
export function usePrefetchSubjects() {
  const exam = useStudy((s) => s.exam)
  const subjects = useStudy((s) => s.subjects)
  const key = `${exam}|${subjects.join(',')}`
  useEffect(() => {
    if (!exam) return
    for (const s of subjects) void loadPack(exam, s).catch(() => undefined)
    // subjects are captured through key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}
