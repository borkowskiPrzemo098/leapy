import 'katex/dist/katex.min.css'
import { clsx } from 'clsx'

// Renders compiled content HTML (Markdown + pre-rendered KaTeX from our own build pipeline,
// never user input). Importing katex.css here keeps it out of screens without formulas.

export function Html({
  html,
  as: Tag = 'div',
  className,
}: {
  html: string
  as?: 'div' | 'span' | 'p' | 'li'
  className?: string
}) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return <Html html={html} className={clsx('prose', className)} />
}
