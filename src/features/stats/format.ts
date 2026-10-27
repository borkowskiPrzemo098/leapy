// Polish number, date and duration formatting for statistics.

const dateFmt = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})
const longDateFmt = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long' })

export const formatDay = (ts: number) => dateFmt.format(ts)
export const formatDate = (ts: number) => longDateFmt.format(ts)

/** Polish plural: 1 zadanie, 2–4 zadania (but 12–14 zadań), 5+ zadań */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one
  const d = n % 10
  const t = n % 100
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many
}

export const itemsLabel = (n: number) => `${n} ${plural(n, 'zadanie', 'zadania', 'zadań')}`
export const daysLabel = (n: number) => `${n} ${plural(n, 'dzień', 'dni', 'dni')}`

/** 95 min → "1 h 35 min", 40 s → "1 min" */
export function formatDuration(ms: number) {
  const min = Math.max(ms > 0 ? 1 : 0, Math.round(ms / 60_000))
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const rest = min % 60
  return rest ? `${h} h ${rest} min` : `${h} h`
}

/** Rounds the axis maximum up to a clean step: 4 → 5, 13 → 15, 37 → 40. */
export function niceMax(v: number) {
  if (v <= 5) return 5
  const step = v <= 20 ? 5 : v <= 50 ? 10 : v <= 200 ? 25 : 100
  return Math.ceil(v / step) * step
}
