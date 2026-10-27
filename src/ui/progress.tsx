import { clsx } from 'clsx'

const clamp = (v: number) => Math.min(1, Math.max(0, v))

export interface ProgressBarProps {
  value: number
  max?: number
  label: string
  tone?: 'brand' | 'reward' | 'correct'
  className?: string
}

const fill = { brand: 'bg-brand', reward: 'bg-reward', correct: 'bg-correct' }

export function ProgressBar({
  value,
  max = 1,
  label,
  tone = 'brand',
  className,
}: ProgressBarProps) {
  const ratio = clamp(value / max)
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={clsx('h-3.5 overflow-hidden rounded-full bg-sunken', className)}
    >
      <div
        className={clsx(
          'h-full rounded-full transition-[width] duration-[var(--dur-slow)] ease-out',
          fill[tone],
        )}
        style={{ width: `${ratio * 100}%` }}
      >
        <div className="mx-2 mt-[3px] h-1 rounded-full bg-white/35" />
      </div>
    </div>
  )
}

export interface GoalRingProps {
  /** Minutes (or any unit) done today */
  value: number
  goal: number
  size?: number
  label: string
  children?: React.ReactNode
}

/** Daily-goal ring: the stroke fills clockwise and turns sun-yellow once the goal is met. */
export function GoalRing({ value, goal, size = 120, label, children }: GoalRingProps) {
  const stroke = size * 0.12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const ratio = clamp(value / goal)
  const done = ratio >= 1
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-valuenow={Math.min(value, goal)}
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-current text-on-brand/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - ratio)}
          className={clsx(
            'stroke-current transition-[stroke-dashoffset] duration-[var(--dur-slow)] ease-out',
            done ? 'text-reward' : 'text-on-brand',
          )}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

export interface StepLadderProps {
  /** Number of steps in the current level band */
  steps: number
  /** Steps completed (0..steps) */
  done: number
  label: string
  className?: string
}

/**
 * Signature Leapy progress: a staircase where every finished step is a block one level
 * higher than the last. The current step pulses; the top step holds the next level.
 */
export function StepLadder({ steps, done, label, className }: StepLadderProps) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={steps}
      aria-valuenow={done}
      className={clsx('flex h-24 items-end gap-1.5', className)}
    >
      {Array.from({ length: steps }, (_, i) => {
        const state = i < done ? 'done' : i === done ? 'current' : 'todo'
        return (
          <div
            key={i}
            className={clsx(
              'flex-1 rounded-t-md rounded-b-sm transition-colors duration-[var(--dur-base)]',
              state === 'done' && 'bg-reward shadow-[inset_0_-4px_0_var(--reward-deep)]',
              state === 'current' && 'animate-pulse-step bg-brand',
              state === 'todo' && 'bg-sunken',
            )}
            style={{ height: `${28 + (72 * (i + 1)) / steps}%` }}
          />
        )
      })}
    </div>
  )
}
