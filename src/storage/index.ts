import { createDexieStore } from './dexie'
import type { ProgressStore } from './types'

// Single app-wide store. Swap the implementation here (e.g. a synced store) without touching callers.
let store: ProgressStore | null = null

export function progress(): ProgressStore {
  store ??= createDexieStore()
  return store
}

/** Tests only: inject an isolated store. */
export function setProgressStore(s: ProgressStore | null) {
  store = s
}

export type * from './types'
