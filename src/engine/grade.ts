import type { CompiledTask } from '@/content/schema'

// Pure grading for every task type. Responses always refer to ORIGINAL option indices;
// the player maps its shuffled display order back before calling grade().

export type Response =
  | { type: 'single'; choice: number }
  | { type: 'multi'; choices: number[] }
  | { type: 'truefalse'; values: (boolean | null)[] }
  | { type: 'numeric'; text: string }
  | { type: 'ordering'; order: number[] }
  | { type: 'match'; pairs: (number | null)[] }
  | { type: 'short'; text: string }

export interface Grade {
  correct: boolean
  /** 0..1, partial credit for multi-part types (used by mock exams and statistics) */
  score: number
}

/** "3/4", "-0,75", " 12 ", "1 200" → number; null when it is not a number. */
export function parseNumber(input: string): number | null {
  const s = input
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/(\d)\s(?=\d{3}\b)/g, '$1')
    .replace(',', '.')
  const frac = /^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/.exec(s)
  if (frac) {
    const d = Number(frac[2])
    return d === 0 ? null : Number(frac[1]) / d
  }
  return /^-?\d+(?:\.\d+)?$/.test(s) ? Number(s) : null
}

/** Lowercase, collapse spaces, drop surrounding punctuation, unify quotes and dashes. */
export function normalizeText(s: string, caseSensitive = false) {
  const t = s
    .normalize('NFC')
    .replace(/[’‘`]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[\s.,;:!?"']+|[\s.,;:!?"']+$/g, '')
  return caseSensitive ? t : t.toLocaleLowerCase('pl')
}

const all = (bits: boolean[]): Grade => {
  const ok = bits.filter(Boolean).length
  return { correct: ok === bits.length, score: bits.length ? ok / bits.length : 0 }
}

export function grade(task: CompiledTask, r: Response): Grade {
  if (task.type !== r.type) throw new Error(`odpowiedź typu ${r.type} dla zadania ${task.type}`)
  switch (task.type) {
    case 'single': {
      const ok = (r as Extract<Response, { type: 'single' }>).choice === task.answer
      return { correct: ok, score: ok ? 1 : 0 }
    }
    case 'multi': {
      const chosen = new Set((r as Extract<Response, { type: 'multi' }>).choices)
      const want = new Set(task.answer)
      // Each option judged on its own: chosen when it should be, left when it should not.
      return all(task.options.map((_, i) => chosen.has(i) === want.has(i)))
    }
    case 'truefalse': {
      const v = (r as Extract<Response, { type: 'truefalse' }>).values
      return all(task.answer.map((a, i) => v[i] === a))
    }
    case 'numeric': {
      const n = parseNumber((r as Extract<Response, { type: 'numeric' }>).text)
      const want =
        typeof task.answer.value === 'number' ? task.answer.value : parseNumber(task.answer.value)
      const tol = task.answer.tolerance ?? 1e-9
      const ok = n !== null && want !== null && Math.abs(n - want) <= tol
      return { correct: ok, score: ok ? 1 : 0 }
    }
    case 'ordering': {
      const o = (r as Extract<Response, { type: 'ordering' }>).order
      const ok = o.length === task.answer.length && o.every((v, i) => v === task.answer[i])
      // Partial credit: share of items in their correct position.
      return {
        correct: ok,
        score: task.answer.filter((v, i) => o[i] === v).length / task.answer.length,
      }
    }
    case 'match': {
      const p = (r as Extract<Response, { type: 'match' }>).pairs
      return all(task.answer.map((a, i) => p[i] === a))
    }
    case 'short': {
      const text = normalizeText(
        (r as Extract<Response, { type: 'short' }>).text,
        task.caseSensitive,
      )
      const ok = task.answer.some((a) => normalizeText(a, task.caseSensitive) === text)
      return { correct: ok, score: ok ? 1 : 0 }
    }
  }
}

/** Human-readable correct answer for the feedback panel (HTML from compiled content). */
export function correctAnswerHtml(task: CompiledTask): string {
  switch (task.type) {
    case 'single':
      return task.options[task.answer] ?? ''
    case 'multi':
      return task.answer.map((i) => task.options[i]).join(', ')
    case 'truefalse':
      return task.answer
        .map((a, i) => `${task.options[i] ?? ''}: ${a ? 'prawda' : 'fałsz'}`)
        .join('<br>')
    case 'numeric':
      return `${String(task.answer.value).replace('.', ',')}${task.answer.unit ? ` ${task.answer.unit}` : ''}`
    case 'ordering':
      return task.answer.map((i) => task.options[i]).join(' → ')
    case 'match':
      return task.answer
        .map((r, l) => `${task.options.left[l] ?? ''} → ${task.options.right[r] ?? ''}`)
        .join('<br>')
    case 'short':
      return task.answer[0] ?? ''
  }
}
