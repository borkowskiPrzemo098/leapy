import { BookmarkX, Layers, RotateCcw, Target, Timer, Zap, type LucideIcon } from 'lucide-react'
import { CATALOG } from '@/content/catalog'
import { useStudy } from '@/state/study'
import { ButtonLink } from '@/ui/Button'
import { Page, StairsBackdrop } from '@/ui/Page'

type Mode = { icon: LucideIcon; title: string; text: string }

// Three sizes on purpose: the mock exam is the headline, review modes are the daily
// habit (filled tiles), topic practice and flashcards are quick rows.
const featured: Mode = {
  icon: Timer,
  title: 'Egzamin próbny',
  text: 'Pełny arkusz z czasem, punktacją i podsumowaniem, jak na prawdziwym egzaminie.',
}
const habits: Mode[] = [
  { icon: RotateCcw, title: 'Powtórki', text: 'Co warto powtórzyć dziś.' },
  { icon: BookmarkX, title: 'Moje błędy', text: 'Tylko to, co poszło źle.' },
]
const quick: Mode[] = [
  { icon: Target, title: 'Wybrany temat', text: 'Jeden temat, aż wejdzie.' },
  { icon: Layers, title: 'Fiszki', text: 'Wzory, definicje, daty.' },
]

export default function PracticePage() {
  const examId = useStudy((s) => s.exam)
  const exam = CATALOG.find((e) => e.id === examId)

  return (
    <Page title="Ćwicz" wide>
      <section
        aria-labelledby="quick"
        className="relative overflow-hidden rounded-2xl bg-brand p-6 pb-24 text-on-brand sm:p-8 sm:pb-28"
      >
        <StairsBackdrop className="w-[55%] max-w-72" />
        <div className="relative flex items-start gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand-deep text-on-brand">
            <Zap aria-hidden className="size-8" fill="currentColor" />
          </span>
          <div>
            <h2 id="quick" className="text-title text-on-brand">
              Szybka sesja
            </h2>
            <p className="mt-1 text-lead text-on-brand-2">
              5 minut, mieszanka zadań z twoich przedmiotów.
            </p>
          </div>
        </div>
        <div className="relative mt-6 max-w-sm">
          {exam ? (
            <p className="rounded-xl bg-brand-deep/60 px-4 py-3 font-bold text-on-brand">
              {exam.name}: zadania pojawią się wkrótce. Twój wybór przedmiotów jest zapisany.
            </p>
          ) : (
            <ButtonLink to="/app/egzaminy" variant="reward" size="lg" block>
              Najpierw wybierz egzamin
            </ButtonLink>
          )}
        </div>
      </section>

      <div className="mt-10 flex items-baseline justify-between gap-3">
        <h2 className="text-heading text-ink">Inne tryby</h2>
        <p className="text-small font-bold text-ink-3">Ruszą razem z treściami</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <div className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-bg sm:p-6">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand">
            <featured.icon aria-hidden className="size-8" strokeWidth={2.25} />
          </span>
          <div>
            <h3 className="text-heading text-bg">{featured.title}</h3>
            <p className="mt-1 text-small text-bg/80">{featured.text}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {habits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col rounded-2xl bg-brand-soft p-4">
              <Icon aria-hidden className="size-8 text-brand-text" strokeWidth={2.25} />
              <h3 className="mt-3 font-extrabold text-ink">{title}</h3>
              <p className="mt-0.5 text-small text-ink-2">{text}</p>
            </div>
          ))}
        </div>
        <ul className="overflow-hidden rounded-2xl bg-surface shadow-sm md:col-span-2 md:grid md:grid-cols-2">
          {quick.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex min-h-16 items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:border-b-0 md:first:border-r"
            >
              <Icon aria-hidden className="size-6 shrink-0 text-brand-text" />
              <span className="font-extrabold text-ink">{title}</span>
              <span className="text-small text-ink-3">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  )
}
