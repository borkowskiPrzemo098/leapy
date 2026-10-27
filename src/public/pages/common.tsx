import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Crumb } from '../seo'

/** Visible breadcrumbs; the same list feeds BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Okruszki" className="text-small font-bold text-ink-3">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => (
          <li key={c.to} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="size-4" />}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-ink-2">
                {c.label}
              </span>
            ) : (
              <Link to={c.to} className="text-ink-3 no-underline hover:text-brand-text">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function PageTitle({
  kicker,
  title,
  lead,
  children,
}: {
  kicker?: ReactNode
  title: string
  lead?: string
  children?: ReactNode
}) {
  return (
    <header className="max-w-3xl">
      {kicker && <div className="mb-3">{kicker}</div>}
      <h1 className="text-display text-ink">{title}</h1>
      {lead && <p className="mt-3 max-w-[60ch] text-lead text-ink-2">{lead}</p>}
      {children}
    </header>
  )
}

export function Loading() {
  return <div aria-busy="true" aria-label="Wczytywanie" className="min-h-[60dvh]" />
}
