import { clsx } from 'clsx'
import { ArrowRight, Flame, Lightbulb, Monitor, Moon, Sun, Zap } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import conceptA from '../../brand/concepts/A-skok-l.svg?raw'
import conceptB from '../../brand/concepts/B-schody.svg?raw'
import conceptC from '../../brand/concepts/C-ikona.svg?raw'
import { Logo, LogoMark } from '@/brand/Logo'
import { applyTheme, readThemePref, watchSystemTheme, type ThemePref } from '@/lib/theme'
import { AnswerOption, type AnswerState } from '@/ui/AnswerOption'
import { Button } from '@/ui/Button'
import { Chip, Segmented, Skeleton, Switch } from '@/ui/controls'
import { GoalRing, ProgressBar, StepLadder } from '@/ui/progress'

// E0 living style guide. In E1 it moves to /dev/ui and the app shell takes "/".

const themeOptions = [
  { value: 'light' as const, label: 'Jasny', icon: <Sun aria-hidden className="size-4" /> },
  { value: 'dark' as const, label: 'Ciemny', icon: <Moon aria-hidden className="size-4" /> },
  { value: 'auto' as const, label: 'Auto', icon: <Monitor aria-hidden className="size-4" /> },
]

function Section({
  title,
  lead,
  children,
}: {
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
      <h2 className="text-title text-ink">{title}</h2>
      {lead && <p className="mt-2 max-w-[60ch] text-ink-2">{lead}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function DesignSystemPage() {
  const [theme, setTheme] = useState<ThemePref>(readThemePref)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => watchSystemTheme(() => theme), [theme])
  useEffect(() => {
    if (reduceMotion) document.documentElement.dataset.motion = 'reduce'
    else delete document.documentElement.dataset.motion
  }, [reduceMotion])

  const changeTheme = (t: ThemePref) => {
    setTheme(t)
    applyTheme(t)
  }

  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo height={34} />
          <div className="sm:w-80">
            <Segmented
              compact
              label="Motyw"
              value={theme}
              options={themeOptions}
              onChange={changeTheme}
            />
          </div>
        </div>
      </header>

      <main>
        <StartPreview />

        <Section
          title="Logo: trzy koncepcje"
          lead="Każda opowiada skok na wyższy poziom inaczej. Rekomendacja: C. Działa od favikony 16 px po billboard, a pełny wordmark dostaje obok."
        >
          <LogoConcepts />
        </Section>

        <Section
          title="Ekran zadania"
          lead="Duże odpowiedzi, natychmiastowa informacja zwrotna. Poprawna odpowiedź podskakuje, błędna drga. Na komputerze odpowiadasz klawiszami 1–4."
        >
          <TaskDemo />
        </Section>

        <Section
          title="Postęp"
          lead="Poziomy to stopnie: każdy ukończony krok jest blokiem wyżej od poprzedniego."
        >
          <ProgressDemo />
        </Section>

        <Section title="Przyciski">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
              <Button size="lg" block iconEnd={<ArrowRight aria-hidden className="size-5" />}>
                Zacznij naukę
              </Button>
              <Button variant="secondary" block>
                Pomiń
              </Button>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" icon={<Lightbulb aria-hidden className="size-5" />}>
                  Podpowiedź
                </Button>
                <Button loading>Zapisuję</Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-brand p-5">
              <Button
                variant="reward"
                size="lg"
                block
                icon={<Zap aria-hidden className="size-5" />}
              >
                Odbierz 50 XP
              </Button>
              <Button variant="secondary" block disabled>
                Niedostępne offline
              </Button>
              <p className="text-small text-on-brand-2">
                Żółty pojawia się tylko przy nagrodach, seriach i postępie.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Kolory"
          lead="Tokeny w src/styles/tokens.css. Kontrast tekstu co najmniej 4,5:1 w obu motywach."
        >
          <Swatches />
        </Section>

        <Section
          title="Typografia"
          lead="Plus Jakarta Sans, hostowany lokalnie. Duże, ciężkie nagłówki i spokojny tekst."
        >
          <TypeScale />
        </Section>

        <Section title="Ustawienia i stany">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <Switch
                checked={reduceMotion}
                onChange={setReduceMotion}
                label="Ogranicz animacje"
                description="Wyłącza skoki, konfetti i przejścia."
              />
              <Switch
                checked
                label="Przypomnienie o nauce"
                description="Codziennie o 18:00"
                onChange={() => {}}
              />
            </div>
            <div
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5"
              aria-label="Ładowanie"
            >
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </Section>
      </main>
    </div>
  )
}

function StartPreview() {
  return (
    <div className="px-2 pt-3 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-brand text-on-brand">
        <div className="relative grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10">
          <StairsBackdrop />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
                <Chip tone="reward">
                  <Flame aria-hidden className="size-4" /> 12 dni z rzędu
                </Chip>
                <Chip tone="inverse">Matura za 186 dni</Chip>
              </div>
              <DailyRing size={96} className="sm:hidden" />
            </div>
            <h1 className="mt-5 text-display text-on-brand sm:text-[3.25rem]">
              Skocz na wyższy&nbsp;poziom.
            </h1>
            <p className="mt-3 max-w-[38ch] text-[1.0625rem] text-on-brand-2">
              Dziś zostały ci 4 minuty do celu. Wracasz do tematu „Funkcja kwadratowa”, zadanie 7 z
              12.
            </p>
            <div className="mt-6 max-w-sm">
              <Button
                variant="reward"
                size="lg"
                block
                iconEnd={<ArrowRight aria-hidden className="size-5" />}
              >
                Kontynuuj
              </Button>
            </div>
          </div>
          <DailyRing size={152} className="relative hidden justify-self-end sm:block" />
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-5xl px-2 text-micro text-ink-3">
        Podgląd komponentów. Liczby w tej karcie są przykładowe.
      </p>
    </div>
  )
}

function DailyRing({ size, className }: { size: number; className?: string }) {
  return (
    <div className={className}>
      <GoalRing value={6} goal={10} size={size} label="Dzienny cel: 6 z 10 minut">
        <div>
          <div className="tabular leading-none font-extrabold" style={{ fontSize: size * 0.24 }}>
            6
          </div>
          <div className="text-micro font-bold text-on-brand-2 sm:text-small">z 10 min</div>
        </div>
      </GoalRing>
    </div>
  )
}

/** The brand staircase, drawn as deeper-violet blocks climbing to the right. */
function StairsBackdrop() {
  return (
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
  )
}

const concepts = [
  {
    id: 'A',
    name: 'Skok L',
    svg: conceptA,
    note: 'Litera l wybija się, przelatuje łukiem nad „eap” i ląduje jako y stopień wyżej. Najbardziej opowiadające, ale potrzebuje szerokości: w ikonie aplikacji znika.',
  },
  {
    id: 'B',
    name: 'Schody',
    svg: conceptB,
    note: 'Litery stoją na rosnących stopniach, p jest w trakcie skoku. Czytelny pomysł na dużych formatach, w małych rozmiarach wygląda jak literówka.',
  },
  {
    id: 'C',
    name: 'Ikona',
    svg: conceptC,
    note: 'Litera L, której stopa odbija się w kropkowany łuk zakończony iskrą wyżej. Rozpoznawalna nawet jako favikona, działa jako ikona PWA i awatar na Instagramie.',
    pick: true,
  },
]

function LogoConcepts() {
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.15fr]">
      {concepts.map((c) => (
        <article
          key={c.id}
          className={clsx(
            'flex flex-col rounded-2xl border-2 bg-surface p-5',
            c.pick ? 'border-brand shadow-md' : 'border-line',
          )}
        >
          <div className="grid h-40 place-items-center rounded-xl bg-bg p-4 text-ink">
            <div
              className={clsx(
                c.id === 'C' ? 'w-28' : 'w-full max-w-64',
                '[&>svg]:h-auto [&>svg]:w-full',
              )}
              dangerouslySetInnerHTML={{ __html: c.svg }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <h3 className="text-heading text-ink">
              {c.id}. {c.name}
            </h3>
            {c.pick && <Chip tone="brand">Rekomendacja</Chip>}
          </div>
          <p className="mt-2 text-small text-ink-2">{c.note}</p>
          {c.pick && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <LogoMark size={16} />
              <LogoMark size={32} />
              <LogoMark size={48} />
              <span className="text-micro font-bold text-ink-3">16 · 32 · 48 px</span>
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

const options = ['4', '8', '2', '¼']
const CORRECT = 0

function TaskDemo() {
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null

  const pick = useCallback(
    (i: number) => {
      if (!answered) setPicked(i)
    },
    [answered],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const i = Number(e.key) - 1
      if (i >= 0 && i < options.length && !(e.target instanceof HTMLInputElement)) pick(i)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pick])

  const stateOf = (i: number): AnswerState => {
    if (!answered) return 'idle'
    if (i === picked) return i === CORRECT ? 'correct' : 'wrong'
    return i === CORRECT ? 'missed' : 'idle'
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <Chip>Potęgi · poziom 2</Chip>
          <span className="tabular text-small font-bold text-ink-3">3 / 10</span>
        </div>
        <ProgressBar value={3} max={10} label="Postęp sesji" className="mt-4" />
        <p className="mt-6 text-heading text-ink">
          Ile wynosi wartość wyrażenia{' '}
          <span className="whitespace-nowrap">
            2<sup>3</sup> · 2<sup>−1</sup>
          </span>
          ?
        </p>
        <div className="mt-5 flex flex-col gap-3">
          {options.map((o, i) => (
            <AnswerOption
              key={o}
              keyLabel={String(i + 1)}
              state={stateOf(i)}
              disabled={answered}
              onSelect={() => pick(i)}
            >
              {o}
            </AnswerOption>
          ))}
        </div>
      </div>

      <div
        aria-live="polite"
        className={clsx(
          'flex flex-col rounded-2xl p-5 sm:p-6',
          !answered && 'border border-dashed border-line-strong',
          answered && picked === CORRECT && 'bg-correct-soft',
          answered && picked !== CORRECT && 'bg-wrong-soft',
        )}
      >
        {!answered ? (
          <p className="m-auto max-w-[28ch] text-center text-ink-3">
            Wybierz odpowiedź, a tutaj pojawi się wyjaśnienie krok po kroku.
          </p>
        ) : (
          <>
            <p
              className={clsx(
                'text-title',
                picked === CORRECT ? 'text-correct-text' : 'text-wrong-text',
              )}
            >
              {picked === CORRECT ? 'Jest! +10 XP' : 'Prawie. Zobacz dlaczego'}
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink">
              <li>Przy mnożeniu potęg o tej samej podstawie dodajemy wykładniki.</li>
              <li>3 + (−1) = 2, więc wyrażenie to 2².</li>
              <li>2² = 4.</li>
            </ol>
            <div className="mt-auto flex gap-3 pt-6">
              <Button
                variant={picked === CORRECT ? 'primary' : 'secondary'}
                onClick={() => setPicked(null)}
                block
              >
                Jeszcze raz
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProgressDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-heading text-ink">Poziom 4</h3>
          <span className="tabular text-small font-bold text-ink-3">
            6 z 10 kroków do poziomu 5
          </span>
        </div>
        <StepLadder steps={10} done={6} label="Postęp poziomu: 6 z 10 kroków" className="mt-5" />
      </div>
      <div className="flex flex-col justify-center gap-5 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {[
          ['Funkcja kwadratowa', 0.82, 'correct'],
          ['Ciągi', 0.54, 'brand'],
          ['Planimetria', 0.21, 'reward'],
        ].map(([name, v, tone]) => (
          <div key={name as string}>
            <div className="mb-2 flex justify-between text-small font-bold">
              <span className="text-ink">{name}</span>
              <span className="tabular text-ink-3">{Math.round((v as number) * 100)}%</span>
            </div>
            <ProgressBar
              value={v as number}
              label={`Skuteczność: ${name as string}`}
              tone={tone as 'brand' | 'reward' | 'correct'}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const swatches = [
  ['brand', 'Marka', 'bg-brand text-on-brand'],
  ['brand-deep', 'Marka głęboka', 'bg-brand-deep text-on-brand'],
  ['brand-soft', 'Marka miękka', 'bg-brand-soft text-brand-text'],
  ['reward', 'Nagroda', 'bg-reward text-on-reward'],
  ['correct', 'Poprawnie', 'bg-correct-soft text-correct-text'],
  ['wrong', 'Błędnie', 'bg-wrong-soft text-wrong-text'],
  ['ink', 'Tekst', 'bg-ink text-bg'],
  ['surface', 'Powierzchnia', 'bg-surface text-ink border border-line'],
]

function Swatches() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {swatches.map(([token, name, cls]) => (
        <div key={token} className={clsx('flex min-h-28 flex-col justify-end rounded-xl p-4', cls)}>
          <span className="font-bold">{name}</span>
          <code className="text-micro opacity-80">--{token}</code>
        </div>
      ))}
    </div>
  )
}

function TypeScale() {
  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="text-display text-ink">Matura za 186 dni</p>
      <p className="text-title text-ink">Funkcja kwadratowa</p>
      <p className="text-heading text-ink">Postać kanoniczna i wierzchołek paraboli</p>
      <p className="max-w-[65ch] text-body text-ink-2">
        Każdą funkcję kwadratową da się zapisać w postaci kanonicznej. Z niej od razu odczytasz
        współrzędne wierzchołka, oś symetrii i zbiór wartości. Zażółć gęślą jaźń.
      </p>
      <p className="text-small text-ink-3">Tekst pomocniczy · 14 px</p>
    </div>
  )
}
