import { clsx } from 'clsx'
import {
  ArrowRight,
  Check,
  FileCheck2,
  Footprints,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  Timer,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog, useSite } from '@/content/data'
import { ButtonLink } from '@/ui/Button'
import { StepLadder } from '@/ui/progress'
import { useHead } from '../head'
import { AppCta, Shell } from '../PublicApp'
import { SITE_NAME, SITE_URL } from '../site'
import { PostCard } from './blog'
import { ExamTile } from './catalog'
import { organizationLd, tasksLabel } from '../seo'

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Lightbulb,
    title: 'Lekcja w pigułce',
    text: 'Najważniejsze w 30 sekund, ściąga ze wzorami i typowe błędy w każdym temacie.',
  },
  {
    icon: Footprints,
    title: 'Wyjaśnienie krok po kroku',
    text: 'Każde zadanie ma pełne rozwiązanie, nie tylko wynik. Widzisz, gdzie był błąd.',
  },
  {
    icon: RotateCcw,
    title: 'Powtórki same się układają',
    text: 'Zadanie z błędem wraca jutro, dobrze rozwiązane coraz rzadziej. Uczysz się mniej, pamiętasz więcej.',
  },
  {
    icon: Timer,
    title: 'Egzamin próbny',
    text: 'Arkusz ćwiczebny z całego przedmiotu, z czasem, punktami i wyjaśnieniami na końcu.',
  },
]

const steps = [
  ['Wybierz egzamin', 'Ósmoklasisty albo maturę i przedmioty, które zdajesz.'],
  ['Ćwicz kilka minut dziennie', 'Krótkie sesje po 10 zadań. Cel dzienny ustawiasz pod siebie.'],
  ['Wracaj do błędów', 'Leapy przypomina je, zanim zdążysz zapomnieć.'],
] as const

/**
 * A small working task built from app pieces (no screenshot): the visitor can answer it,
 * sees the same feedback as in the app and can try again.
 */
