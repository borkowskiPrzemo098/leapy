// App colour themes, unlocked by level. The palettes live in tokens.css under
// [data-accent]; the same key is read inline in index.html before first paint.

export type AccentId = 'fiolet' | 'morski' | 'malinowy' | 'kobaltowy' | 'grafitowy'

export interface Accent {
  id: AccentId
  name: string
  /** Level that unlocks it */
  level: number
}

export const ACCENTS: Accent[] = [
  { id: 'fiolet', name: 'Fioletowy', level: 1 },
  { id: 'morski', name: 'Morski', level: 3 },
  { id: 'malinowy', name: 'Malinowy', level: 5 },
  { id: 'kobaltowy', name: 'Kobaltowy', level: 8 },
  { id: 'grafitowy', name: 'Grafitowy', level: 12 },
]

const KEY = 'leapy:accent'
const isAccent = (v: string | null): v is AccentId => ACCENTS.some((a) => a.id === v)

export function readAccent(): AccentId {
  try {
    const v = localStorage.getItem(KEY)
    return isAccent(v) ? v : 'fiolet'
  } catch {
    return 'fiolet'
  }
}

export function applyAccent(id: AccentId) {
  const root = document.documentElement
  if (id === 'fiolet') delete root.dataset.accent
  else root.dataset.accent = id
  try {
    if (id === 'fiolet') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, id)
  } catch {
    /* storage blocked: the colour still applies for this visit */
  }
}

export const isUnlocked = (a: Accent, level: number) => level >= a.level
