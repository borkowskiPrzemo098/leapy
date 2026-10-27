import { CATALOG } from '@/content/catalog'
import { Chip } from '@/ui/controls'
import { Page } from '@/ui/Page'

export default function ExamsPage() {
  return (
    <Page
      title="Egzaminy"
      lead="Wybierz egzamin i przedmiot. Mapa tematów pojawi się po dodaniu pierwszych treści."
    >
      <div className="flex flex-col gap-6">
        {CATALOG.map((exam) => (
          <section
            key={exam.id}
            aria-labelledby={`exam-${exam.id}`}
            className="overflow-hidden rounded-2xl border border-line bg-surface"
          >
            <header className="flex items-center gap-4 bg-brand-soft px-5 py-4">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand text-lead font-extrabold text-on-brand"
              >
                {exam.short}
              </span>
              <div>
                <h2 id={`exam-${exam.id}`} className="text-heading text-ink">
                  {exam.name}
                </h2>
                <p className="text-small text-ink-2">{exam.audience}</p>
              </div>
            </header>
            <ul className="divide-y divide-line">
              {exam.subjects.map((s) => (
                <li
                  key={s.id}
                  className="flex min-h-16 items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="font-bold text-ink">
                    {s.name}
                    {s.level && <span className="font-semibold text-ink-3"> · {s.level}</span>}
                  </span>
                  <Chip>W przygotowaniu</Chip>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-small text-ink-3">
          Później dojdą pozostałe przedmioty maturalne, egzaminy zawodowe i przedmioty z pierwszego
          roku studiów. Oficjalne arkusze znajdziesz na{' '}
          <a href="https://cke.gov.pl" target="_blank" rel="noopener noreferrer">
            cke.gov.pl
          </a>
          .
        </p>
      </div>
    </Page>
  )
}
