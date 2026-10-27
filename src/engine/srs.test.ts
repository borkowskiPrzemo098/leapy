import {
  cardQuality,
  DAY,
  endOfDay,
  isDue,
  MAX_INTERVAL,
  MIN_EASE,
  qualityFromGrade,
  sm2,
} from './srs'
import type { Quality, SrsCard } from './srs'

const NOW = new Date(2026, 9, 27, 10, 0).getTime()

function run(qs: Quality[], start = sm2.initial('t', NOW)) {
  let c: SrsCard = start
  let now = NOW
  const steps: SrsCard[] = []
  for (const q of qs) {
    c = sm2.review(c, q, now)
    steps.push(c)
    now = c.due
  }
  return steps
}

describe('SM-2 scheduler', () => {
  it('starts due now with the standard ease', () => {
    const c = sm2.initial('t', NOW)
    expect(c).toEqual({ taskId: 't', due: NOW, interval: 0, ease: 2.5, reps: 0, lapses: 0 })
    expect(isDue(c, NOW)).toBe(true)
  })

  it('follows the 1 → 6 → interval × ease sequence on perfect answers', () => {
    const steps = run([5, 5, 5, 5])
    expect(steps.map((s) => s.interval)).toEqual([1, 6, 17, 49])
    // ease grows by 0.1 per perfect answer
    expect(steps.map((s) => +s.ease.toFixed(2))).toEqual([2.6, 2.7, 2.8, 2.9])
    expect(steps[0]?.due).toBe(NOW + DAY)
    expect(steps[1]?.due).toBe(NOW + 7 * DAY)
  })

  it('quality 4 keeps ease, quality 3 lowers it', () => {
    const [four] = run([4])
    const [three] = run([3])
    expect(four?.ease).toBeCloseTo(2.5)
    expect(three?.ease).toBeCloseTo(2.36)
    expect(three?.reps).toBe(1)
  })

  it('a lapse resets reps, counts the lapse and brings the item back tomorrow', () => {
    const [, , lapse] = run([5, 5, 1])
    expect(lapse).toMatchObject({ reps: 0, interval: 1, lapses: 1 })
    expect(lapse?.ease).toBeCloseTo(2.7 - 0.54)
    const after = run([5], lapse)
    expect(after[0]?.interval).toBe(1)
  })

  it('never lets ease drop below 1.3', () => {
    const steps = run([0, 0, 0, 0, 0, 0, 0, 0])
    expect(Math.min(...steps.map((s) => s.ease))).toBe(MIN_EASE)
  })

  it('caps intervals at a year', () => {
    const steps = run(Array<Quality>(12).fill(5))
    expect(Math.max(...steps.map((s) => s.interval))).toBe(MAX_INTERVAL)
  })

  it('is pure: the input card is not changed', () => {
    const c = sm2.initial('t', NOW)
    const copy = { ...c }
    sm2.review(c, 2, NOW)
    expect(c).toEqual(copy)
  })
})

describe('quality mapping', () => {
  it('maps grades and hints to SM-2 quality', () => {
    expect(qualityFromGrade({ correct: true, score: 1 }, false)).toBe(5)
    expect(qualityFromGrade({ correct: true, score: 1 }, true)).toBe(3)
    expect(qualityFromGrade({ correct: false, score: 0.5 }, false)).toBe(2)
    expect(qualityFromGrade({ correct: false, score: 0 }, false)).toBe(1)
  })

  it('flashcard buttons: only "Nie pamiętam" is a lapse', () => {
    expect(cardQuality.forgot).toBeLessThan(3)
    expect(cardQuality.hard).toBeGreaterThanOrEqual(3)
    expect(cardQuality.know).toBe(5)
  })
})

describe('due today', () => {
  it('counts anything due before local midnight', () => {
    const c = { ...sm2.initial('t', NOW), due: endOfDay(NOW) }
    expect(isDue(c, NOW)).toBe(true)
    expect(isDue({ ...c, due: endOfDay(NOW) + 1 }, NOW)).toBe(false)
  })
})
