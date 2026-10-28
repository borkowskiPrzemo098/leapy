import 'katex/dist/katex.min.css'
import { clsx } from 'clsx'
import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

// Renders compiled content HTML (Markdown + pre-rendered KaTeX from our own build pipeline,
// never user input). Importing katex.css here keeps it out of screens without formulas.

export function Html({
  html,
  as: Tag = 'div',
  className,
}: {
  html: string
  as?: 'div' | 'span' | 'p' | 'li' | 'dt' | 'dd'
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  useScrollableFormulas(ref, html)
  return (
    <Tag
      ref={ref as RefObject<never>}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return <Html html={html} className={clsx('prose', className)} />
}

/**
 * Long formulas scroll sideways on narrow screens. A scrolling region must be reachable from
 * the keyboard (WCAG 2.1.1), so the ones that actually overflow get tabindex="0".
 */
function useScrollableFormulas(ref: RefObject<HTMLElement | null>, html: string) {
  useEffect(() => {
    const root = ref.current
    if (!root || !html.includes('katex')) return
    const mark = () => {
      const boxes = [root, ...root.querySelectorAll<HTMLElement>('.katex-display, .math-scroll')]
      for (const el of boxes) {
        if (el !== root && !el.matches('.katex-display, .math-scroll')) continue
        const overflows = el.scrollWidth > el.clientWidth + 1
        if (overflows) el.tabIndex = 0
        else el.removeAttribute('tabindex')
      }
    }
    mark()
    const ro = new ResizeObserver(mark)
    ro.observe(root)
    return () => ro.disconnect()
  }, [ref, html])
}
