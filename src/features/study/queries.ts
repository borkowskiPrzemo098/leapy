import { loadPack } from '@/content/data'
import type { CompiledCard, CompiledTask } from '@/content/schema'
import { isCardId, isDue, scheduler, type Quality } from '@/engine/srs'
import { mistakeIds } from '@/engine/stats'
import { progress } from '@/storage'

// Reads that combine storage with content: what is due, what went wrong, and the tasks behind
// those ids. Packs are cached by loadPack, so calling these on every screen is cheap.

/** Applies one review to an item's spaced-repetition state. */
export async function recordReview(id: string, q: Quality, now = Date.now()) {
  const store = progress()
  const card = (await store.getSrs(id)) ?? scheduler.initial(id, now)
  await store.putSrs(scheduler.review(card, q, now))
}

/** "exam.subject.topic.001" → ["exam", "subject"] */
const packOf = (id: string) => id.split('.', 2) as [string, string]

/** Loads the tasks (or cards) behind ids, skipping ids that no longer exist in content. */
async function resolve<T extends { id: string }>(
  ids: string[],
  pick: (p: Awaited<ReturnType<typeof loadPack>>) => T[],
): Promise<T[]> {
  const keys = [...new Set(ids.map((id) => packOf(id).join('/')))]
  const packs = await Promise.all(
    keys.map((k) => {
      const [exam = '', subject = ''] = k.split('/')
      return loadPack(exam, subject).catch(() => null)
    }),
  )
  const byId = new Map<string, T>()
  for (const p of packs) if (p) for (const x of pick(p)) byId.set(x.id, x)
  return ids.flatMap((id) => byId.get(id) ?? [])
}

export const tasksByIds = (ids: string[]) => resolve<CompiledTask>(ids, (p) => p.tasks)
export const cardsByIds = (ids: string[]) => resolve<CompiledCard>(ids, (p) => p.cards)

/** Task ids due for review today, most overdue first. */
export async function dueTaskIds(now = Date.now()) {
  return (await progress().srs())
    .filter((r) => !isCardId(r.taskId) && isDue(r, now))
    .sort((a, b) => a.due - b.due)
    .map((r) => r.taskId)
}

export async function mistakeTaskIds() {
  return mistakeIds(await progress().attempts())
}

export interface PracticeCounts {
  due: number
  mistakes: number
}

/** Counts for the practice screen. Ids whose task was removed from content are not counted. */
export async function practiceCounts(now = Date.now()): Promise<PracticeCounts> {
  const [due, mistakes] = await Promise.all([dueTaskIds(now), mistakeTaskIds()])
  const [dueTasks, mistakeTasks] = await Promise.all([tasksByIds(due), tasksByIds(mistakes)])
  return { due: dueTasks.length, mistakes: mistakeTasks.length }
}
