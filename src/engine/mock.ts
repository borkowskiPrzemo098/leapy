import type { CompiledTask } from '@/content/schema'
import { emptyResponse, grade, type Grade, type Response } from './grade'
import { rng, shuffle } from './random'
import { displayOrder } from './session'

// Mock exam: a timed sheet. Unlike practice there is no feedback until the end, answers can be
// changed and the learner moves freely between tasks. Serialisable, so it survives a reload.

export interface MockItem {
  taskId: string
  order: number[]
  response?: Response
  flagged?: boolean
}

export interface MockState {
  id: string
  exam: string
  subject: string
  seed: number
  startedAt: number
  /** epoch ms when time is up */
  deadline: number
  index: number
  items: MockItem[]
  finishedAt?: number
}

/** Default sheet when the subject sets no `mock`: up to 20 tasks, about 2.5 minutes each. */
export function mockConfig(cfg: { tasks: number; minutes: number } | undefined, pool: number) {
  const tasks = Math.min(cfg?.tasks ?? 20, pool)
  const minutes = cfg
    ? Math.max(5, Math.round((cfg.minutes * tasks) / cfg.tasks))
    : Math.max(5, Math.ceil((tasks * 2.5) / 5) * 5)
  return { tasks, minutes }
}

/**
 * Picks `n` tasks spread evenly over topics (round robin, random inside a topic), then orders
 * the sheet like a real one: topic by topic in syllabus order, easier first inside a topic.
 */
export function pickMockTasks(
  pool: CompiledTask[],
  n: number,
  topicOrder: string[],
  rand: () => number,
): CompiledTask[] {
  const rank = new Map(topicOrder.map((t, i) => [t, i]))
  const byTopic = new Map<string, CompiledTask[]>()
  for (const t of shuffle(pool, rand)) {
    const list = byTopic.get(t.topic) ?? []
    list.push(t)
    byTopic.set(t.topic, list)
  }
  const queues = [...byTopic.values()]
  const chosen: CompiledTask[] = []
  while (chosen.length < n && queues.some((q) => q.length)) {
    for (const q of queues) {
      const t = q.shift()
      if (t && chosen.length < n) chosen.push(t)
    }
  }
  return chosen.sort(
    (a, b) => (rank.get(a.topic) ?? 99) - (rank.get(b.topic) ?? 99) || a.difficulty - b.difficulty,
  )
}

export function startMock(opts: {
  id: string
  exam: string
  subject: string
  tasks: CompiledTask[]
  minutes: number
  seed: number
  now: number
}): MockState {
  const rand = rng(opts.seed)
  return {
    id: opts.id,
    exam: opts.exam,
    subject: opts.subject,
    seed: opts.seed,
    startedAt: opts.now,
    deadline: opts.now + opts.minutes * 60_000,
    index: 0,
    items: opts.tasks.map((t) => ({ taskId: t.id, order: displayOrder(t, rand) })),
  }
}

export function setResponse(s: MockState, index: number, response: Response | null): MockState {
  const items = [...s.items]
  const item = items[index]
  if (!item || s.finishedAt !== undefined) return s
  const { response: _old, ...rest } = item
  items[index] = response ? { ...rest, response } : rest
  return { ...s, items }
}

export function toggleFlag(s: MockState, index: number): MockState {
  const items = [...s.items]
  const item = items[index]
  if (item) items[index] = { ...item, flagged: !item.flagged }
  return { ...s, items }
}

export function goTo(s: MockState, index: number): MockState {
  return { ...s, index: Math.min(Math.max(0, index), s.items.length - 1) }
}

export const answeredCount = (s: MockState) => s.items.filter((i) => i.response).length
export const remainingMs = (s: MockState, now: number) => Math.max(0, s.deadline - now)
export const isTimeUp = (s: MockState, now: number) => now >= s.deadline

/**
 * Points for one task. 1-point tasks are all-or-nothing, like closed tasks on the exam;
 * multi-point tasks get partial credit, rounded down to whole points.
 */
export function taskPoints(task: CompiledTask, g: Grade) {
  if (task.points === 1) return g.correct ? 1 : 0
  return g.correct ? task.points : Math.floor(task.points * g.score)
}

export interface MockItemResult {
  taskId: string
  topic: string
  answered: boolean
  response: Response
  grade: Grade
  points: number
  maxPoints: number
}

export interface MockResult {
  items: MockItemResult[]
  points: number
  maxPoints: number
  answered: number
  correct: number
  ms: number
  byTopic: { topic: string; points: number; maxPoints: number }[]
}

export function finishMock(s: MockState, tasks: Map<string, CompiledTask>, now: number) {
  const finishedAt = Math.min(now, s.deadline)
  const items: MockItemResult[] = []
  for (const it of s.items) {
    const task = tasks.get(it.taskId)
    if (!task) continue
    const response = it.response ?? emptyResponse(task)
    const g = grade(task, response)
    items.push({
      taskId: task.id,
      topic: task.topic,
      answered: !!it.response,
      response,
      grade: g,
      points: taskPoints(task, g),
      maxPoints: task.points,
    })
  }
  const topics = new Map<string, { topic: string; points: number; maxPoints: number }>()
  for (const r of items) {
    const t = topics.get(r.topic) ?? { topic: r.topic, points: 0, maxPoints: 0 }
    t.points += r.points
    t.maxPoints += r.maxPoints
    topics.set(r.topic, t)
  }
  const result: MockResult = {
    items,
    points: items.reduce((n, r) => n + r.points, 0),
    maxPoints: items.reduce((n, r) => n + r.maxPoints, 0),
    answered: items.filter((r) => r.answered).length,
    correct: items.filter((r) => r.grade.correct).length,
    ms: finishedAt - s.startedAt,
    byTopic: [...topics.values()],
  }
  return { state: { ...s, finishedAt }, result }
}
