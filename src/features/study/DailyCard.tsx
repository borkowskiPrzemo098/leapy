import { CalendarCheck, Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ButtonLink } from '@/ui/Button'
import { dailyStatus, type DailyStatus } from './daily'

/** Start screen: today's single task, with the run of days it has been done. */
export function DailyCard() {
  const [status, setStatus] = useState<DailyStatus | null>(null)
  useEffect(() => {
    let alive = true
    void dailyStatus().then((s) => alive && setStatus(s))
    return () => {
      alive = false
    }
  }, [])

  const done = status?.doneToday ?? false
  return (
    <section
      aria-labelledby="daily"
      className="flex flex-col gap-4 rounded-2xl bg-reward-soft p-5 sm:flex-row sm:items-center sm:p-6"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-reward text-on-reward shadow-[inset_0_-4px_0_var(--reward-deep)]">
        {done ? (
          <Check aria-hidden className="size-7" strokeWidth={3} />
        ) : (
          <CalendarCheck aria-hidden className="size-7" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="daily" className="text-heading text-ink">
          Zadanie dnia
        </h2>
        <p className="mt-0.5 text-small text-ink-2">
          {status === null
            ? ' '
            : done
              ? `Zrobione na dziś. ${status.streak > 1 ? `Seria: ${status.streak} dni z rzędu.` : 'Wróć jutro po kolejne.'}`
              : status.streak > 0
                ? `Jedno zadanie, minuta pracy. Seria: ${status.streak} ${status.streak === 1 ? 'dzień' : 'dni'}, nie przerywaj jej.`
                : 'Jedno zadanie, minuta pracy. Każdego dnia inne.'}
        </p>
      </div>
      <ButtonLink
        to="/app/sesja/dzien"
        variant={done ? 'secondary' : 'primary'}
        className="sm:w-auto"
      >
        {done ? 'Zobacz jeszcze raz' : 'Rozwiąż'}
      </ButtonLink>
    </section>
  )
}
