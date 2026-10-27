import { BookmarkX, ChevronRight, Flame, RotateCcw, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { loadCatalog, subjectLabel } from '@/content/data'
import type { Catalog } from '@/content/schema'
import {
  activityByDay,
  dailySeries,
  longestStreak,
  topicMastery,
  totals,
  type DayActivity,
  type TopicMastery,
} from '@/engine/stats'
import { streakWithFreezes } from '@/engine/gamify'
import { BadgeGrid } from '@/features/gamify/BadgeGrid'
import { ActivityCalendar, DailyBars } from '@/features/stats/charts'
import { daysLabel, formatDate, formatDuration } from '@/features/stats/format'
import { practiceCounts, type PracticeCounts } from '@/features/study/queries'
import { progress, type SessionRecord } from '@/storage'
import { ButtonLink } from '@/ui/Button'
import { LoadError } from '@/ui/LoadError'
import { ClimbArt, EmptyState, Page } from '@/ui/Page'
import { ProgressBar } from '@/ui/progress'

interface Data {
  now: number
  catalog: Catalog
  activity: Map<string, DayActivity>
  mastery: Map<string, TopicMastery>
  mocks: SessionRecord[]
  counts: PracticeCounts
}

async function loadData(): Promise<Data> {
  const store = progress()
  const [catalog, attempts, sessions, counts] = await Promise.all([
    loadCatalog(),
    store.attempts(),
    store.sessions(500),
    practiceCounts(),
  ])
  return {
    now: Date.now(),
    catalog,
    activity: activityByDay(attempts, sessions),
    mastery: topicMastery(attempts),
    mocks: sessions.filter((s) => s.mode === 'mock').slice(0, 5),
    counts,
  }
}

export default function ProgressPage() {
  const [data, setData] = useState<Data | { error: string } | null>(null)
  useEffect(() => {
    let alive = true
    loadData().then(
      (d) => alive && setData(d),
      (e: unknown) => alive && setData({ error: e instanceof Error ? e.message : String(e) }),
    )
    return () => {
      alive = false
    }
  }, [])

  if (!data) return <ScreenSkeleton />
  if ('error' in data) return <LoadError message={data.error} />
  if (data.activity.size === 0)
    return (
      <Page title="Postępy">
        <EmptyState
          art={<ClimbArt done={0} />}
          title="Tu zbudujesz swoje schody"
          action={
            <ButtonLink block to="/app/cwicz">
              Przejdź do ćwiczeń
            </ButtonLink>
          }
        >
          Po pierwszej sesji zobaczysz tu skuteczność w każdym temacie, serię dni i kalendarz nauki.
        </EmptyState>
      </Page>
    )
  return <Stats data={data} />
}

function Stats({ data }: { data: Data }) {
  const { now, catalog, activity, mastery, mocks, counts } = data
  const days = new Set(activity.keys())
  const streak = streakWithFreezes(days, now).current
  const t = totals(activity)

  // Topic names and task counts from the catalog, keyed like mastery: "exam/subject/topic"
  const topics = new Map<string, { name: string; tasks: number; subject: string }>()
  const subjects = new Map<string, string>()
  for (const e of catalog.exams)
    for (const s of e.subjects) {
      subjects.set(`${e.id}/${s.id}`, `${e.name} · ${subjectLabel(s)}`)
      for (const sec of s.sections)
        for (const tp of sec.topics)
          topics.set(`${e.id}/${s.id}/${tp.id}`, {
            name: tp.name,
            tasks: tp.tasks,
            subject: `${e.id}/${s.id}`,
          })
    }
  const rows = [...mastery.values()].filter((m) => topics.has(m.key))
  const weak = rows
    .filter((m) => m.attempts >= 3 && m.correct / m.attempts < 0.8)
    .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts)
    .slice(0, 3)
  const bySubject = new Map<string, TopicMastery[]>()
  for (const m of rows) {
    const key = `${m.exam}/${m.subject}`
    bySubject.set(key, [...(bySubject.get(key) ?? []), m])
  }

  const figures = [
    { label: 'Rozwiązane zadania', value: t.answered.toLocaleString('pl-PL') },
    { label: 'Dobre odpowiedzi', value: `${Math.round(t.accuracy * 100)}%` },
    { label: 'Czas nauki', value: formatDuration(t.ms) },
  ]

  return (
    <Page title="Postępy" wide>
      <section
        aria-label="Podsumowanie"
        className="grid gap-3 rounded-2xl bg-brand p-5 text-on-brand sm:p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8"
      >
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-reward text-on-reward">
            <Flame aria-hidden className="size-8" fill="currentColor" />
          </span>
          <div>
            <p className="text-small font-bold text-on-brand-2">Seria</p>
            <p className="tabular text-display text-on-brand">{daysLabel(streak)}</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2">
          {figures.map((f) => (
            <div key={f.label} className="rounded-xl bg-brand-deep/55 px-3 py-3 sm:px-4">
              <dt className="text-micro font-bold text-on-brand-2">{f.label}</dt>
              <dd className="tabular mt-0.5 text-heading text-on-brand">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {(counts.due > 0 || counts.mistakes > 0) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {counts.due > 0 && (
            <TodoLink
              to="/app/sesja/powtorki"
              icon={<RotateCcw aria-hidden className="size-6" />}
              title="Powtórki na dziś"
              count={counts.due}
            />
          )}
          {counts.mistakes > 0 && (
            <TodoLink
              to="/app/sesja/bledy"
              icon={<BookmarkX aria-hidden className="size-6" />}
              title="Moje błędy do poprawy"
              count={counts.mistakes}
            />
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section aria-labelledby="cal" className="rounded-2xl bg-surface p-5 shadow-sm">
          <h2 id="cal" className="text-heading text-ink">
            Kalendarz nauki
          </h2>
          <p className="tabular mt-1 mb-4 text-small text-ink-2">
            Aktywne dni: {t.activeDays} · najdłuższa seria: {daysLabel(longestStreak(days))}
          </p>
          <ActivityCalendar activity={activity} weeks={20} now={now} />
        </section>
        <section aria-labelledby="bars" className="rounded-2xl bg-surface p-5 shadow-sm">
          <h2 id="bars" className="text-heading text-ink">
            Ostatnie 14 dni
          </h2>
          <p className="mt-1 mb-4 text-small text-ink-2">Rozwiązane zadania dziennie</p>
          <DailyBars points={dailySeries(activity, 14, now)} />
        </section>
      </div>

      {weak.length > 0 && (
        <section aria-labelledby="weak" className="mt-10">
          <h2 id="weak" className="text-heading text-ink">
            Warto wrócić
          </h2>
          <p className="mt-1 text-small text-ink-2">
            Tematy z najniższą skutecznością (co najmniej 3 odpowiedzi).
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {weak.map((m) => (
              <li key={m.key}>
                <Link
                  to={`/app/egzaminy/${m.key}`}
                  className="flex h-full flex-col rounded-2xl bg-brand-soft p-4 no-underline hover:bg-surface-2"
                >
                  <span className="font-extrabold text-ink">{topics.get(m.key)?.name}</span>
                  <span className="tabular mt-1 text-small text-ink-2">
                    {Math.round((m.correct / m.attempts) * 100)}% dobrze · {m.attempts} odp.
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-small font-bold text-brand-text">
                    Powtórz temat <ChevronRight aria-hidden className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {[...bySubject].map(([key, list]) => (
        <section key={key} aria-labelledby={`s-${key}`} className="mt-10">
          <h2 id={`s-${key}`} className="text-heading text-ink">
            {subjects.get(key)}
          </h2>
          <p className="mt-1 text-small text-ink-2">
            Opanowane zadanie to takie, na które ostatnio odpowiedziano dobrze.
          </p>
          <ul className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm">
            {list.map((m) => {
              const info = topics.get(m.key)
              const total = info?.tasks ?? m.seen
              return (
                <li key={m.key} className="border-b border-line last:border-b-0">
                  <Link
                    to={`/app/egzaminy/${m.key}`}
                    className="grid gap-2 px-4 py-4 no-underline hover:bg-surface-2 sm:grid-cols-[1fr_12rem] sm:items-center sm:gap-6"
                  >
                    <span className="min-w-0">
                      <span className="block font-extrabold text-ink">{info?.name}</span>
                      <span className="tabular block text-small text-ink-2">
                        {m.mastered} z {total} opanowanych ·{' '}
                        {Math.round((m.correct / m.attempts) * 100)}% dobrze
                      </span>
                    </span>
                    <ProgressBar
                      value={m.mastered}
                      max={Math.max(1, total)}
                      label={`${info?.name ?? ''}: opanowane zadania`}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      <BadgeGrid />

      {mocks.length > 0 && (
        <section aria-labelledby="mocks" className="mt-10">
          <h2 id="mocks" className="text-heading text-ink">
            Egzaminy próbne
          </h2>
          <ul className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-sm">
            {mocks.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0"
              >
                <Timer aria-hidden className="size-6 shrink-0 text-brand-text" />
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-ink">{subjects.get(s.scope)}</span>
                  <span className="block text-small text-ink-2">{formatDate(s.finishedAt)}</span>
                </span>
                <span className="tabular text-lead font-extrabold text-ink">
                  {s.summary.points ?? 0}/{s.summary.maxPoints ?? s.summary.total}
                  <span className="text-small text-ink-3"> pkt</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  )
}

function TodoLink({
  to,
  icon,
  title,
  count,
}: {
  to: string
  icon: React.ReactNode
  title: string
  count: number
}) {
  return (
    <Link
      to={to}
      className="flex min-h-16 items-center gap-4 rounded-2xl bg-surface px-5 py-4 no-underline shadow-sm hover:bg-surface-2"
    >
      <span className="text-brand-text">{icon}</span>
      <span className="flex-1 font-extrabold text-ink">{title}</span>
      <span className="tabular rounded-full bg-brand px-3 py-1 text-small font-extrabold text-on-brand">
        {count}
      </span>
      <ChevronRight aria-hidden className="size-5 text-ink-3" />
    </Link>
  )
}
