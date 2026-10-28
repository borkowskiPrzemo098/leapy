/**
 * Polish plural after a number: 1 → one, 2–4 (but not 12–14) → few, everything else → many.
 * plural(162, 'zadanie', 'zadania', 'zadań') → 'zadania'
 */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  const d = n % 10
  const h = n % 100
  return d >= 2 && d <= 4 && (h < 12 || h > 14) ? few : many
}

/** "1 zadanie", "162 zadania", "297 zadań" */
export const tasksLabel = (n: number) => `${n} ${plural(n, 'zadanie', 'zadania', 'zadań')}`
