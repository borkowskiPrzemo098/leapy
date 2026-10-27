import type { CompiledTask } from '@/content/schema'
import type { Attempt } from '@/storage'
import { shuffle } from '@/engine/random'

/**
 * Chooses up to `n` tasks for a session: never-seen first, then ones whose last attempt was
 * wrong, then the rest (least recently seen first). Order inside each group is random, and
 * the final list runs from easier to harder so a session warms up.
 */
export function pickTasks(
  pool: CompiledTask[],
  history: Attempt[],
  n: number,
  rand: () => number,
): CompiledTask[] {
  const last = new Map<string, Attempt>()
  for (const a of history) {
    const prev = last.get(a.taskId)
    if (!prev || a.ts > prev.ts) last.set(a.taskId, a)
  }
  const unseen: CompiledTask[] = []
  const wrong: CompiledTask[] = []
  const rest: CompiledTask[] = []
  for (const t of pool) {
    const a = last.get(t.id)
    if (!a) unseen.push(t)
    else if (!a.correct) wrong.push(t)
    else rest.push(t)
  }
  const restByAge = shuffle(rest, rand).sort(
    (x, y) => (last.get(x.id)?.ts ?? 0) - (last.get(y.id)?.ts ?? 0),
  )
  const chosen = [...shuffle(unseen, rand), ...shuffle(wrong, rand), ...restByAge].slice(0, n)
  return chosen.sort((a, b) => a.difficulty - b.difficulty)
}
