import { clsx } from 'clsx'
import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'reward' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  icon?: ReactNode
  iconEnd?: ReactNode
}

// Tactile buttons: a solid lip under the face that compresses on press,
// so every tap physically "lands". Ghost buttons stay flat.
const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-on-brand shadow-[0_4px_0_var(--brand-deep)] hover:bg-brand-strong active:shadow-[0_0_0_var(--brand-deep)]',
  reward:
    'bg-reward text-on-reward shadow-[0_4px_0_var(--reward-deep)] hover:bg-reward-strong active:shadow-[0_0_0_var(--reward-deep)]',
  secondary:
    'bg-surface text-ink border-2 border-line-strong shadow-[0_4px_0_var(--line-strong)] hover:bg-surface-2 active:shadow-[0_0_0_var(--line-strong)]',
  ghost: 'bg-transparent text-brand-text hover:bg-brand-soft',
}

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-5 text-body gap-2 rounded-lg',
  lg: 'min-h-14 px-6 text-[1.0625rem] gap-2.5 rounded-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  icon,
  iconEnd,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const pressable = variant !== 'ghost'
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        'inline-flex items-center justify-center font-bold tracking-[-0.01em] select-none',
        'transition-[background-color,box-shadow,transform] duration-[var(--dur-fast)] ease-out',
        pressable && 'mb-1 active:translate-y-1',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : icon}
      {children}
      {iconEnd}
    </button>
  )
}
