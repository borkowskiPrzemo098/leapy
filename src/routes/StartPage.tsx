import { clsx } from 'clsx'
import { ArrowRight } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useCatalog } from '@/content/data'
import { TodayCard } from '@/features/gamify/TodayCard'
import { isOnboarded } from '@/state/profile'
import { InstallCard } from '@/features/pwa/pwa'
import { useStudy } from '@/state/study'
import { ButtonLink } from '@/ui/Button'
import { Page, StairsBackdrop } from '@/ui/Page'

const steps = [
  ['Wybierz egzamin', 'Zaznacz egzamin i przedmioty, które zdajesz.'],
  ['Ćwicz po kilka minut', 'Każde zadanie ma wyjaśnienie krok po kroku.'],
  ['Wracaj do błędów', 'Leapy przypomni je, zanim zdążysz zapomnieć.'],
] as const

const blockTone = (i: number) =>
  i === steps.length - 1
    ? 'bg-reward text-on-reward shadow-[inset_0_-4px_0_var(--reward-deep)]'
    : 'bg-brand text-on-brand shadow-[inset_0_-4px_0_var(--brand-deep)]'

/** Start: new learners go to onboarding first; with an exam chosen, "Jak to działa" becomes today's goals. */
export function StartPage() {
  if (!isOnboarded()) return <Navigate to="/app/witaj" replace />
  return <Dashboard />
}

function Dashboard() {
  const { exam: examId, subjects } = useStudy()
  const catalog = useCatalog()
  const exam =
    catalog.status === 'ready' ? catalog.data.exams.find((e) => e.id === examId) : undefined
  const chosen = exam ? exam.subjects.filter((s) => subjects.includes(s.id)) : []
  const playable = chosen.some((s) => s.tasks > 0)

  return (
    <Page title="Cześć!" wide>
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-stretch">
        <section className="relative overflow-hidden rounded-2xl bg-brand p-6 pb-28 text-on-brand sm:p-8 sm:pb-32">
          <StairsBackdrop className="w-[62%] max-w-80" />
          <div className="relative">
            {exam ? (
              <>
                <h2 className="text-display text-on-brand">{exam.name}</h2>
                <p className="mt-3 max-w-[40ch] text-lead text-on-brand-2">
                  {chosen.length > 0
                    ? `Wybrane: ${chosen.map((s) => (s.level ? `${s.name} (poziom ${s.level})` : s.name)).join(', ')}.${
                        playable ? '' : ' Zadania do tych przedmiotów dodajemy partiami.'
                      }`
                    : 'Zaznacz jeszcze przedmioty, które zdajesz.'}
                </p>
                <ButtonLink
                  to={playable ? '/app/sesja/szybka' : '/app/egzaminy'}
                  variant="reward"
                  size="lg"
                  block
                  className="mt-6 max-w-sm"
                  iconEnd={<ArrowRight aria-hidden className="size-5" />}
                >
                  {playable
                    ? 'Szybka sesja · 10 zadań'
                    : chosen.length > 0
                      ? 'Zmień przedmioty'
                      : 'Wybierz przedmioty'}
                </ButtonLink>
              </>
            ) : (
              <>
                <h2 className="text-display text-on-brand">Skocz na wyższy&nbsp;poziom.</h2>
                <p className="mt-3 max-w-[40ch] text-lead text-on-brand-2">
                  Zacznij od wyboru egzaminu. Bez zakładania konta, a postęp zostaje na tym
                  urządzeniu.
                </p>
                <ButtonLink
                  to="/app/egzaminy"
                  variant="reward"
                  size="lg"
                  block
                  className="mt-6 max-w-sm"
                  iconEnd={<ArrowRight aria-hidden className="size-5" />}
                >
                  Wybierz egzamin
                </ButtonLink>
              </>
            )}
          </div>
        </section>

        {exam ? (
          <TodayCard />
        ) : (
          <section aria-labelledby="how" className="rounded-2xl bg-surface p-5 shadow-sm sm:p-6">
            <h2 id="how" className="text-heading text-ink">
              Jak to działa
            </h2>
            {/* The climb: three solid blocks rising left to right, then the steps in full measure */}
            <div aria-hidden className="mt-5 grid grid-cols-3 items-end gap-2">
              {steps.map(([title], i) => (
                <div
                  key={title}
                  className={clsx(
                    'grid place-items-start rounded-t-lg rounded-b-sm p-2.5 text-lead font-extrabold',
                    blockTone(i),
                  )}
                  style={{ height: `${2.75 + i * 1.5}rem` }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <ol className="mt-5 flex flex-col gap-4">
              {steps.map(([title, text], i) => (
                <li key={title} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={clsx(
                      'grid size-8 shrink-0 place-items-center rounded-md text-small font-extrabold',
                      blockTone(i),
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-ink">{title}</h3>
                    <p className="text-small text-ink-2">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <div className="mt-4 md:max-w-[58%]">
        <InstallCard />
      </div>
    </Page>
  )
}
