// Machine verification of computable answers. A task's `verify` expression (mathjs syntax)
// is evaluated in 64-digit precision and compared with the authored answer.
import { all, create } from 'mathjs'
import type { Task } from '../../src/content/schema'

if (!all) throw new Error('mathjs: brak zestawu funkcji')
const math = create(all, { number: 'BigNumber', precision: 64 })
const EPS = 1e-12

export function evaluate(expr: string): number {
  const v: unknown = math.evaluate(expr)
  const n = Number(math.format(v as never, { notation: 'fixed', precision: 30 }))
  if (!Number.isFinite(n)) throw new Error(`wyrażenie "${expr}" nie daje liczby`)
  return n
}

/** Parses a number written in an option or answer: "0,75", "3/4", "$\frac{3}{4}$", "$-2\sqrt{2}$". */
export function numberFromText(text: string): number | null {
  let s = text.trim().replace(/^\$+|\$+$/g, '')
  s = s
    // decimal comma first, before \sqrt[n]{x} becomes nthRoot(x,n)
    .replace(/(\d)\{?,\}?(\d)/g, '$1.$2')
    .replace(/\\?%/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\cdot|\\times/g, '*')
  // Innermost first, so \frac{\sqrt{5}+1}{2} and nested fractions work
  for (let i = 0; i < 6; i++) {
    const before = s
    s = s
      .replace(/\\sqrt\[(\d+)\]\{([^{}]+)\}/g, 'nthRoot($2,$1)')
      .replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)')
      .replace(/\^\{([^{}]+)\}/g, '^($1)')
      .replace(/\\[dt]?frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))')
    if (s === before) break
  }
  s = s.replace(/\\pi/g, 'pi').replace(/[−–]/g, '-').replace(/\s+/g, '')
  // Only digits, operators and the three known functions; anything else is prose, not a number.
  if (!s || !/^[0-9+\-*/().^,]*$/.test(s.replace(/sqrt|nthRoot|pi/g, ''))) return null
  // implicit multiplication like 2sqrt(2) or 3pi
  s = s.replace(/(\d)(sqrt|nthRoot|pi|\()/g, '$1*$2')
  try {
    return evaluate(s)
  } catch {
    return null
  }
}

const close = (a: number, b: number, tol = EPS) =>
  Math.abs(a - b) <= Math.max(tol, EPS * Math.abs(b))

/** Returns a list of problems (empty = verified or nothing to verify). */
export function verifyTask(t: Task): string[] {
  if (!t.verify) return []
  let expected: number
  try {
    expected = evaluate(t.verify)
  } catch (e) {
    return [`verify: ${(e as Error).message}`]
  }
  switch (t.type) {
    case 'numeric': {
      const v = typeof t.answer.value === 'number' ? t.answer.value : numberFromText(t.answer.value)
      if (v === null) return ['verify: nie da się odczytać answer.value']
      return close(v, expected, t.answer.tolerance)
        ? []
        : [`verify: odpowiedź ${String(t.answer.value)} ≠ ${expected} (${t.verify})`]
    }
    case 'single': {
      const values = t.options.map(numberFromText)
      const chosen = values[t.answer]
      if (chosen === null || chosen === undefined)
        return ['verify: poprawnej opcji nie da się odczytać jako liczby']
      const problems: string[] = []
      if (!close(chosen, expected))
        problems.push(`verify: poprawna opcja = ${chosen}, a wyrażenie = ${expected}`)
      values.forEach((v, i) => {
        if (i !== t.answer && v !== null && close(v, expected))
          problems.push(`verify: opcja ${i} też jest równa poprawnemu wynikowi`)
      })
      return problems
    }
    default:
      return [`verify: nieobsługiwany typ zadania "${t.type}"`]
  }
}
