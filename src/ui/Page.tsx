import { clsx } from 'clsx'
import { useEffect, useRef, type ReactNode } from 'react'

export interface PageProps {
  title: string
  /** One plain sentence under the title */
  lead?: string
  /** Right side of the header row (e.g. a settings button) */
  actions?: ReactNode
  /** Wider frame for screens that go multi-column on desktop */
  wide?: boolean
  children: ReactNode
  className?: string
}

/**
 * Screen frame: sets document.title and moves focus to the heading after navigation,
 * so screen-reader and keyboard users land at the top of the new screen.
 */
export function Page({ title, lead, actions, wide, children, className }: PageProps) {
  const h1 = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    document.title = `${title} · Leapy`
    // Skip the very first load: focus should stay where the browser put it.
    if (document.documentElement.dataset.navigated) h1.current?.focus({ preventScroll: true })
    document.documentElement.dataset.navigated = '1'
  }, [title])

  return (
    <div
      className={clsx(
        'mx-auto w-full px-4 pt-6 sm:px-6 md:pt-10',
        wide ? 'max-w-5xl' : 'max-w-3xl',
        className,
      )}
    >
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
    <div className="flex flex-col items-center rounded-2xl bg-surface px-6 pt-10 pb-8 text-center shadow-sm">
      <div aria-hidden className="mb-6 w-full max-w-64">
        {art}
      </div>
      <h2 className="text-heading text-ink">{title}</h2>
      {children && <div className="mt-2 max-w-[42ch] text-ink-2">{children}</div>}
      {action && <div className="mt-6 w-full max-w-xs">{action}</div>}
    </div>
  )
}

/**
 * The Leapy climb: solid blocks rising left to right (StepLadder geometry), the first
 * `done` in sun-yellow, the next one violet, the rest sunken, with a spark on top.
 */
export function ClimbArt({
  steps = 5,
  done = 0,
  onBrand = false,
}: {
  steps?: number
  done?: number
  /** Drawn on a violet field: current step turns white, the rest deep violet */
  onBrand?: boolean
}) {
  const w = 160
  const gap = 6
  const bw = (w - gap * (steps - 1)) / steps
  return (
    <svg viewBox={`0 0 ${w} 112`} className="h-auto w-full">
      {Array.from({ length: steps }, (_, i) => {
        const h = 24 + (64 * (i + 1)) / steps
        const fill =
          i < done
            ? 'var(--reward)'
            : i === done
              ? onBrand
                ? 'var(--on-brand)'
                : 'var(--brand)'
              : onBrand
                ? 'var(--brand-deep)'
                : 'var(--surface-sunken)'
        return (
          <rect key={i} x={i * (bw + gap)} y={112 - h} width={bw} height={h} rx="6" fill={fill} />
        )
      })}
      <path
        d={`M${w - 14} 0Q${w - 14} 10 ${w - 4} 10Q${w - 14} 10 ${w - 14} 20Q${w - 14} 10 ${w - 24} 10Q${w - 14} 10 ${w - 14} 0Z`}
        fill="var(--reward)"
        stroke="var(--reward)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Big stair blocks for violet fields, anchored to the bottom-right corner. */
export function StairsBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 240 160"
      className={clsx('pointer-events-none absolute right-0 bottom-0 h-auto', className)}
    >
      <path d="M0 160V128H60V96H120V64H180V32H240V160Z" fill="var(--brand-deep)" opacity=".6" />
    </svg>
  )
}
