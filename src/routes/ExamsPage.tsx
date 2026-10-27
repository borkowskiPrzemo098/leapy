import { clsx } from 'clsx'
import { Check, Plus } from 'lucide-react'
import { CATALOG } from '@/content/catalog'
import { useStudy } from '@/state/study'
import { Page, StairsBackdrop } from '@/ui/Page'

export default function ExamsPage() {
  const { exam: chosenExam, subjects, chooseExam, toggleSubject } = useStudy()

  return (
    <Page
      title="Egzaminy"
      lead="Wybierz egzamin i zaznacz przedmioty, które zdajesz. Możesz to zmienić w każdej chwili."
      wide
    >
      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        {CATALOG.map((exam) => {
          const active = chosenExam === exam.id
          return (
            <section
              key={exam.id}
              aria-labelledby={`exam-${exam.id}`}
              className={clsx(
                'overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow duration-[var(--dur-base)]',
                active && 'shadow-md ring-4 ring-brand-soft',
              )}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => chooseExam(exam.id)}
                className="relative block min-h-36 w-full overflow-hidden bg-brand p-5 text-left text-on-brand transition-[background-color] duration-[var(--dur-fast)] hover:bg-brand-strong"
              >
                <StairsBackdrop className="w-1/2 max-w-56" />
                <span className="relative flex items-start justify-between gap-3">
                  <span>
                    <span id={`exam-${exam.id}`} className="block text-title text-on-brand">
                      {exam.name}
                    </span>
                    <span className="mt-1 block text-small font-semibold text-on-brand-2">
                      {exam.audience}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={clsx(
                      'grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors duration-[var(--dur-fast)]',
                      active ? 'border-reward bg-reward text-on-reward' : 'border-on-brand-2/60',
                    )}
                  >
                    {active && <Check className="size-6" strokeWidth={3} />}
                  </span>
                </span>
              </button>

              <div className="p-4">
                <ul className="flex flex-col gap-2">
                  {exam.subjects.map((s) => {
                    const on = active && subjects.includes(s.id)
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleSubject(exam.id, s.id)}
                          className={clsx(
                            'mb-[3px] flex min-h-16 w-full items-center gap-3 rounded-xl border-2 px-4 text-left',
                            'transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-fast)] active:translate-y-[3px] active:shadow-none',
                            on
                              ? 'border-brand bg-brand-soft shadow-[0_3px_0_var(--brand)]'
                              : 'border-line bg-surface shadow-[0_3px_0_var(--line)] hover:border-line-strong',
                          )}
                        >
                          <span className="flex-1">
                            <span className="block font-extrabold text-ink">{s.name}</span>
                            {s.level && (
                              <span className="block text-small text-ink-3">poziom {s.level}</span>
                            )}
                          </span>
                          <span
                            aria-hidden
                            className={clsx(
                              'grid size-8 place-items-center rounded-md',
                              on ? 'bg-brand text-on-brand' : 'bg-surface-2 text-ink-3',
                            )}
                          >
                            {on ? (
                              <Check className="size-5" strokeWidth={3} />
                            ) : (
                              <Plus className="size-5" strokeWidth={2.5} />
                            )}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-3 px-1 text-small text-ink-3">
                  Zadania i lekcje dla tych przedmiotów są w przygotowaniu.
                  {active && subjects.length > 0 && ' Twój wybór jest zapisany.'}
                </p>
              </div>
            </section>
          )
        })}
      </div>
      <p className="mt-6 text-small text-ink-3">
        Później dojdą pozostałe przedmioty maturalne, egzaminy zawodowe i przedmioty z pierwszego
        roku studiów. Oficjalne arkusze znajdziesz na{' '}
        <a href="https://cke.gov.pl" target="_blank" rel="noopener noreferrer">
          cke.gov.pl
        </a>
        .
      </p>
    </Page>
  )
}
