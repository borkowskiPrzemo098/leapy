import { clsx } from 'clsx'
import { Check, X } from 'lucide-react'
import type { ReactNode } from 'react'

export type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed'

export interface AnswerOptionProps {
  /** Key shown in the badge and used as the desktop shortcut (A, B, C, D or 1-4) */
  keyLabel: string
  state?: AnswerState
  disabled?: boolean
  onSelect?: () => void
  children: ReactNode
}

// Correct/wrong never rely on colour alone: the badge swaps to an icon and the
// tile gets a status line that screen readers announce.
const tile: Record<AnswerState, string> = {
  idle: 'border-line bg-surface hover:border-line-strong hover:bg-surface-2 shadow-[0_3px_0_var(--line)]',
  selected: 'border-brand bg-brand-soft shadow-[0_3px_0_var(--brand)]',
  correct: 'border-correct bg-correct-soft shadow-[0_3px_0_var(--correct-deep)]',
  wrong: 'border-wrong bg-wrong-soft shadow-[0_3px_0_var(--wrong-deep)]',
  missed: 'border-correct border-dashed bg-surface shadow-none',
}

const badge: Record<AnswerState, string> = {
  idle: 'bg-surface-2 text-ink-2',
  selected: 'bg-brand text-on-brand',
  correct: 'bg-correct text-on-feedback animate-leap',
  wrong: 'bg-wrong text-on-feedback animate-shake',
  missed: 'bg-correct-soft text-correct-text',
}

const status: Partial<Record<AnswerState, string>> = {
  correct: 'Poprawna odpowiedź',
  wrong: 'Błędna odpowiedź',
  missed: 'To była poprawna odpowiedź',
}

export function AnswerOption({
  keyLabel,
  state = 'idle',
  disabled,
  onSelect,
  children,
}: AnswerOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={state === 'selected' || state === 'correct' || state === 'wrong'}
      className={clsx(
        'group flex min-h-16 w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left',
        'transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-base)] ease-out',
        'enabled:active:translate-y-[3px] enabled:active:shadow-none disabled:cursor-default',
        tile[state],
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'grid size-10 shrink-0 place-items-center rounded-md text-small font-extrabold',
          badge[state],
        )}
      >
        {state === 'correct' || state === 'missed' ? (
          <Check className="size-5" strokeWidth={3} />
        ) : state === 'wrong' ? (
          <X className="size-5" strokeWidth={3} />
        ) : (
          keyLabel
        )}
      </span>
      {/* The letter is spoken too: an option that is only a formula would otherwise
          have no text name (MathML is not part of the accessible name everywhere). */}
      <span className="sr-only">{keyLabel}: </span>
      <span className="flex-1 text-body font-semibold text-ink">{children}</span>
      {status[state] && <span className="sr-only">{status[state]}</span>}
    </button>
  )
}
