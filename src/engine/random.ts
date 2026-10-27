// Seeded randomness so a session can be replayed exactly (tests, resume after reload).

/** mulberry32: tiny, fast, good enough for shuffling quiz options. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher–Yates on a copy. */
export function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = a[i] as T
    a[i] = a[j] as T
    a[j] = tmp
  }
  return a
}

/** Permutation of 0..n-1. For ordering tasks it is re-rolled until it differs from the answer. */
export function permutation(n: number, rand: () => number, avoid?: readonly number[]): number[] {
  const ids = Array.from({ length: n }, (_, i) => i)
  for (let tries = 0; tries < 8; tries++) {
    const p = shuffle(ids, rand)
    if (!avoid || p.some((v, i) => v !== avoid[i])) return p
  }
  return [...ids].reverse()
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31)
