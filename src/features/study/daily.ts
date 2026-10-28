import { dailyStreak } from '@/engine/daily'
import { dayKey } from '@/engine/stats'

// History reads for "Zadanie dnia" and "Błyskawica". Both are derived from saved sessions,
// so they need no extra storage and travel with the backup.

export const BLITZ_SECONDS = 60

export interface DailyStatus {
  doneToday: boolean
  streak: number
}

export async function dailyStatus(now = Date.now()): Promise<DailyStatus> {
  const { progress } = await import('@/storage')
  const sessions = await progress().sessions(10_000)
  const days = new Set(sessions.filter((s) => s.mode === 'daily').map((s) => dayKey(s.finishedAt)))
  return { doneToday: days.has(dayKey(now)), streak: dailyStreak(days, now) }
}

/** Best Błyskawica score (correct answers), optionally ignoring one session (the one just played). */
export async function blitzRecord(exceptId?: string): Promise<number> {
  const { progress } = await import('@/storage')
  const sessions = await progress().sessions(10_000)
  return Math.max(
    0,
    ...sessions
      .filter((s) => s.mode === 'blitz' && s.id !== exceptId)
      .map((s) => s.summary.correct),
  )
}
