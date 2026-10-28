// Markdown + KaTeX → HTML at build time, so the app ships only katex.css (no parser, no KaTeX JS).
import katex from 'katex'
import { Marked } from 'marked'

const marked = new Marked({ gfm: true, breaks: false, async: false })

// $$...$$ (display) and $...$ (inline). A literal dollar is written \$.
const MATH = /\$\$([\s\S]+?)\$\$|(?<!\\)\$((?:\\\$|[^$\n])+?)\$/g

// Rendered formulas are swapped for private-use placeholders so Markdown cannot touch them.
const SLOT = String.fromCharCode(0xe000)
const SLOT_RE = new RegExp(`${SLOT}(\\d+)${SLOT}`, 'g')

export class MathError extends Error {}

function renderMath(src: string, display: boolean) {
  try {
    return katex.renderToString(src.trim(), {
      displayMode: display,
      throwOnError: true,
      strict: 'error',
      // MathML is what screen readers read; the HTML half is aria-hidden and only for display.
      output: 'htmlAndMathml',
    })
  } catch (e) {
    throw new MathError(`KaTeX: ${(e as Error).message} w "${src.trim()}"`)
  }
}

function withMath(src: string, render: (s: string) => string) {
  const slots: string[] = []
  const masked = src.replace(MATH, (_, display: string | undefined, inline: string | undefined) => {
    slots.push(display !== undefined ? renderMath(display, true) : renderMath(inline ?? '', false))
    return `${SLOT}${slots.length - 1}${SLOT}`
  })
  return render(masked.replace(/\\\$/g, '$')).replace(
    SLOT_RE,
    (_, i: string) => slots[Number(i)] ?? '',
  )
}

/** Block Markdown (paragraphs, lists, tables). */
export function mdBlock(src: string): string {
  return withMath(src, (s) => marked.parse(s) as string).trim()
}

/** Inline Markdown for short strings (options, list items): no wrapping <p>. */
export function mdInline(src: string): string {
  return withMath(src, (s) => marked.parseInline(s) as string).trim()
}
