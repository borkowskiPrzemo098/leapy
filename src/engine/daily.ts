import { dayKey } from './stats'

// "Zadanie dnia": one task per calendar day, the same for everyone with the same subjects.
// Pure functions: the day and the pool come from outside, nothing reads the clock.

/** FNV-1a: a small, stable string hash (same result in every browser and in Node). */
export function hashString(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * The task id for a day. The pool is sorted first, so the choice depends only on which
 * tasks exist and on the date, not on the order they were loaded in.
 */
export function dailyTaskId(poolIds: readonly string[], day: string): string | undefined {
  if (!poolIds.length) return undefined
  const sorted = [...poolIds].sort()
  return sorted[hashString(`leapy:${day}`) % sorted.length]
}

/**
 * Days in a row with the daily task done, ending today (or yesterday: today is not over yet).
 * `doneDays` are local "YYYY-MM-DD" keys.
 */
export function dailyStreak(doneDays: ReadonlySet<string>, now: number): number {
  const day = 86_400_000
  let t = doneDays.has(dayKey(now)) ? now : now - day
  let n = 0
  while (doneDays.has(dayKey(t))) {
    n++
    t -= day
  }
  return n
}
