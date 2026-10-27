import { dayKey, startOfDay, type AttemptLike, type SessionLike } from './stats'

// Gamification, derived from history (never stored, so it cannot drift from what happened and
// travels with the backup for free). No dark patterns: XP never goes down, a missed day is
// covered by an earned freeze automatically, and nothing here is for sale.

export interface XpAttempt extends AttemptLike {
  score?: number
  hintUsed?: boolean
}

export interface XpSession extends SessionLike {
  summary: SessionLike['summary'] & { total?: number; correct?: number }
}

/** XP per event. Effort counts too: a wrong answer still earns a little. */
export const XP = {
  correct: 10,
  correctWithHint: 6,
  wrong: 2,
  card: 3,
  session: 5,
  mock: 20,
} as const

export function attemptXp(a: XpAttempt) {
  if (a.correct) return a.hintUsed ? XP.correctWithHint : XP.correct
  return XP.wrong
}

export function totalXp(attempts: XpAttempt[], sessions: XpSession[]) {
  let xp = 0
  for (const a of attempts) xp += attemptXp(a)
  for (const s of sessions) {
    if (s.mode === 'cards') xp += s.summary.answered * XP.card
    xp += s.mode === 'mock' ? XP.mock : XP.session
  }
  return xp
}

/** XP needed to go from level n to n+1: 100, 150, 200, … (level 1 starts at 0). */
export const levelStep = (level: number) => 50 + 50 * level

export interface Level {
  level: number
  /** XP earned inside the current level */
  into: number
  /** XP the current level needs in total */
  need: number
}

export function levelOf(xp: number): Level {
  let level = 1
  let rest = xp
  while (rest >= levelStep(level)) {
    rest -= levelStep(level)
    level++
  }
  return { level, into: rest, need: levelStep(level) }
}

// ---------- streak with freezes ----------

export const FREEZE_EVERY = 7
export const MAX_FREEZES = 2

export interface StreakState {
  /** Days in the current streak (frozen days are bridged, not counted) */
  current: number
  longest: number
  /** Freezes ready to cover a future missed day */
  freezes: number
  /** Days covered by a freeze so far ("YYYY-MM-DD") */
  frozen: string[]
  /** Studied today already */
  today: boolean
}

const dayNumber = (key: string) => Date.parse(`${key}T00:00:00Z`) / 86_400_000

/**
 * Replays active days in order. Every 7 days of streak earns a freeze (max 2 in stock).
 * A gap of k missed days is bridged if k freezes are in stock; otherwise the streak restarts.
 * Today without activity does not break anything: the day is not over yet.
 */
export function streakWithFreezes(active: Set<string>, now: number): StreakState {
  const days = [...active].map(dayNumber).sort((a, b) => a - b)
  const today = dayNumber(dayKey(now))
  let current = 0
  let longest = 0
  let freezes = 0
  let earned = 0
  const frozen: number[] = []
  let prev: number | null = null

  const bridge = (from: number, to: number) => {
    // missed days strictly between from and to
    const missed = to - from - 1
    if (missed <= 0) return true
    if (missed > freezes) return false
    freezes -= missed
    for (let d = from + 1; d < to; d++) frozen.push(d)
    return true
  }

  for (const d of days) {
    if (d > today) break
    if (prev === null || !bridge(prev, d)) {
      current = 0
      earned = 0
    }
    current++
    if (current % FREEZE_EVERY === 0 && current / FREEZE_EVERY > earned) {
      earned++
      freezes = Math.min(MAX_FREEZES, freezes + 1)
    }
    longest = Math.max(longest, current)
    prev = d
  }
  // The streak is still alive if the gap up to yesterday can be bridged.
  if (prev !== null && prev < today) {
    const missed = today - prev - 1
    if (missed > freezes) current = 0
    else if (missed > 0) {
      freezes -= missed
      for (let d = prev + 1; d < today; d++) frozen.push(d)
    }
  }
  const toKey = (n: number) => new Date(n * 86_400_000).toISOString().slice(0, 10)
  return {
    current,
    longest,
    freezes,
    frozen: frozen.map(toKey),
    today: prev === today,
  }
}

// ---------- goals ----------