function TaskPreview() {
  const options = ['2', '½', '1', '4']
  const correct = 0
  const [picked, setPicked] = useState<number | null>(null)
  const answered = picked !== null
  const right = picked === correct
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {right && (
        <div
          aria-hidden
          className="absolute -top-4 -right-3 z-10 rotate-3 animate-leap rounded-xl bg-reward px-4 py-2 font-extrabold text-on-reward shadow-md"
        >
          +10 XP
        </div>
      )}
      <div className="rounded-2xl bg-surface p-5 text-ink shadow-lg">
        <div aria-hidden className="flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-sunken">
            <div className="h-full w-3/5 rounded-full bg-brand" />
          </div>
          <span className="tabular text-small font-bold text-ink-3">6 / 10</span>
        </div>
        <p className="mt-4 text-micro font-bold text-ink-3">Spróbuj: potęgi i pierwiastki</p>
        <p id="demo-q" className="mt-1 text-heading">
          Ile to 2¹⁰ · 4³ : 8⁵?
        </p>
        <ul aria-labelledby="demo-q" className="mt-4 flex flex-col gap-2">
          {options.map((t, i) => {
            const state = !answered
              ? 'idle'
              : i === correct
                ? 'correct'
                : i === picked
                  ? 'wrong'
                  : 'idle'
            return (
              <li key={t}>
                <button
                  type="button"
                  disabled={answered}
                  aria-pressed={i === picked}
                  onClick={() => setPicked(i)}
                  className={clsx(
                    'flex min-h-12 w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left font-bold',
                    'transition-[background-color,border-color,transform] duration-[var(--dur-fast)] enabled:hover:bg-surface-2 enabled:active:translate-y-[2px] disabled:cursor-default',
                    state === 'correct' &&
                      'border-correct bg-correct-soft shadow-[0_3px_0_var(--correct-deep)]',
                    state === 'wrong' &&
                      'border-wrong bg-wrong-soft shadow-[0_3px_0_var(--wrong-deep)]',
                    state === 'idle' && 'border-line bg-surface shadow-[0_3px_0_var(--line)]',
                  )}
                >
                  <span
                    aria-hidden
                    className={clsx(
                      'grid size-8 place-items-center rounded-md text-small',
                      state === 'correct' && 'bg-correct text-on-feedback',
                      state === 'wrong' && 'bg-wrong text-on-feedback',
                      state === 'idle' && 'bg-surface-2 text-ink-2',
                    )}
                  >
                    {state === 'correct' ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : state === 'wrong' ? (
                      <X className="size-4" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  {t}
                  {state === 'correct' && <span className="sr-only"> (poprawna odpowiedź)</span>}
                </button>
              </li>
            )
          })}
        </ul>
        <div role="status" aria-live="polite">
          {answered && (
            <div
              className={clsx(
                'mt-4 rounded-xl px-4 py-3',
                right ? 'bg-correct-soft' : 'bg-wrong-soft',
              )}
            >
              <p
                className={clsx('font-extrabold', right ? 'text-correct-text' : 'text-wrong-text')}
              >
                {right ? 'Jest! Dobrze.' : 'Nie tym razem.'}
              </p>
              <p className="mt-1 text-small text-ink-2">
                Zapisz 4 i 8 jako potęgi dwójki: 2¹⁰ · 2⁶ : 2¹⁵ = 2¹⁶ : 2¹⁵ = 2.
              </p>
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-lg text-small font-bold text-brand-text hover:underline"
              >
                <RotateCcw aria-hidden className="size-4" /> Spróbuj jeszcze raz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function HomePage() {
  const catalog = useCatalog()
  const site = useSite()
  const tasks =
    catalog.status === 'ready'
      ? catalog.data.exams.reduce((n, e) => n + e.subjects.reduce((m, s) => m + s.tasks, 0), 0)
      : 0
  useHead({
    title: 'Leapy · Nauka do egzaminu ósmoklasisty i matury',
    description:
      'Darmowa nauka do egzaminu ósmoklasisty i matury: lekcje w pigułce, zadania z wyjaśnieniami krok po kroku, powtórki i egzaminy próbne. Bez konta, działa offline.',
    path: '/',
    jsonLd: [
      organizationLd,
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'pl',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web, Android, iOS',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
        inLanguage: 'pl',
      },
    ],
  })

  return (
    <>
      {/* Hero: a solid violet field, copy left and the product itself right */}
      <section className="relative overflow-hidden bg-brand text-on-brand">
        <svg
          aria-hidden
          viewBox="0 0 240 160"
          className="pointer-events-none absolute right-0 bottom-0 h-auto w-[70%] max-w-3xl opacity-70"
        >
          <path d="M0 160V128H60V96H120V64H180V32H240V160Z" fill="var(--brand-deep)" />
        </svg>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-20 md:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-deep/60 px-3 py-1.5 text-small font-bold text-on-brand">
              <ShieldCheck aria-hidden className="size-4" /> Za darmo · bez konta · offline
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,8vw,4.25rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-on-brand">
              Skocz na wyższy poziom.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lead text-on-brand-2">
              Nauka do egzaminu ósmoklasisty i matury po kilka minut dziennie. Lekcje w pigułce,
              zadania z wyjaśnieniami i powtórki, które pilnują, żeby nic nie uciekło.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                to="/app"
                variant="reward"
                size="lg"
                iconEnd={<ArrowRight aria-hidden className="size-5" />}
              >
                Zacznij naukę
              </ButtonLink>
              <ButtonLink to="/egzaminy" variant="secondary" size="lg">
                Zobacz tematy
              </ButtonLink>
            </div>
            {tasks > 0 && (
              <p className="tabular mt-6 text-small font-bold text-on-brand-2">
                {tasksLabel(tasks)} pisanych od podstaw, każde z wyjaśnieniem.
              </p>
            )}
          </div>
          <TaskPreview />
        </div>
      </section>

      <Shell>
        <section aria-labelledby="exams">
          <h2 id="exams" className="text-title text-ink">
            Do którego egzaminu się szykujesz?
          </h2>
          {catalog.status === 'ready' && (
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {catalog.data.exams.map((e) => (
                <li key={e.id}>
                  <ExamTile exam={e} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="how-it-works" className="mt-20">
          <h2 id="how-it-works" className="text-title text-ink">
            Wszystko, czego potrzebujesz do powtórki
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col rounded-2xl bg-surface p-6 shadow-sm">
                <span className="grid size-14 place-items-center rounded-2xl bg-brand text-on-brand">
                  <Icon aria-hidden className="size-7" strokeWidth={2.25} />
                </span>
                <h3 className="mt-5 text-heading text-ink">{title}</h3>
                <p className="mt-2 text-ink-2">{text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl bg-ink p-6 text-bg">
              <WifiOff aria-hidden className="size-8 shrink-0" />
              <p>
                <span className="block font-extrabold">Offline i bez konta</span>
                <span className="text-small text-bg/80">
                  Postęp zostaje na twoim telefonie. Kopię przeniesiesz plikiem.
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-ink p-6 text-bg">
              <FileCheck2 aria-hidden className="size-8 shrink-0" />
              <p>
                <span className="block font-extrabold">Własne zadania, sprawdzane skryptem</span>
                <span className="text-small text-bg/80">
                  Nie kopiujemy arkuszy CKE. Obliczenia w zadaniach sprawdza automat.
                </span>
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="steps"
          className="mt-20 grid items-center gap-10 md:grid-cols-[1fr_1.1fr]"
        >
          <div className="rounded-2xl bg-brand p-6 sm:p-8">
            <StepLadder steps={5} done={3} label="Schody postępu" />
          </div>
          <div>
            <h2 id="steps" className="text-title text-ink">
              Trzy kroki, każdego dnia trochę wyżej
            </h2>
            <ol className="mt-6 flex flex-col gap-5">
              {steps.map(([title, text], i) => (
                <li key={title} className="flex gap-4">
                  <span className="tabular grid size-11 shrink-0 place-items-center rounded-xl bg-reward text-lead font-extrabold text-on-reward">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-heading text-ink">{title}</span>
                    <span className="block text-ink-2">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {site.status === 'ready' && site.data.posts.length > 0 && (
          <section aria-labelledby="blog" className="mt-20">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="blog" className="text-title text-ink">
                Z bloga
              </h2>
              <Link to="/blog" className="inline-flex min-h-12 items-center font-extrabold">
                Wszystkie wpisy
              </Link>
            </div>
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {site.data.posts.slice(0, 3).map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <AppCta
          title="Pierwszy stopień zajmie minutę"
          text="Wybierz egzamin, zrób test na start z 5 zadań i zobacz, od czego zacząć."
        />
      </Shell>
    </>
  )
}
