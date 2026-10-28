import type { CompiledTask } from '@/content/schema'
import { correctAnswerHtml, grade, normalizeText, parseNumber } from './grade'
import { permutation, rng, shuffle } from './random'
import { answer, next, startSession, stopNow, summarize } from './session'

const common = {
  exam: 'matura',
  subject: 'matematyka-p',
  topic: 'potegi',
  difficulty: 1,
  prompt: '<p>?</p>',
  explanation: '<p>.</p>',
  tags: [],
  source: 'original' as const,
  reviewed: false,
  updatedAt: '2026-10-27',
  points: 1,
}
const T = {
  single: { ...common, id: 'a.b.c.001', type: 'single', options: ['1', '2', '3'], answer: 1 },
  multi: {
    ...common,
    id: 'a.b.c.002',
    type: 'multi',
    options: ['a', 'b', 'c', 'd'],
    answer: [0, 2],
  },
  truefalse: {
    ...common,
    id: 'a.b.c.003',
    type: 'truefalse',
    options: ['p', 'q'],
    answer: [true, false],
  },
  numeric: { ...common, id: 'a.b.c.004', type: 'numeric', answer: { value: '3/4' } },
  ordering: {
    ...common,
    id: 'a.b.c.005',
    type: 'ordering',
    options: ['x', 'y', 'z'],
    answer: [2, 0, 1],
  },
  match: {
    ...common,
    id: 'a.b.c.006',
    type: 'match',
    options: { left: ['l0', 'l1'], right: ['r0', 'r1', 'r2'] },
    answer: [2, 0],
  },
  short: { ...common, id: 'a.b.c.007', type: 'short', answer: ['Mickiewicz', 'Adam Mickiewicz'] },
} satisfies Record<string, CompiledTask>

describe('parseNumber', () => {
  it.each([
    ['3/4', 0.75],
    [' -0,5 ', -0.5],
    ['1 200', 1200],
    ['−2', -2],
    ['12', 12],
  ])('%s', (s, v) => expect(parseNumber(s)).toBe(v))
  it.each(['', 'abc', '1/0', '2x'])('rejects %s', (s) => expect(parseNumber(s)).toBeNull())
})

describe('grade', () => {
  it('single', () => {
    expect(grade(T.single, { type: 'single', choice: 1 }).correct).toBe(true)
    expect(grade(T.single, { type: 'single', choice: 0 }).correct).toBe(false)
  })

  it('multi gives partial credit and needs an exact set to be correct', () => {
    expect(grade(T.multi, { type: 'multi', choices: [2, 0] })).toEqual({ correct: true, score: 1 })
    const g = grade(T.multi, { type: 'multi', choices: [0] })
    expect(g.correct).toBe(false)
    expect(g.score).toBe(0.75)
  })

  it('truefalse treats unanswered statements as wrong', () => {
    expect(grade(T.truefalse, { type: 'truefalse', values: [true, false] }).correct).toBe(true)
    expect(grade(T.truefalse, { type: 'truefalse', values: [true, null] }).score).toBe(0.5)
  })

  it('numeric accepts equivalent forms', () => {
    for (const text of ['0,75', '0.75', '3/4', '6/8'])
      expect(grade(T.numeric, { type: 'numeric', text }).correct).toBe(true)
    expect(grade(T.numeric, { type: 'numeric', text: '0,7' }).correct).toBe(false)
  })

  it('ordering', () => {
    expect(grade(T.ordering, { type: 'ordering', order: [2, 0, 1] }).correct).toBe(true)
    expect(grade(T.ordering, { type: 'ordering', order: [2, 1, 0] }).score).toBeCloseTo(1 / 3)
  })

  it('match', () => {
    expect(grade(T.match, { type: 'match', pairs: [2, 0] }).correct).toBe(true)
    expect(grade(T.match, { type: 'match', pairs: [2, null] }).score).toBe(0.5)
  })

  it('short normalises case, spaces and trailing punctuation', () => {
    for (const text of ['mickiewicz', '  Adam   Mickiewicz. ', 'MICKIEWICZ'])
      expect(grade(T.short, { type: 'short', text }).correct).toBe(true)
    expect(grade(T.short, { type: 'short', text: 'Słowacki' }).correct).toBe(false)
  })

  it('refuses a response of the wrong type', () => {
    expect(() => grade(T.single, { type: 'short', text: '2' })).toThrow()
  })

  it('normalizeText keeps Polish letters', () => {
    expect(normalizeText('ŻÓŁW')).toBe('żółw')
  })

  it('describes the correct answer', () => {
    expect(correctAnswerHtml(T.ordering)).toBe('z → x → y')
    expect(correctAnswerHtml(T.numeric)).toBe('3/4')
  })
})

describe('random', () => {
  it('is deterministic per seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], rng(7))).toEqual(shuffle([1, 2, 3, 4, 5], rng(7)))
  })
  it('permutation avoids the given order', () => {
    for (let s = 0; s < 50; s++) expect(permutation(3, rng(s), [0, 1, 2])).not.toEqual([0, 1, 2])
  })
})

describe('session', () => {
  const tasks = [T.single, T.numeric, T.ordering]
  const start = () =>
    startSession({
      id: 's1',
      mode: 'topic',
      scope: 'matura/matematyka-p/potegi',
      tasks,
      seed: 42,
      now: 1000,
    })

  it('runs through tasks, records timing and summarises', () => {
    let s = start()
    expect(s.items[2]?.order).not.toEqual(T.ordering.answer)
    s = answer(s, T.single, { type: 'single', choice: 1 }, 4000).state
    expect(s.items[0]?.ms).toBe(3000)
    s = next(s, 4000)
    s = answer(s, T.numeric, { type: 'numeric', text: '1' }, 5000).state
    s = next(s, 5000)
    s = answer(s, T.ordering, { type: 'ordering', order: [2, 0, 1] }, 6000).state
    s = next(s, 6000)
    expect(s.finishedAt).toBe(6000)
    const sum = summarize(s)
    expect(sum).toMatchObject({ total: 3, answered: 3, correct: 2, ms: 5000 })
    expect(sum.wrongTaskIds).toEqual([T.numeric.id])
  })

  it('answering twice keeps the first grade', () => {
    let s = start()
    s = answer(s, T.single, { type: 'single', choice: 1 }, 2000).state
    const again = answer(s, T.single, { type: 'single', choice: 0 }, 3000)
    expect(again.grade.correct).toBe(true)
  })

  it('rejects answering a task that is not current', () => {
    expect(() => answer(start(), T.numeric, { type: 'numeric', text: '1' }, 2000)).toThrow()
  })
})

describe('stopNow (Błyskawica)', () => {
  it('keeps only answered items and finishes the session', () => {
    const one = T.single as CompiledTask
    const tasks = [one, { ...one, id: 'a.b.c.101' }, { ...one, id: 'a.b.c.102' }] as CompiledTask[]
    let s = startSession({ id: 's', mode: 'blitz', scope: 'blitz', tasks, seed: 1, now: 0 })
    s = answer(s, one, { type: 'single', choice: 1 }, 100).state
    s = next(s, 100)
    s = stopNow(s, 60_000)
    expect(s.items).toHaveLength(1)
    expect(s.finishedAt).toBe(60_000)
    expect(summarize(s)).toMatchObject({ total: 1, correct: 1 })
  })
})