export interface Goals {
  /** Tasks (or cards) per day */
  daily: number
  /** Days per week with the daily goal met */
  weekly: number
}

export const DEFAULT_GOALS: Goals = { daily: 10, weekly: 5 }

/** Monday 00:00 of the week containing `now` */
export function weekStart(now: number) {
  const weekday = (new Date(now).getDay() + 6) % 7
  return startOfDay(now, -weekday)
}

export interface GoalProgress {
  todayItems: number
  todayDone: boolean
  /** Days this week (Mon–Sun) with the daily goal met */
  weekDays: number
  weekDone: boolean
  /** Monday-first, true when that day met the goal */
  week: { key: string; met: boolean; future: boolean }[]
}

export function goalProgress(
  itemsByDay: Map<string, { items: number }>,
  goals: Goals,
  now: number,
): GoalProgress {
  const start = weekStart(now)
  const todayKey = dayKey(now)
  const week = Array.from({ length: 7 }, (_, i) => {
    const ts = startOfDay(start, i)
    const key = dayKey(ts)
    return {
      key,
      met: (itemsByDay.get(key)?.items ?? 0) >= goals.daily,
      future: ts > startOfDay(now),
    }
  })
  const todayItems = itemsByDay.get(todayKey)?.items ?? 0
  const weekDays = week.filter((d) => d.met).length
  return {
    todayItems,
    todayDone: todayItems >= goals.daily,
    weekDays,
    weekDone: weekDays >= goals.weekly,
    week,
  }
}

// ---------- badges ----------

export interface BadgeFacts {
  answered: number
  correct: number
  longestStreak: number
  mocks: number
  /** best mock exam result 0..1 */
  bestMock: number
  /** finished sessions with every answer right (at least 5 tasks) */
  perfectSessions: number
  cardSessions: number
  topicsMastered: number
  level: number
}

export interface Badge {
  id: string
  title: string
  /** How to get it, shown before and after unlocking */
  how: string
  test: (f: BadgeFacts) => boolean
}

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    title: 'Pierwszy stopień',
    how: 'Rozwiąż pierwsze zadanie.',
    test: (f) => f.answered >= 1,
  },
  { id: 'tasks-100', title: 'Setka', how: 'Rozwiąż 100 zadań.', test: (f) => f.answered >= 100 },
  { id: 'tasks-500', title: 'Pięćset', how: 'Rozwiąż 500 zadań.', test: (f) => f.answered >= 500 },
  {
    id: 'streak-3',
    title: 'Trzy dni z rzędu',
    how: 'Ucz się 3 dni z rzędu.',
    test: (f) => f.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    title: 'Tydzień',
    how: 'Ucz się 7 dni z rzędu.',
    test: (f) => f.longestStreak >= 7,
  },
  {
    id: 'streak-30',
    title: 'Miesiąc',
    how: 'Ucz się 30 dni z rzędu.',
    test: (f) => f.longestStreak >= 30,
  },
  {
    id: 'perfect',
    title: 'Bez pomyłki',
    how: 'Skończ sesję (min. 5 zadań) bez błędu.',
    test: (f) => f.perfectSessions >= 1,
  },
  {
    id: 'mock-1',
    title: 'Próba generalna',
    how: 'Oddaj pierwszy egzamin próbny.',
    test: (f) => f.mocks >= 1,
  },
  {
    id: 'mock-80',
    title: 'Pewny wynik',
    how: 'Zdobądź 80% punktów w egzaminie próbnym.',
    test: (f) => f.bestMock >= 0.8,
  },
  {
    id: 'cards-10',
    title: 'Fiszkomaniak',
    how: 'Przejdź 10 sesji fiszek.',
    test: (f) => f.cardSessions >= 10,
  },
  {
    id: 'topic-master',
    title: 'Temat opanowany',
    how: 'Opanuj wszystkie zadania jednego tematu.',
    test: (f) => f.topicsMastered >= 1,
  },
  { id: 'level-5', title: 'Piąty stopień', how: 'Wejdź na stopień 5.', test: (f) => f.level >= 5 },
]

export const earnedBadges = (f: BadgeFacts) => BADGES.filter((b) => b.test(f)).map((b) => b.id)
