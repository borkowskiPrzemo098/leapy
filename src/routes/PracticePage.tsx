import {
  BookmarkX,
  ChevronRight,
  Layers,
  RotateCcw,
  Target,
  Timer,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '@/content/data'
import { practiceCounts, type PracticeCounts } from '@/features/study/queries'
import { useStudy } from '@/state/study'
import { ButtonLink } from '@/ui/Button'
import { Page, StairsBackdrop } from '@/ui/Page'

type Mode = { icon: LucideIcon; title: string; text: string; to: string }

// Three sizes on purpose: the mock exam is the headline, review modes are the daily
// habit (filled tiles), topic practice and flashcards are quick rows.
const featured: Mode = {
  icon: Timer,
  title: 'Egzamin próbny',
  text: 'Arkusz z całego przedmiotu: czas, punkty i wyjaśnienia na końcu.',
  to: '/app/egzamin-probny',
}
const habits: (Mode & { count: keyof PracticeCounts; none: string })[] = [
  {
    icon: RotateCcw,
    title: 'Powtórki',
    text: 'na dziś',
    none: 'Na dziś nic',
    to: '/app/sesja/powtorki',
    count: 'due',
  },
  {
    icon: BookmarkX,
    title: 'Moje błędy',
    text: 'do poprawy',
    none: 'Brak błędów',
    to: '/app/sesja/bledy',
    count: 'mistakes',
  },
]
const blitz: Mode = {
  icon: Zap,
  title: 'Błyskawica',
  text: '60 sekund, jak najwięcej dobrych odpowiedzi. Pobij własny rekord.',
  to: '/app/sesja/blyskawica',
}
const quick: Mode[] = [
  { icon: Target, title: 'Wybrany temat', text: 'Jeden temat, aż wejdzie.', to: '/app/egzaminy' },
  { icon: Layers, title: 'Fiszki', text: 'Wzory i definicje z lekcji.', to: '/app/sesja/fiszki' },
]

export default function PracticePage() {
  const { exam: examId, subjects } = useStudy()
  const catalog = useCatalog()
  const exam =
    catalog.status === 'ready' ? catalog.data.exams.find((e) => e.id === examId) : undefined
  const ready = exam?.subjects.some((s) => subjects.includes(s.id) && s.tasks > 0) ?? false
  const [counts, setCounts] = useState<PracticeCounts | null>(null)
  useEffect(() => {
    let alive = true
    void practiceCounts().then((c) => alive && setCounts(c))
    return () => {
      alive = false
    }
  }, [])

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
          {ready ? (
            <ButtonLink to="/app/sesja/szybka" variant="reward" size="lg" block>
              Zacznij szybką sesję
            </ButtonLink>
          ) : exam ? (
            <>
              <p className="rounded-xl bg-brand-deep/60 px-4 py-3 font-bold text-on-brand">
                {subjects.length
                  ? 'Twoje przedmioty nie mają jeszcze zadań. Dodajemy je partiami.'
                  : 'Zaznacz przedmioty, które zdajesz.'}
              </p>
              <ButtonLink to="/app/egzaminy" variant="secondary" block className="mt-3">
                {subjects.length ? 'Zmień przedmioty' : 'Wybierz przedmioty'}
              </ButtonLink>
            </>
          ) : (
            <ButtonLink to="/app/egzaminy" variant="reward" size="lg" block>
              Najpierw wybierz egzamin
            </ButtonLink>
          )}
        </div>
      </section>

      <h2 className="mt-10 text-heading text-ink">Inne tryby</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr]">
        <Link
          to={featured.to}
          className="flex items-center gap-4 rounded-2xl bg-ink p-5 text-bg no-underline transition-transform duration-[var(--dur-fast)] hover:-translate-y-0.5 sm:p-6"
        >
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-brand text-on-brand">
            <featured.icon aria-hidden className="size-8" strokeWidth={2.25} />
          </span>
          <div>
            <h3 className="text-heading text-bg">{featured.title}</h3>
            <p className="mt-1 text-small text-bg/80">{featured.text}</p>
          </div>
          <ChevronRight aria-hidden className="ml-auto size-6 shrink-0" />
        </Link>
        {ready && (
          <Link
            to={blitz.to}
            className="flex items-center gap-4 rounded-2xl bg-reward p-5 text-on-reward no-underline shadow-[inset_0_-5px_0_var(--reward-deep)] transition-transform duration-[var(--dur-fast)] hover:-translate-y-0.5 sm:p-6 md:col-span-2"
          >
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-on-reward text-reward">
              <blitz.icon aria-hidden className="size-8" fill="currentColor" />
            </span>
            <div>
              <h3 className="text-heading text-on-reward">{blitz.title}</h3>
              <p className="mt-1 text-small text-on-reward">{blitz.text}</p>
            </div>
            <ChevronRight aria-hidden className="ml-auto size-6 shrink-0" />
          </Link>
        )}
        <div className="grid grid-cols-2 gap-3">
          {habits.map(({ icon: Icon, title, text, none, to, count }) => {
            const n = counts?.[count]
            return (
              <Link
                key={title}
                to={to}
                className="flex flex-col rounded-2xl bg-brand-soft p-4 no-underline transition-transform duration-[var(--dur-fast)] hover:-translate-y-0.5"
              >
                <Icon aria-hidden className="size-8 text-brand-text" strokeWidth={2.25} />
                <h3 className="mt-3 font-extrabold text-ink">{title}</h3>
                <p className="tabular mt-0.5 text-small text-ink-2">
                  {n === undefined ? ' ' : n > 0 ? `${n} ${text}` : none}
                </p>
              </Link>
            )
          })}
        </div>
        <ul className="overflow-hidden rounded-2xl bg-surface shadow-sm md:col-span-2 md:grid md:grid-cols-2">
          {quick.map(({ icon: Icon, title, text, to }) => (
            <li
              key={title}
              className="border-b border-line last:border-b-0 md:border-b-0 md:first:border-r"
            >
              <Link
                to={to}
                className="flex min-h-16 items-center gap-3 px-4 py-3 no-underline hover:bg-surface-2"
              >
                <Icon aria-hidden className="size-6 shrink-0 text-brand-text" />
                <span className="min-w-0">
                  <span className="block font-extrabold text-ink">{title}</span>
                  <span className="block text-small text-ink-3">{text}</span>
                </span>
                <ChevronRight aria-hidden className="ml-auto size-5 shrink-0 text-ink-3" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  )
}
