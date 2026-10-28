import {
  BADGES,
  earnedBadges,
  goalProgress,
  levelOf,
  streakWithFreezes,
  totalXp,
  weekStart,
  XP,
  type BadgeFacts,
} from './gamify'
import { dayKey } from './stats'

const at = (m: number, d: number, h = 12) => new Date(2026, m - 1, d, h).getTime()
const days = (from: number, to: number, month = 10) => {
  const out: string[] = []
  for (let d = from; d <= to; d++) out.push(dayKey(at(month, d)))
  return out
}

describe('XP and levels', () => {
  it('counts effort: right, right with hint, wrong, cards and finished sessions', () => {
    const a = { taskId: 't', exam: 'e', subject: 's', topic: 'x', ts: 1, ms: 1 }
    const xp = totalXp(
      [
        { ...a, correct: true },
        { ...a, correct: true, hintUsed: true },
        { ...a, correct: false },
      ],
      [
        { mode: 'topic', finishedAt: 1, summary: { answered: 3, ms: 1 } },
        { mode: 'cards', finishedAt: 1, summary: { answered: 4, ms: 1 } },
        { mode: 'mock', finishedAt: 1, summary: { answered: 0, ms: 1 } },
      ],
    )
    expect(xp).toBe(10 + 6 + 2 + XP.session + (4 * XP.card + XP.session) + XP.mock)
  })

  it('levels need 100, 150, 200 … XP', () => {
    expect(levelOf(0)).toEqual({ level: 1, into: 0, need: 100 })
    expect(levelOf(99).level).toBe(1)
    expect(levelOf(100)).toEqual({ level: 2, into: 0, need: 150 })
    expect(levelOf(260)).toEqual({ level: 3, into: 10, need: 200 })
  })
})

describe('streak with freezes', () => {
  it('counts consecutive days and does not break before the day is over', () => {
    const s = streakWithFreezes(new Set(days(20, 26)), at(10, 27))
    expect(s).toMatchObject({ current: 7, longest: 7, today: false })
  })

  it('earns a freeze every 7 days and spends it on one missed day', () => {
    // 1–7 October, skip the 8th, 9–10 studied
    const s = streakWithFreezes(new Set([...days(1, 7), ...days(9, 10)]), at(10, 10))
    expect(s).toMatchObject({ current: 9, freezes: 0, today: true })
    expect(s.frozen).toEqual(['2026-10-08'])
  })

  it('without a freeze a missed day restarts the streak', () => {
    const s = streakWithFreezes(new Set([...days(1, 3), ...days(5, 6)]), at(10, 6))
    expect(s).toMatchObject({ current: 2, longest: 3, freezes: 0 })
  })

  it('a freeze also protects the streak until today', () => {
    // 7-day streak ended on the 7th; the 8th missed, today is the 9th
    expect(streakWithFreezes(new Set(days(1, 7)), at(10, 9)).current).toBe(7)
    // two missed days but only one freeze
    expect(streakWithFreezes(new Set(days(1, 7)), at(10, 10)).current).toBe(0)
  })

  it('keeps at most two freezes', () => {
    expect(streakWithFreezes(new Set(days(1, 28)), at(10, 28)).freezes).toBe(2)
  })
})

describe('goals', () => {
  it('weeks start on Monday', () => {
    expect(new Date(weekStart(at(10, 28))).getDay()).toBe(1) // Wednesday → Monday 26th
    expect(dayKey(weekStart(at(11, 1)))).toBe('2026-10-26') // Sunday stays in the same week
  })

  it('tracks today and the days of this week with the goal met', () => {
    const items = new Map([
      ['2026-10-26', { items: 12 }],
      ['2026-10-27', { items: 4 }],
      ['2026-10-28', { items: 10 }],
    ])
    const g = goalProgress(items, { daily: 10, weekly: 3 }, at(10, 28))
    expect(g).toMatchObject({ todayItems: 10, todayDone: true, weekDays: 2, weekDone: false })
    expect(g.week.map((d) => d.met)).toEqual([true, false, true, false, false, false, false])
    expect(g.week[3]?.future).toBe(true)
  })
})

describe('badges', () => {
  const none: BadgeFacts = {
    answered: 0,
    correct: 0,
    longestStreak: 0,
    mocks: 0,
    bestMock: 0,
    perfectSessions: 0,
    cardSessions: 0,
    topicsMastered: 0,
    level: 1,
  }
  it('have unique ids and unlock from facts', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length)
    expect(earnedBadges(none)).toEqual([])
    expect(earnedBadges({ ...none, answered: 120, longestStreak: 7 })).toEqual([
      'first-step',
      'tasks-100',
      'streak-3',
      'streak-7',
    ])
  })
})

describe('Błyskawica XP', () => {
  it('gives less per answer and nothing for a wrong one', async () => {
    const { attemptXp, XP } = await import('./gamify')
    const base = { taskId: 't', exam: 'e', subject: 's', topic: 'x', ts: 0, ms: 0 }
    expect(attemptXp({ ...base, correct: true, mode: 'blitz' })).toBe(XP.blitzCorrect)
    expect(attemptXp({ ...base, correct: false, mode: 'blitz' })).toBe(0)
    expect(attemptXp({ ...base, correct: true, mode: 'quick' })).toBe(XP.correct)
  })
})
