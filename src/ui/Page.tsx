import { clsx } from 'clsx'
import { useEffect, useRef, type ReactNode } from 'react'

export interface PageProps {
  title: string
  /** One plain sentence under the title */
  lead?: string
  /** Right side of the header row (e.g. a settings button) */
  actions?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Screen frame: sets document.title and moves focus to the heading after navigation,
 * so screen-reader and keyboard users land at the top of the new screen.
 */
export function Page({ title, lead, actions, children, className }: PageProps) {
  const h1 = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    document.title = `${title} · Leapy`
    // Skip the very first load: focus should stay where the browser put it.
    if (document.documentElement.dataset.navigated) h1.current?.focus({ preventScroll: true })
    document.documentElement.dataset.navigated = '1'
  }, [title])

  return (
    <div className={clsx('mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 md:pt-10', className)}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 ref={h1} tabIndex={-1} className="text-title text-ink outline-none">
            {title}
          </h1>
          {lead && <p className="mt-1.5 max-w-[56ch] text-ink-2">{lead}</p>}
        </div>
        {actions}
      </header>
      <div className="mt-6">{children}</div>
    </div>
  )
}

export interface EmptyStateProps {
  art: ReactNode
  title: string
  children?: ReactNode
  action?: ReactNode
}

/** Empty states invite the next step instead of apologising for missing data. */
export function EmptyState({ art, title, children, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line-strong px-6 py-10 text-center">
      <div aria-hidden className="mb-5">
        {art}
      </div>
      <h2 className="text-heading text-ink">{title}</h2>
      {children && <div className="mt-2 max-w-[42ch] text-ink-2">{children}</div>}
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  )
}

/** Small staircase illustration used by empty states and the 404. */
export function StairsArt({ size = 112 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 160 120" fill="none">
      <path
        d="M8 112H48V84H88V56H128V28H152"
        stroke="var(--line-strong)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="68" cy="58" r="12" fill="var(--brand)" />
      <path
        d="M78 46Q100 14 128 20"
        stroke="var(--brand)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="0 11"
      />
      <path
        d="M140 4Q140 14 150 14Q140 14 140 24Q140 14 130 14Q140 14 140 4Z"
        fill="var(--reward)"
        stroke="var(--reward)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
