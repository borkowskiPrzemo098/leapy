import type { CompiledTask } from '@/content/schema'
import { grade, type Grade, type Response } from './grade'
import { permutation, rng } from './random'

// A practice session as a pure, serialisable state machine:
//   start → (answer → [next]) * → finished
// The UI renders `current()`; storage records each answer as an attempt.

export type SessionMode = 'topic' | 'quick' | 'review' | 'mistakes' | 'mock' | 'cards'

export interface SessionItem {
  taskId: string
  /** Display order of options (original indices). match: order of the right column. */
  order: number[]
  response?: Response
  grade?: Grade
  hintUsed?: boolean
  /** ms spent before answering */
  ms?: number
}

export interface SessionState {
  id: string
  mode: SessionMode
  /** e.g. "matura/matematyka-p/logarytmy" for topic sessions */
  scope: string
  seed: number
  startedAt: number
  finishedAt?: number
  index: number
  items: SessionItem[]
  /** When the current item was shown (for timing) */
  shownAt: number
}

export function displayOrder(task: CompiledTask, rand: () => number): number[] {
  switch (task.type) {
    case 'single':
    case 'multi':
      return permutation(task.options.length, rand)
    case 'ordering':
      return permutation(task.options.length, rand, task.answer)
    case 'match':
      return permutation(task.options.right.length, rand)
    default:
      return []
  }
}

export function startSession(opts: {
  id: string
  mode: SessionMode
  scope: string
  tasks: CompiledTask[]
  seed: number
  now: number
}): SessionState {
  const rand = rng(opts.seed)
  return {
    id: opts.id,
    mode: opts.mode,
    scope: opts.scope,
    seed: opts.seed,
    startedAt: opts.now,
    index: 0,
    shownAt: opts.now,
    items: opts.tasks.map((t) => ({ taskId: t.id, order: displayOrder(t, rand) })),
  }
}

export function currentItem(s: SessionState): SessionItem | undefined {
  return s.items[s.index]
}

export function isFinished(s: SessionState) {
  return s.finishedAt !== undefined
}

export function answer(s: SessionState, task: CompiledTask, response: Response, now: number) {
  const item = s.items[s.index]
  if (!item || item.taskId !== task.id) throw new Error('to zadanie nie jest teraz wyświetlane')
  if (item.grade) return { state: s, grade: item.grade }
  const g = grade(task, response)
  const items = [...s.items]
  items[s.index] = { ...item, response, grade: g, ms: Math.max(0, now - s.shownAt) }
  return { state: { ...s, items }, grade: g }
}

export function markHintUsed(s: SessionState): SessionState {
  const items = [...s.items]
  const item = items[s.index]
  if (item) items[s.index] = { ...item, hintUsed: true }
  return { ...s, items }
}

export function next(s: SessionState, now: number): SessionState {
  if (s.index + 1 >= s.items.length) return { ...s, finishedAt: now }
  return { ...s, index: s.index + 1, shownAt: now }
}

export interface SessionSummary {
  total: number
  answered: number
  correct: number
  /** Sum of partial scores (0..total) */
  score: number
  accuracy: number
  ms: number
  wrongTaskIds: string[]
  /** Mock exams only: points scored and available */
  points?: number | undefined
  maxPoints?: number | undefined
}

export function summarize(s: SessionState): SessionSummary {
  const answered = s.items.filter((i) => i.grade)
  const correct = answered.filter((i) => i.grade?.correct).length
  return {
    total: s.items.length,
    answered: answered.length,
    correct,
    score: answered.reduce((n, i) => n + (i.grade?.score ?? 0), 0),
    accuracy: answered.length ? correct / answered.length : 0,
    ms: (s.finishedAt ?? s.shownAt) - s.startedAt,
    wrongTaskIds: answered.filter((i) => !i.grade?.correct).map((i) => i.taskId),
  }
}
