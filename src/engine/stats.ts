// Learner statistics as pure functions over attempts and sessions (no React, no storage).
// Days are LOCAL calendar days: a learner in Poland studying at 23:30 expects "today".

export interface AttemptLike {
  taskId: string
  exam: string
  subject: string
  topic: string
  ts: number
  correct: boolean
  ms: number
}

export interface SessionLike {
  mode: string
  finishedAt: number
  summary: { answered: number; ms: number }
}

/** "2026-10-27" in local time */
export function dayKey(ts: number) {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Local midnight of the day `offset` days after `ts` */
export function startOfDay(ts: number, offset = 0) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d.getTime()
}

export interface DayActivity {
  /** Answered tasks plus reviewed flashcards */
  items: number
  answered: number
  correct: number
  ms: number
}

/** Activity per local day. Flashcard sessions add their reviewed cards and time. */
export function activityByDay(attempts: AttemptLike[], sessions: SessionLike[] = []) {
  const out = new Map<string, DayActivity>()
  const get = (k: string) => {
    let a = out.get(k)
    if (!a) out.set(k, (a = { items: 0, answered: 0, correct: 0, ms: 0 }))
    return a
  }
  for (const a of attempts) {
    const d = get(dayKey(a.ts))
    d.items++
    d.answered++
    if (a.correct) d.correct++
    d.ms += a.ms
  }
  for (const s of sessions) {
    if (s.mode !== 'cards') continue
    const d = get(dayKey(s.finishedAt))
    d.items += s.summary.answered
    d.ms += s.summary.ms
  }
  return out
}

/**
 * Consecutive active days ending today, or ending yesterday when today has no activity yet
 * (the streak is not lost until the day is over).
 */
export function currentStreak(active: Set<string>, now: number) {
  let offset = active.has(dayKey(now)) ? 0 : -1
  let n = 0
  while (active.has(dayKey(startOfDay(now, offset)))) {
    n++
    offset--
  }
  return n
}

/** Calendar day number of a "YYYY-MM-DD" key (UTC arithmetic, so DST cannot skew it) */
const dayNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / 86_400_000

export function longestStreak(active: Set<string>) {
  const days = [...active].map(dayNumber).sort((a, b) => a - b)
  let best = 0
  let run = 0
  days.forEach((d, i) => {
    run = i > 0 && d === (days[i - 1] ?? 0) + 1 ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}

export interface CalendarDay {
  key: string
  ts: number
  /** after today */
  future: boolean
}

/**
 * The last `weeks` weeks as columns, Monday first (Polish convention), the current week last.
 */
export function calendarWeeks(weeks: number, now: number): CalendarDay[][] {
  const today = startOfDay(now)
  const weekday = (new Date(today).getDay() + 6) % 7 // Monday = 0
  const firstMonday = startOfDay(today, -weekday - (weeks - 1) * 7)
  const cols: CalendarDay[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      const ts = startOfDay(firstMonday, w * 7 + d)
      col.push({ key: dayKey(ts), ts, future: ts > today })
    }
    cols.push(col)
  }
  return cols
}

/** Heat level 0–4 for a day's item count. Fixed thresholds, so colours mean the same every week. */
export function heatLevel(items: number): 0 | 1 | 2 | 3 | 4 {
  if (items <= 0) return 0
  if (items < 5) return 1
  if (items < 10) return 2
  if (items < 20) return 3
  return 4
}

export interface DayPoint {
  key: string
  ts: number
  answered: number
  correct: number
}

/** One point per day for the last `days` days (today last), zero-filled. */
export function dailySeries(activity: Map<string, DayActivity>, days: number, now: number) {
  const out: DayPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ts = startOfDay(now, -i)
    const key = dayKey(ts)
    const a = activity.get(key)
    out.push({ key, ts, answered: a?.answered ?? 0, correct: a?.correct ?? 0 })
  }
  return out
}

export interface TopicMastery {
  /** "exam/subject/topic" */
  key: string
  exam: string
  subject: string
  topic: string
  attempts: number
  correct: number
  /** distinct tasks tried */
  seen: number
  /** distinct tasks whose LAST attempt was correct */
  mastered: number
  lastTs: number
}

/** Per topic: how many different tasks are mastered (last answer right), not just raw accuracy. */
export function topicMastery(attempts: AttemptLike[]) {
  const last = new Map<string, AttemptLike>()
  const out = new Map<string, TopicMastery>()
  for (const a of attempts) {
    const key = `${a.exam}/${a.subject}/${a.topic}`
    let t = out.get(key)
    if (!t)
      out.set(
        key,
        (t = {
          key,
          exam: a.exam,
          subject: a.subject,
          topic: a.topic,
          attempts: 0,
          correct: 0,
          seen: 0,
          mastered: 0,
          lastTs: 0,
        }),
      )
    t.attempts++
    if (a.correct) t.correct++
    t.lastTs = Math.max(t.lastTs, a.ts)
    const prev = last.get(a.taskId)
    if (!prev || a.ts >= prev.ts) last.set(a.taskId, a)
  }
  for (const a of last.values()) {
    const t = out.get(`${a.exam}/${a.subject}/${a.topic}`)
    if (!t) continue
    t.seen++
    if (a.correct) t.mastered++
  }
  return out
}

/** Task ids whose most recent attempt was wrong, most recent first. */
export function mistakeIds(attempts: AttemptLike[]) {
  const last = new Map<string, AttemptLike>()
  for (const a of attempts) {
    const prev = last.get(a.taskId)
    if (!prev || a.ts >= prev.ts) last.set(a.taskId, a)
  }
  return [...last.values()]
    .filter((a) => !a.correct)
    .sort((x, y) => y.ts - x.ts)
    .map((a) => a.taskId)
}

export interface Totals {
  answered: number
  correct: number
  accuracy: number
  ms: number
  activeDays: number
}

export function totals(activity: Map<string, DayActivity>): Totals {
  let answered = 0
  let correct = 0
  let ms = 0
  for (const a of activity.values()) {
    answered += a.answered
    correct += a.correct
    ms += a.ms
  }
  return {
    answered,
    correct,
    accuracy: answered ? correct / answered : 0,
    ms,
    activeDays: activity.size,
  }
}
