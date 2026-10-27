import { clsx } from 'clsx'
import {
  ArrowLeft,
  BookOpen,
  Check,
  Coffee,
  GraduationCap,
  Rocket,
  School,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { subjectLabel, useCatalog } from '@/content/data'
import { setOnboarded, useProfile } from '@/state/profile'
import { useStudy } from '@/state/study'
import { Button, ButtonLink } from '@/ui/Button'
import { IconButton } from '@/ui/controls'
import { LoadError } from '@/ui/LoadError'
import { StairsBackdrop } from '@/ui/Page'
import { ProgressBar, StepLadder } from '@/ui/progress'

// First run in about 30 seconds: exam → subjects → daily goal → optional 5-task test.
// Every step can be changed later (Egzaminy, Profil); nothing here needs an account.

const GOALS = [
  { daily: 5, label: 'Na luzie', text: '5 zadań dziennie, kilka minut', icon: Coffee },
  { daily: 10, label: 'Regularnie', text: '10 zadań dziennie, ok. 10 minut', icon: Target },
  { daily: 20, label: 'Na poważnie', text: '20 zadań dziennie, ok. 20 minut', icon: Rocket },
] as const

const TITLES = [
  'Do czego się przygotowujesz?',
  'Które przedmioty zdajesz?',
  'Ile dziennie?',
  'Gotowe',
]

export default function OnboardingPage() {
  const catalog = useCatalog()
  const { exam, subjects, chooseExam, toggleSubject } = useStudy()
  const { goals, setGoals } = useProfile()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const h1 = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    document.title = `${TITLES[step] ?? 'Witaj'} · Leapy`
    if (step > 0) h1.current?.focus({ preventScroll: true })
  }, [step])

  if (catalog.status === 'loading') return <ScreenSkeleton />
  if (catalog.status === 'error') return <LoadError message={catalog.error} />
  const chosen = catalog.data.exams.find((e) => e.id === exam)
  const playable = chosen?.subjects.some((s) => subjects.includes(s.id) && s.tasks > 0) ?? false

  const finish = (to: string) => {
    setOnboarded()
    navigate(to, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="mx-auto flex h-16 w-full max-w-xl items-center gap-3 px-3 pt-[env(safe-area-inset-top)]">
        {step > 0 && step < 3 ? (
          <IconButton label="Wstecz" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft aria-hidden className="size-6" />
          </IconButton>
        ) : (
          <span className="size-12" />
        )}
        <ProgressBar value={step + 1} max={4} label="Krok wprowadzenia" className="flex-1" />
        {step < 3 ? (
          <button
            type="button"
            onClick={() => finish('/app')}
            className="min-h-12 rounded-lg px-3 text-small font-bold text-ink-2 hover:bg-surface-2"
          >
            Pomiń
          </button>
        ) : (
          <span className="size-12" />
        )}
      </header>

      <main id="main" className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-32 sm:px-6">
        <p className="text-small font-bold text-ink-3">Krok {step + 1} z 4</p>
        <h1 ref={h1} tabIndex={-1} className="mt-1 text-title text-ink outline-none">
          {TITLES[step]}
        </h1>

        {step === 0 && (
          <div className="relative mt-5 overflow-hidden rounded-2xl bg-brand p-6 pb-20 text-on-brand">
            <StairsBackdrop className="w-1/2 max-w-56" />
            <p className="relative text-heading text-on-brand">Skocz na wyższy poziom.</p>
            <p className="relative mt-2 max-w-[34ch] text-on-brand-2">
              Trzy pytania i zaczynasz. Bez konta: postęp zostaje na tym urządzeniu.
            </p>
          </div>
        )}
        {step === 0 && (
          <ul className="mt-5 flex flex-col gap-3">
            {catalog.data.exams.map((e) => (
              <li key={e.id}>
                <Choice
                  on={exam === e.id}
                  onClick={() => {
                    chooseExam(e.id)
                    setStep(1)
                  }}
                  title={e.name}
                  text={e.audience}
                  icon={e.id === 'matura' ? GraduationCap : School}
                />
              </li>
            ))}
          </ul>
        )}

        {step === 1 && chosen && (
          <>
            <p className="mt-2 text-ink-2">Zaznacz wszystkie. Zmienisz to później w Egzaminach.</p>
            <ul className="mt-6 flex flex-col gap-3">
              {chosen.subjects.map((s) => (
                <li key={s.id}>
                  <Choice
                    multi
                    on={subjects.includes(s.id)}
                    onClick={() => toggleSubject(chosen.id, s.id)}
                    title={subjectLabel(s)}
                    icon={BookOpen}
                    text={s.tasks > 0 ? `${s.tasks} zadań` : 'Zadania w przygotowaniu'}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 2 && (
          <>
            <p className="mt-2 text-ink-2">
              Cel dzienny to liczba zadań i fiszek. Krótko, ale codziennie, działa najlepiej.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {GOALS.map((g) => (
                <li key={g.daily}>
                  <Choice
                    on={goals.daily === g.daily}
                    onClick={() => {
                      setGoals({ daily: g.daily })
                      setStep(3)
                    }}
                    title={g.label}
                    text={g.text}
                    icon={g.icon}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

        {step === 3 && (
          <div className="mt-6">
            <div className="rounded-2xl bg-brand p-6 text-on-brand">
              <StepLadder steps={5} done={1} label="Pierwszy stopień" />
              <p className="mt-5 text-lead text-on-brand-2">
                {playable
                  ? 'Zrób krótki test na start: 5 zadań z twoich przedmiotów. Zobaczysz, od czego zacząć, i od razu wejdziesz na pierwszy stopień.'
                  : 'Twoje przedmioty nie mają jeszcze zadań. Dodajemy je partiami; do tego czasu możesz przejrzeć tematy.'}
              </p>
            </div>
          </div>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex max-w-xl flex-col gap-2 px-4 py-3 sm:px-6">
          {step === 1 && (
            <Button size="lg" block disabled={!subjects.length} onClick={() => setStep(2)}>
              Dalej
            </Button>
          )}
          {step === 3 &&
            (playable ? (
              <>
                <Button
                  size="lg"
                  block
                  variant="reward"
                  onClick={() => finish('/app/sesja/diagnoza')}
                >
                  Zrób test na start
                </Button>
                <Button size="lg" block variant="secondary" onClick={() => finish('/app')}>
                  Później
                </Button>
              </>
            ) : (
              <ButtonLink to="/app/egzaminy" size="lg" block onClick={() => setOnboarded()}>
                Przejrzyj tematy
              </ButtonLink>
            ))}
          {(step === 0 || step === 2) && (
            <p className="py-3 text-center text-small text-ink-3">
              Stuknij odpowiedź, żeby przejść dalej.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Choice({
  on,
  onClick,
  title,
  text,
  multi = false,
  icon: Icon,
}: {
  icon: LucideIcon
  on: boolean
  onClick: () => void
  title: string
  text: string
  multi?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={clsx(
        'mb-[3px] flex min-h-18 w-full items-center gap-4 rounded-xl border-2 px-4 py-3 text-left transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)]',
        on
          ? 'border-brand bg-brand-soft shadow-[0_3px_0_var(--brand)]'
          : 'border-line bg-surface shadow-[0_3px_0_var(--line)] hover:bg-surface-2',
      )}
    >
      <span
        aria-hidden
        className={clsx(
          'grid size-12 shrink-0 place-items-center rounded-xl transition-colors duration-[var(--dur-fast)]',
          on ? 'bg-brand text-on-brand' : 'bg-brand-soft text-brand-text',
        )}
      >
        <Icon className="size-6" strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-ink">{title}</span>
        <span className="block text-small text-ink-2">{text}</span>
      </span>
      <span
        aria-hidden
        className={clsx(
          'grid size-8 shrink-0 place-items-center border-2',
          multi ? 'rounded-md' : 'rounded-full',
          on ? 'border-brand bg-brand text-on-brand' : 'border-line-strong',
        )}
      >
        {on && <Check className="size-5" strokeWidth={3} />}
      </span>
    </button>
  )
}
