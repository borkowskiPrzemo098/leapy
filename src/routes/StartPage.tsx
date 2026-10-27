import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/ui/Button'
import { InstallCard } from '@/features/pwa/pwa'
import { Page } from '@/ui/Page'

const steps = [
  ['Wybierz egzamin', 'Ósmoklasisty albo maturę i przedmioty, które zdajesz.'],
  ['Ćwicz po kilka minut', 'Krótkie sesje z wyjaśnieniem każdego zadania krok po kroku.'],
  ['Wracaj do błędów', 'Leapy przypomni zadania, które sprawiły ci trudność, zanim je zapomnisz.'],
] as const

/** First-run Start. The real dashboard (streak, goal ring, reviews) replaces this after onboarding in E4. */
export function StartPage() {
  return (
    <Page title="Cześć!">
      <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-on-brand sm:p-8">
        <svg
          aria-hidden
          viewBox="0 0 600 300"
          preserveAspectRatio="xMaxYMax slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d="M300 300V240H380V180H460V120H540V60H600V300Z"
            fill="var(--brand-deep)"
            opacity=".45"
          />
        </svg>
        <div className="relative">
          <h2 className="text-title text-on-brand sm:text-display">Skocz na wyższy&nbsp;poziom.</h2>
          <p className="mt-3 max-w-[40ch] text-lead text-on-brand-2">
            Zacznij od wyboru egzaminu. Bez zakładania konta, a postęp zostaje na tym urządzeniu.
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
        </div>
      </section>

      <div className="mt-4">
        <InstallCard />
      </div>

      <section className="mt-10" aria-labelledby="how">
        <h2 id="how" className="text-heading text-ink">
          Jak to działa
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {steps.map(([title, text], i) => (
            <li
              key={title}
              className="flex items-start gap-4"
              style={{ paddingLeft: `${i * 1.25}rem` }}
            >
              <span
                aria-hidden
                className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-lead font-extrabold text-brand-text"
              >
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="font-extrabold text-ink">{title}</h3>
                <p className="text-small text-ink-2">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Page>
  )
}
