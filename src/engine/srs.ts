import type { Grade } from './grade'

// Spaced repetition. The app talks to a Scheduler, so SM-2 can later be swapped
// (e.g. for FSRS) without touching storage or UI. Pure functions, no clock reads:
// every call gets `now` from the caller.

export const DAY = 24 * 60 * 60 * 1000

/** Recall quality on the SM-2 scale: 0 = blackout … 5 = perfect. Below 3 is a lapse. */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SrsCard {
  /** Task id or flashcard id */
  taskId: string
  /** epoch ms when the item is due again */
  due: number
  /** days until the next review */
  interval: number
  ease: number
  /** successful reviews in a row */
  reps: number
  lapses: number
}

export interface Scheduler {
  readonly name: string
  initial(taskId: string, now: number): SrsCard
  review(card: SrsCard, q: Quality, now: number): SrsCard
}

export const MIN_EASE = 1.3
export const START_EASE = 2.5
export const MAX_INTERVAL = 365

/**
 * SM-2 (Woźniak, 1990) with two practical tweaks:
 * - a lapse sends the item back to "tomorrow" (interval 1) instead of the same day,
 *   because the session's own "Moje błędy" mode already covers same-day repeats;
 * - intervals are capped at a year, so nothing disappears before the exam.
 */
export const sm2: Scheduler = {
  name: 'sm2',
  initial: (taskId, now) => ({
    taskId,
    due: now,
    interval: 0,
    ease: START_EASE,
    reps: 0,
    lapses: 0,
  }),
  review(card, q, now) {
    const ease = Math.max(MIN_EASE, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
    if (q < 3) {
      return { ...card, ease, reps: 0, lapses: card.lapses + 1, interval: 1, due: now + DAY }
    }
    const reps = card.reps + 1
    const raw = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(card.interval * ease)
    const interval = Math.min(MAX_INTERVAL, Math.max(1, raw))
    return { ...card, ease, reps, interval, due: now + interval * DAY }
  },
}

export const scheduler: Scheduler = sm2

/**
 * Maps a graded answer to recall quality.
 * Correct alone: 5 · correct with the hint: 3 · mostly right (≥ half): 2 · wrong: 1.
 */
export function qualityFromGrade(g: Grade, hintUsed: boolean): Quality {
  if (g.correct) return hintUsed ? 3 : 5
  return g.score >= 0.5 ? 2 : 1
}

/** Flashcard self-rating buttons. */
export const cardQuality = { forgot: 1, hard: 3, know: 5 } as const satisfies Record<
  string,
  Quality
>

/** End of the local day containing `now`: anything due before it counts as "for today". */
export function endOfDay(now: number) {
  const d = new Date(now)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

export const isDue = (card: SrsCard, now: number) => card.due <= endOfDay(now)

export const isCardId = (id: string) => id.includes('.card.')
