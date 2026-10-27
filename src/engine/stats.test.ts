import {
  activityByDay,
  calendarWeeks,
  currentStreak,
  dailySeries,
  dayKey,
  heatLevel,
  longestStreak,
  mistakeIds,
  topicMastery,
  totals,
  type AttemptLike,
} from './stats'

const at = (d: number, h = 12) => new Date(2026, 9, d, h).getTime() // October 2026
const a = (over: Partial<AttemptLike>): AttemptLike => ({
  taskId: 'm.p.log.001',
  exam: 'm',
  subject: 'p',
  topic: 'log',
  ts: at(27),
  correct: true,
  ms: 10_000,
  ...over,
})

describe('days and streaks', () => {
  it('uses local calendar days', () => {
    expect(dayKey(at(27, 23))).toBe('2026-10-27')
    expect(dayKey(at(28, 0))).toBe('2026-10-28')
  })

  it('current streak survives until the day ends', () => {
    const days = new Set(['2026-10-24', '2026-10-25', '2026-10-26'])
    expect(currentStreak(days, at(26))).toBe(3)
    // 27th, nothing yet today: still 3
    expect(currentStreak(days, at(27))).toBe(3)
    // 28th: yesterday missed, streak broken
    expect(currentStreak(days, at(28))).toBe(0)
  })

  it('streak crosses the DST change (25 October 2026 in Poland)', () => {
    const days = new Set(['2026-10-24', '2026-10-25', '2026-10-26'])
    expect(currentStreak(days, at(26, 8))).toBe(3)
  })

  it('longest streak', () => {
    expect(longestStreak(new Set())).toBe(0)
    expect(
      longestStreak(
        new Set(['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06']),
      ),
    ).toBe(3)
  })
})

describe('activity', () => {
  it('groups attempts and flashcard sessions per day', () => {
    const act = activityByDay(
      [a({ ts: at(26) }), a({ ts: at(27), correct: false }), a({ ts: at(27, 18) })],
      [
        { mode: 'cards', finishedAt: at(27), summary: { answered: 8, ms: 60_000 } },
        { mode: 'topic', finishedAt: at(27), summary: { answered: 10, ms: 1 } },
      ],
    )
    expect(act.get('2026-10-27')).toEqual({ items: 10, answered: 2, correct: 1, ms: 80_000 })
    expect(act.get('2026-10-26')?.items).toBe(1)
    expect(totals(act)).toMatchObject({ answered: 3, correct: 2, activeDays: 2 })
  })

  it('daily series is zero-filled and ends today', () => {
    const s = dailySeries(activityByDay([a({ ts: at(25) })]), 7, at(27))
    expect(s).toHaveLength(7)
    expect(s.at(-1)?.key).toBe('2026-10-27')
    expect(s.find((p) => p.key === '2026-10-25')?.answered).toBe(1)
    expect(s.reduce((n, p) => n + p.answered, 0)).toBe(1)
  })

  it('heat levels use fixed thresholds', () => {
    expect([0, 1, 4, 5, 9, 10, 19, 20, 99].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4])
  })
})

describe('calendar', () => {
  it('has Monday-first weeks with the current week last', () => {
    const weeks = calendarWeeks(4, at(28)) // Wednesday
    expect(weeks).toHaveLength(4)
    const last = weeks.at(-1) ?? []
    expect(last[0]?.key).toBe('2026-10-26')
    expect(new Date(last[0]?.ts ?? 0).getDay()).toBe(1)
    expect(last[2]?.key).toBe('2026-10-28')
    expect(last[2]?.future).toBe(false)
    expect(last[3]?.future).toBe(true)
    expect(weeks[0]?.[0]?.key).toBe('2026-10-05')
  })
})

describe('mastery and mistakes', () => {
  const history = [
    a({ taskId: 'x1', ts: 1, correct: false }),
    a({ taskId: 'x1', ts: 2, correct: true }),
    a({ taskId: 'x2', ts: 3, correct: false }),
    a({ taskId: 'x3', ts: 4, correct: true }),
    a({ taskId: 'x3', ts: 5, correct: false }),
    a({ taskId: 'y1', topic: 'proc', ts: 6, correct: true }),
  ]

  it('mastery counts distinct tasks whose last answer was right', () => {
    const m = topicMastery(history)
    expect(m.get('m/p/log')).toMatchObject({ attempts: 5, correct: 2, seen: 3, mastered: 1 })
    expect(m.get('m/p/proc')).toMatchObject({ seen: 1, mastered: 1 })
  })

  it('mistakes are tasks whose last answer was wrong, newest first', () => {
    expect(mistakeIds(history)).toEqual(['x3', 'x2'])
  })
})
