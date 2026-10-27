import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; icon-only buttons always need one */
  label: string
  tone?: 'plain' | 'brand'
}

export function IconButton({
  label,
  tone = 'plain',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'grid size-12 place-items-center rounded-lg transition-colors duration-[var(--dur-fast)]',
        tone === 'plain' && 'text-ink-2 hover:bg-surface-2 hover:text-ink',
        tone === 'brand' && 'bg-brand-soft text-brand-text hover:bg-brand hover:text-on-brand',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

/** Full-row switch: the whole row is the 48px+ touch target. */
export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-14 w-full items-center gap-4 rounded-lg px-1 text-left"
    >
      <span className="flex-1">
        <span className="block font-bold text-ink">{label}</span>
        {description && <span className="block text-small text-ink-3">{description}</span>}
      </span>
      <span
        aria-hidden
        className={clsx(
          'relative h-8 w-14 shrink-0 rounded-full transition-colors duration-[var(--dur-base)]',
          checked ? 'bg-brand' : 'bg-line-strong',
        )}
      >
        <span
          className={clsx(
            'absolute top-1 left-1 size-6 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-base)] ease-out',
            checked && 'translate-x-6',
          )}
        />
      </span>
    </button>
  )
}

export interface SegmentedProps<T extends string> {
  value: T
  options: { value: T; label: string; icon?: ReactNode }[]
  onChange: (value: T) => void
  label: string
  /** Below the sm breakpoint show icons only (labels stay for screen readers) */
  compact?: boolean
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  compact = false,
}: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          title={compact ? o.label : undefined}
          onClick={() => onChange(o.value)}
          className={clsx(
            'flex min-h-12 min-w-12 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-small font-bold transition-[background-color,color,box-shadow] duration-[var(--dur-fast)]',
            o.value === value ? 'bg-surface text-ink shadow-sm' : 'text-ink-3 hover:text-ink',
          )}
        >
          {o.icon}
          <span className={clsx(compact && 'sr-only sm:not-sr-only')}>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Chip({
  tone = 'plain',
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'plain' | 'brand' | 'reward' | 'inverse' }) {
  return (
    <span
      className={clsx(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full px-3 text-micro font-bold',
        tone === 'plain' && 'bg-surface-2 text-ink-2',
        tone === 'brand' && 'bg-brand-soft text-brand-text',
        tone === 'reward' && 'bg-reward-soft text-on-reward dark:text-reward',
        tone === 'inverse' && 'bg-white/15 text-on-brand',
        className,
      )}
      {...rest}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-lg bg-sunken', className)} />
}
