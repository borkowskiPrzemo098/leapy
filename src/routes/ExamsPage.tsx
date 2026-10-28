import { clsx } from 'clsx'
import { Check, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { useCatalog } from '@/content/data'
import { TopicSearch } from '@/features/search/TopicSearch'
import { useStudy } from '@/state/study'
import { LoadError } from '@/ui/LoadError'
import { Page, StairsBackdrop } from '@/ui/Page'

export default function ExamsPage() {
  const catalog = useCatalog()
  const { exam: chosenExam, subjects, chooseExam, toggleSubject } = useStudy()
  const [searching, setSearching] = useState(false)

  if (catalog.status === 'loading') return <ScreenSkeleton />
  if (catalog.status === 'error') return <LoadError message={catalog.error} />

  return (
    <Page
      title="Egzaminy"
      lead="Wybierz egzamin i zaznacz przedmioty, które zdajesz. Stuknij przedmiot, żeby zobaczyć jego tematy."
      wide
    >
      <div className="mb-6 max-w-2xl">
        <TopicSearch onActive={setSearching} />
      </div>
      <div hidden={searching} className="grid gap-5 md:grid-cols-2 md:items-start">
        {catalog.data.exams.map((exam) => {
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

              <ul className="flex flex-col gap-2 p-4">
                {exam.subjects.map((s) => {
                  const on = active && subjects.includes(s.id)
                  const label = s.level ? `${s.name}, poziom ${s.level}` : s.name
                  return (
                    <li
                      key={s.id}
                      className={clsx(
                        'mb-[3px] flex min-h-16 items-stretch overflow-hidden rounded-xl border-2 transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)]',
                        on
                          ? 'border-brand bg-brand-soft shadow-[0_3px_0_var(--brand)]'
                          : 'border-line bg-surface shadow-[0_3px_0_var(--line)]',
                      )}
                    >
                      <Link
                        to={`/app/egzaminy/${exam.id}/${s.id}`}
                        className="flex flex-1 items-center gap-2 py-2.5 pl-4 text-left no-underline hover:bg-surface-2/60"
                      >
                        <span className="flex-1">
                          <span className="block font-extrabold text-ink">{s.name}</span>
                          <span className="block text-small text-ink-3">
                            {s.level && `poziom ${s.level} · `}
                            {s.tasks > 0 ? `${s.tasks} zadań` : 'w przygotowaniu'}
                          </span>
                        </span>
                        <ChevronRight aria-hidden className="size-5 text-ink-3" />
                      </Link>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={
                          on
                            ? `Usuń z moich przedmiotów: ${label}`
                            : `Dodaj do moich przedmiotów: ${label}`
                        }
                        onClick={() => toggleSubject(exam.id, s.id)}
                        className="grid w-16 shrink-0 place-items-center border-l-2 border-line/70"
                      >
                        <span
                          className={clsx(
                            'grid size-9 place-items-center rounded-md transition-colors duration-[var(--dur-fast)]',
                            on ? 'bg-brand text-on-brand' : 'bg-surface-2 text-ink-3',
                          )}
                        >
                          {on ? (
                            <Check aria-hidden className="size-5" strokeWidth={3} />
                          ) : (
                            <Plus aria-hidden className="size-5" strokeWidth={2.5} />
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
      <p hidden={searching} className="mt-6 text-small text-ink-3">
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
