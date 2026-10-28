import { describe, expect, it } from 'vitest'
import { dailyStreak, dailyTaskId, hashString } from './daily'

const at = (d: string) => new Date(`${d}T12:00:00`).getTime()

describe('dailyTaskId', () => {
  const pool = ['a.1', 'a.2', 'a.3', 'b.1', 'b.2']

  it('is the same for the same day, whatever the pool order', () => {
    expect(dailyTaskId(pool, '2026-10-28')).toBe(dailyTaskId([...pool].reverse(), '2026-10-28'))
  })

  it('changes between days (over a week, more than one task appears)', () => {
    const week = Array.from({ length: 7 }, (_, i) => dailyTaskId(pool, `2026-11-0${i + 1}`))
    expect(new Set(week).size).toBeGreaterThan(1)
  })

  it('returns nothing for an empty pool', () => {
    expect(dailyTaskId([], '2026-10-28')).toBeUndefined()
  })

  it('hashes stably', () => {
    expect(hashString('leapy')).toBe(hashString('leapy'))
    expect(hashString('a')).not.toBe(hashString('b'))
  })
})

describe('dailyStreak', () => {
  it('counts days in a row up to today', () => {
    expect(dailyStreak(new Set(['2026-10-26', '2026-10-27', '2026-10-28']), at('2026-10-28'))).toBe(
      3,
    )
  })

  it('keeps yesterday’s streak while today is still open', () => {
    expect(dailyStreak(new Set(['2026-10-26', '2026-10-27']), at('2026-10-28'))).toBe(2)
  })

  it('breaks on a missed day', () => {
    expect(dailyStreak(new Set(['2026-10-25', '2026-10-27', '2026-10-28']), at('2026-10-28'))).toBe(
      2,
    )
    expect(dailyStreak(new Set(['2026-10-25']), at('2026-10-28'))).toBe(0)
  })
})
