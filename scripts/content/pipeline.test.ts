import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Task } from '../../src/content/schema'
import { mdBlock, mdInline } from './markdown'
import { runPipeline } from './pipeline'
import { numberFromText, verifyTask } from './verify'

const base = {
  exam: 'matura',
  subject: 'matematyka-p',
  topic: 'potegi',
  difficulty: 1,
  explanation: 'Krok 1.',
  source: 'original',
  reviewed: false,
  updatedAt: '2026-10-27',
}
const task = (extra: Record<string, unknown>) =>
  Task.parse({ id: 'matura.matematyka-p.potegi.001', prompt: 'Oblicz.', ...base, ...extra })

describe('numberFromText', () => {
  it.each([
    ['$\\frac{3}{4}$', 0.75],
    ['0,75', 0.75],
    ['$2\\sqrt{2}$', 2 * Math.SQRT2],
    ['$\\sqrt[3]{27}$', 3],
    ['$-\\frac{1}{2}$', -0.5],
    ['$25\\%$', 25],
    ['$0{,}5$', 0.5],
  ])('%s → %d', (text, value) => {
    expect(numberFromText(text)).toBeCloseTo(value, 10)
  })

  it('returns null for prose', () => {
    expect(numberFromText('Obniżka o połowę')).toBeNull()
  })
})

describe('verifyTask', () => {
  it('accepts a correct numeric answer and rejects a wrong one', () => {
    expect(verifyTask(task({ type: 'numeric', answer: { value: 8 }, verify: '2^3' }))).toEqual([])
    expect(verifyTask(task({ type: 'numeric', answer: { value: 9 }, verify: '2^3' }))).toHaveLength(
      1,
    )
  })

  it('accepts fraction answers', () => {
    expect(verifyTask(task({ type: 'numeric', answer: { value: '3/4' }, verify: '0.75' }))).toEqual(
      [],
    )
  })

  it('flags a wrong correct-option and a distractor equal to the result', () => {
    const wrong = task({ type: 'single', options: ['$1$', '$2$'], answer: 0, verify: '2' })
    expect(verifyTask(wrong).join()).toMatch(/poprawna opcja/)
    const ambiguous = task({
      type: 'single',
      options: ['$2$', '$\\frac{4}{2}$'],
      answer: 0,
      verify: '2',
    })
    expect(verifyTask(ambiguous).join()).toMatch(/opcja 1 też/)
  })
})

describe('Task schema', () => {
  it('rejects answer indexes outside the options and bad permutations', () => {
    expect(() => task({ type: 'single', options: ['a', 'b'], answer: 2 })).toThrow()
    expect(() => task({ type: 'ordering', options: ['a', 'b', 'c'], answer: [0, 0, 1] })).toThrow()
    expect(() => task({ type: 'truefalse', options: ['a', 'b'], answer: [true] })).toThrow()
  })

  it('rejects an id that does not match exam.subject.topic', () => {
    expect(() =>
      Task.parse({
        ...base,
        id: 'matura.matematyka-p.inny.001',
        prompt: 'x',
        type: 'short',
        answer: ['1'],
      }),
    ).toThrow(/id musi/)
  })
})

describe('markdown', () => {
  it('renders KaTeX and keeps escaped dollars', () => {
    expect(mdInline('$x^2$')).toContain('katex')
    expect(mdBlock('Cena \\$5')).toContain('$5')
  })

  it('throws on invalid LaTeX', () => {
    expect(() => mdInline('$\\frac{1}$')).toThrow(/KaTeX/)
  })
})

describe('runPipeline', () => {
  let root: string
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'leapy-content-'))
    const dir = join(root, 'content/matura/matematyka-p')
    mkdirSync(join(root, 'content/exams'), { recursive: true })
    mkdirSync(join(dir, 'tasks'), { recursive: true })
    mkdirSync(join(dir, 'lessons'), { recursive: true })
    writeFileSync(
      join(root, 'content/exams/matura.json'),
      JSON.stringify({
        id: 'matura',
        name: 'Matura',
        short: 'M',
        audience: 'Szkoła',
        order: 1,
        phase: 1,
        subjects: ['matematyka-p'],
      }),
    )
    writeFileSync(
      join(dir, 'subject.json'),
      JSON.stringify({
        id: 'matematyka-p',
        exam: 'matura',
        name: 'Matematyka',
        sections: [{ id: 'liczby', name: 'Liczby', topics: [{ id: 'potegi', name: 'Potęgi' }] }],
      }),
    )
  })
  afterEach(() => rmSync(root, { recursive: true, force: true }))

  const writeTasks = (tasks: unknown[]) =>
    writeFileSync(
      join(root, 'content/matura/matematyka-p/tasks/potegi.json'),
      JSON.stringify(tasks),
    )
  const t1 = {
    ...base,
    id: 'matura.matematyka-p.potegi.001',
    type: 'numeric',
    prompt: 'Ile to $2^3$?',
    answer: { value: 8 },
    verify: '2^3',
  }

  it('requires a lesson for every topic with tasks', () => {
    writeTasks([t1])
    const r = runPipeline(root)
    expect(r.issues.some((i) => i.level === 'error' && /nie ma lekcji/.test(i.message))).toBe(true)
  })

  it('reports duplicate ids, identical prompts and failed verification', () => {
    writeTasks([
      t1,
      { ...t1 },
      { ...t1, id: 'matura.matematyka-p.potegi.002', answer: { value: 9 } },
    ])
    const msgs = runPipeline(root)
      .issues.map((i) => i.message)
      .join('\n')
    expect(msgs).toMatch(/zduplikowane id/)
    expect(msgs).toMatch(/identyczna treść/)
    expect(msgs).toMatch(/verify: odpowiedź 9/)
  })

  it('blocks removing a task id that is in the lock file', () => {
    writeTasks([])
    const lock = join(root, 'ids.lock.json')
    writeFileSync(lock, JSON.stringify(['matura.matematyka-p.potegi.001']))
    const msgs = runPipeline(root, { lockFile: lock })
      .issues.map((i) => i.message)
      .join()
    expect(msgs).toMatch(/zniknęło/)
  })
})
