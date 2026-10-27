import type { CompiledTask } from '@/content/schema'
import {
  answeredCount,
  finishMock,
  goTo,
  isTimeUp,
  mockConfig,
  pickMockTasks,
  remainingMs,
  setResponse,
  startMock,
  taskPoints,
  toggleFlag,
} from './mock'
import { rng } from './random'

const task = (id: number, topic: string, over: Partial<CompiledTask> = {}) =>
  ({
    id: `m.p.${topic}.${String(id).padStart(3, '0')}`,
    exam: 'm',
    subject: 'p',
    topic,
    difficulty: (id % 5) + 1,
    prompt: '<p>?</p>',
    explanation: '<p>.</p>',
    tags: [],
    source: 'original',
    reviewed: false,
    updatedAt: '2026-10-27',
    points: 1,
    type: 'single',
    options: ['a', 'b', 'c'],
    answer: 0,
    ...over,
  }) as CompiledTask

const pool = [
  ...Array.from({ length: 10 }, (_, i) => task(i + 1, 'a')),
  ...Array.from({ length: 3 }, (_, i) => task(i + 1, 'b')),
  ...Array.from({ length: 2 }, (_, i) => task(i + 1, 'c')),
]
const NOW = 1_000_000

describe('mock exam sheet', () => {
  it('spreads tasks over topics and orders them by syllabus, then difficulty', () => {
    const sheet = pickMockTasks(pool, 9, ['c', 'a', 'b'], rng(7))
    expect(sheet).toHaveLength(9)
    const per = (t: string) => sheet.filter((x) => x.topic === t).length
    expect([per('a'), per('b'), per('c')]).toEqual([4, 3, 2])
    expect(sheet.slice(0, 2).every((t) => t.topic === 'c')).toBe(true)
    const a = sheet.filter((t) => t.topic === 'a').map((t) => t.difficulty)
    expect(a).toEqual([...a].sort((x, y) => x - y))
  })

  it('never repeats a task and stops at the pool size', () => {
    const sheet = pickMockTasks(pool, 50, ['a', 'b', 'c'], rng(1))
    expect(sheet).toHaveLength(pool.length)
    expect(new Set(sheet.map((t) => t.id)).size).toBe(pool.length)
  })

  it('config scales minutes when the pool is smaller than the sheet', () => {
    expect(mockConfig({ tasks: 20, minutes: 60 }, 40)).toEqual({ tasks: 20, minutes: 60 })
    expect(mockConfig({ tasks: 20, minutes: 60 }, 10)).toEqual({ tasks: 10, minutes: 30 })
    expect(mockConfig(undefined, 12)).toEqual({ tasks: 12, minutes: 30 })
  })
})

describe('mock exam run', () => {
  const tasks = [
    task(1, 'a'),
    task(2, 'a', { points: 2, type: 'truefalse', options: ['p', 'q'], answer: [true, true] }),
    task(3, 'b'),
  ]
  const start = () =>
    startMock({ id: 'x', exam: 'm', subject: 'p', tasks, minutes: 10, seed: 3, now: NOW })

  it('answers can be changed, cleared and flagged', () => {
    let s = start()
    s = setResponse(s, 0, { type: 'single', choice: 1 })
    s = setResponse(s, 0, { type: 'single', choice: 0 })
    expect(s.items[0]?.response).toEqual({ type: 'single', choice: 0 })
    s = setResponse(s, 2, { type: 'single', choice: 0 })
    expect(answeredCount(s)).toBe(2)
    s = setResponse(s, 2, null)
    expect(answeredCount(s)).toBe(1)
    s = toggleFlag(s, 1)
    expect(s.items[1]?.flagged).toBe(true)
    expect(goTo(s, 99).index).toBe(2)
  })

  it('tracks the clock', () => {
    const s = start()
    expect(remainingMs(s, NOW + 60_000)).toBe(9 * 60_000)
    expect(isTimeUp(s, NOW + 10 * 60_000)).toBe(true)
    expect(remainingMs(s, NOW + 11 * 60_000)).toBe(0)
  })

  it('scores points, partial credit on multi-point tasks, blanks as zero', () => {
    let s = start()
    s = setResponse(s, 0, { type: 'single', choice: 0 })
    s = setResponse(s, 1, { type: 'truefalse', values: [true, false] })
    const { state, result } = finishMock(s, new Map(tasks.map((t) => [t.id, t])), NOW + 5 * 60_000)
    expect(state.finishedAt).toBe(NOW + 5 * 60_000)
    expect(result).toMatchObject({ points: 2, maxPoints: 4, answered: 2, correct: 1, ms: 300_000 })
    expect(result.items[2]).toMatchObject({ answered: false, points: 0 })
    expect(result.byTopic).toEqual([
      { topic: 'a', points: 2, maxPoints: 3 },
      { topic: 'b', points: 0, maxPoints: 1 },
    ])
    // answering after the end changes nothing
    expect(setResponse(state, 2, { type: 'single', choice: 0 })).toBe(state)
  })

  it('time used never exceeds the limit', () => {
    const { result } = finishMock(start(), new Map(), NOW + 60 * 60_000)
    expect(result.ms).toBe(10 * 60_000)
  })

  it('1-point tasks are all or nothing', () => {
    expect(taskPoints(task(1, 'a'), { correct: false, score: 0.9 })).toBe(0)
    expect(taskPoints(task(1, 'a', { points: 3 }), { correct: false, score: 0.7 })).toBe(2)
  })
})
