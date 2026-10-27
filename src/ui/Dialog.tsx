import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  /** Destructive actions get the red-free but explicit secondary styling + clear wording */
  onConfirm: () => void
  onCancel: () => void
  busy?: boolean
}

/**
 * Native <dialog> for the few moments that truly need confirmation (overwriting or deleting
 * progress). Focus trap, Esc and the backdrop come from the browser.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      aria-labelledby="dialog-title"
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-2xl bg-surface p-0 text-ink shadow-lg backdrop:bg-[var(--overlay)]"
    >
      <div className="p-6">
        <h2 id="dialog-title" className="text-heading text-ink">
          {title}
        </h2>
        <div className="mt-2 text-ink-2">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Anuluj
          </Button>
          <Button onClick={onConfirm} loading={busy ?? false}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
