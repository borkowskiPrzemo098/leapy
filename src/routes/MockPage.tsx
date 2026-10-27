import { clsx } from 'clsx'
import { Check, ChevronLeft, ChevronRight, Clock, Flag, LayoutGrid, Minus, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { loadCatalog, loadPack, subjectLabel } from '@/content/data'
import type { CompiledTask } from '@/content/schema'
import type { Response } from '@/engine/grade'
import {
  answeredCount,
  finishMock,
  goTo,
  isTimeUp,
  mockConfig,
  pickMockTasks,
  remainingMs,
  setResponse,
  startMock,
  toggleFlag,
  type MockResult,
  type MockState,
} from '@/engine/mock'
import { newSeed, rng } from '@/engine/random'
import { qualityFromGrade } from '@/engine/srs'
import { Prose } from '@/features/content/Prose'
import { activeMock, archiveMock, lastMock, mockPath, saveActiveMock } from '@/features/mock/store'
import { TaskView } from '@/features/session/TaskView'
import { ShareButton } from '@/features/share/ShareButton'
import { recordReview } from '@/features/study/queries'
import { progress } from '@/storage'
import { Button, ButtonLink } from '@/ui/Button'
import { IconButton } from '@/ui/controls'
import { ConfirmDialog } from '@/ui/Dialog'
import { LoadError } from '@/ui/LoadError'
import { ProgressBar } from '@/ui/progress'

interface Loaded {
  state: MockState
  tasks: Map<string, CompiledTask>
  title: string
  topicNames: Map<string, string>
}

const noop = () => undefined

/** Loads the running sheet for this subject, or starts a new one; `?wynik=id` shows a result. */
async function load(exam: string, subject: string, resultId: string | null): Promise<Loaded> {
  const [catalog, pack] = await Promise.all([loadCatalog(), loadPack(exam, subject)])
  const s = catalog.exams.find((e) => e.id === exam)?.subjects.find((x) => x.id === subject)
  if (!s) throw new Error('Nie ma takiego przedmiotu.')
  const tasks = new Map(pack.tasks.map((t) => [t.id, t]))
  const topics = s.sections.flatMap((x) => x.topics)
  const base = {
    tasks,
    title: subjectLabel(s),
    topicNames: new Map(topics.map((t) => [t.id, t.name])),
  }

  if (resultId) {
    const last = await lastMock()
    if (!last || last.id !== resultId) throw new Error('Ten wynik nie jest już dostępny.')
    return { ...base, state: last }
  }
  const active = await activeMock()
  if (active && active.exam === exam && active.subject === subject)
    return { ...base, state: active }
  if (active) throw new Error('Masz rozpoczęty arkusz z innego przedmiotu. Skończ go albo porzuć.')

  const cfg = mockConfig(s.mock, pack.tasks.length)
  if (!cfg.tasks) throw new Error('Ten przedmiot nie ma jeszcze zadań.')
  const seed = newSeed()
  const chosen = pickMockTasks(
    pack.tasks,
    cfg.tasks,
    topics.map((t) => t.id),
    rng(seed),
  )
  const state = startMock({
    id: crypto.randomUUID(),
    exam,
    subject,
    tasks: chosen,
    minutes: cfg.minutes,
    seed,
    now: Date.now(),
  })
  await saveActiveMock(state)
  return { ...base, state }
}

/** Grades the sheet and writes everything to storage: attempts, spaced repetition, the session. */
async function submit(loaded: Loaded, state: MockState) {
  const { state: done, result } = finishMock(state, loaded.tasks, Date.now())
  const store = progress()
  const per = Math.round(result.ms / Math.max(1, result.answered))
  const ts = done.finishedAt ?? Date.now()
  for (const r of result.items) {
    if (!r.answered) continue
    const task = loaded.tasks.get(r.taskId)
    if (!task) continue
    await store.recordAttempt({
      taskId: r.taskId,
      exam: task.exam,
      subject: task.subject,
      topic: task.topic,
      ts,
      correct: r.grade.correct,
      score: r.grade.score,
      ms: per,
      mode: 'mock',
      sessionId: done.id,
      hintUsed: false,
    })
    await recordReview(r.taskId, qualityFromGrade(r.grade, false), ts)
  }
  await store.saveSession({
    id: done.id,
    mode: 'mock',
    scope: `${done.exam}/${done.subject}`,
    startedAt: done.startedAt,
    finishedAt: ts,
    summary: {
      total: result.items.length,
      answered: result.answered,
      correct: result.correct,
      score: result.items.reduce((n, r) => n + r.grade.score, 0),
      accuracy: result.items.length ? result.correct / result.items.length : 0,
      ms: result.ms,
      wrongTaskIds: result.items.filter((r) => !r.grade.correct).map((r) => r.taskId),
      points: result.points,
      maxPoints: result.maxPoints,
    },
  })
  await archiveMock(done)
  return done
}

export default function MockPage() {
  const { exam = '', subject = '' } = useParams()
  const [search] = useSearchParams()
  const resultId = search.get('wynik')
  const key = `${exam}/${subject}/${resultId}`
  const [res, setRes] = useState<{ key: string; value: Loaded | { error: string } }>()

  useEffect(() => {
    let alive = true
    load(exam, subject, resultId).then(
      (v) => alive && setRes({ key, value: v }),
      (e: unknown) =>
        alive && setRes({ key, value: { error: e instanceof Error ? e.message : String(e) } }),
    )
    return () => {
      alive = false
    }
  }, [key, exam, subject, resultId])

  const value = res?.key === key ? res.value : null
  if (!value) return <ScreenSkeleton />
  if ('error' in value)
    return (
      <div className="pt-10">
        <LoadError message={value.error} />
        <p className="mt-4 text-center">
          <ButtonLink to="/app/egzamin-probny" variant="secondary">
            Wróć do arkuszy
          </ButtonLink>
        </p>
      </div>
    )
  if (value.state.finishedAt !== undefined) return <MockResultView loaded={value} />
  return <MockRun key={value.state.id} loaded={value} />
}

// ---------- the timed sheet ----------

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}

const clock = (ms: number) => {
  const s = Math.ceil(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

function MockRun({ loaded }: { loaded: Loaded }) {
  const navigate = useNavigate()
  const [state, setState] = useState(loaded.state)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const sheetRef = useRef<HTMLDialogElement>(null)
  const now = useNow()
  const left = remainingMs(state, now)
  const stateRef = useRef(state)

  // Writes happen here, outside state updaters (StrictMode runs updaters twice).
  const update = useCallback((ns: MockState) => {
    stateRef.current = ns
    setState(ns)
    void saveActiveMock(ns)
  }, [])

  // A ref, not state: the time-up effect may fire twice before a re-render (StrictMode).
  const finishing = useRef(false)
  const finish = useCallback(async () => {
    if (finishing.current) return
    finishing.current = true
    setBusy(true)
    const done = await submit(loaded, stateRef.current)
    navigate(`${mockPath(done.exam, done.subject)}?wynik=${done.id}`, { replace: true })
  }, [loaded, navigate])

  useEffect(() => {
    if (isTimeUp(state, now)) void finish()
  }, [now, state, finish])

  const item = state.items[state.index]
  const task = item ? loaded.tasks.get(item.taskId) : undefined
  const index = state.index
  const onChange = useCallback(
    (r: Response | null) => {
      const s = stateRef.current
      const prev = s.items[index]?.response ?? null
      if (JSON.stringify(prev) !== JSON.stringify(r)) update(setResponse(s, index, r))
    },
    [index, update],
  )
  const go = useCallback(
    (i: number) => {
      update(goTo(stateRef.current, i))
      window.scrollTo({ top: 0 })
    },
    [update],
  )

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || sheetRef.current?.open) return
      if (e.key === 'ArrowRight') go(stateRef.current.index + 1)
      if (e.key === 'ArrowLeft') go(stateRef.current.index - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [go])

  useEffect(() => {
    const d = sheetRef.current
    if (!d) return
    if (sheetOpen && !d.open) d.showModal()
    if (!sheetOpen && d.open) d.close()
  }, [sheetOpen])

  const answered = answeredCount(state)
  const blank = state.items.length - answered
  const last = state.index === state.items.length - 1
  const lowTime = left <= 5 * 60_000
  // Spoken only at a few thresholds, so the live region does not chatter every second.
  const minutesLeft = Math.ceil(left / 60_000)
  const announce = [10, 5, 1].includes(minutesLeft) ? `Zostało ${minutesLeft} min` : ''

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-3 sm:px-4">
          <IconButton
            label="Wyjdź z arkusza (czas biegnie dalej)"
            onClick={() => navigate('/app/egzamin-probny')}
          >
            <X aria-hidden className="size-6" />
          </IconButton>
          <ProgressBar
            value={answered}
            max={state.items.length}
            label={`Odpowiedzi: ${answered} z ${state.items.length}`}
            className="flex-1"
          />
          <p
            className={clsx(
              'tabular flex min-w-24 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-small font-extrabold',
              lowTime ? 'bg-ink text-bg' : 'bg-surface-2 text-ink',
            )}
          >
            <Clock aria-hidden className="size-4" />
            <span>
              <span className="sr-only">Pozostały czas: </span>
              {clock(left)}
            </span>
          </p>
          <span className="sr-only" aria-live="polite">
            {announce}
          </span>
        </div>
      </header>

      {task && item && (
        <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-40 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-micro font-bold text-ink-3">
              Zadanie {state.index + 1} z {state.items.length} · {task.points} pkt
            </p>
            <button
              type="button"
              aria-pressed={!!item.flagged}
              onClick={() => update(toggleFlag(stateRef.current, state.index))}
              className={clsx(
                'flex min-h-12 items-center gap-2 rounded-lg px-3 text-small font-bold',
                item.flagged ? 'bg-ink text-bg' : 'text-ink-2 hover:bg-surface-2',
              )}
            >
              <Flag aria-hidden className="size-4" fill={item.flagged ? 'currentColor' : 'none'} />
              {item.flagged ? 'Oznaczone' : 'Wrócę tu'}
            </button>
          </div>
          <TaskView
            key={task.id}
            task={task}
            order={item.order}
            initial={item.response}
            onChange={onChange}
            onSubmit={noop}
            onDraft={noop}
          />
        </main>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3 sm:px-6">
          <IconButton
            label="Poprzednie zadanie"
            disabled={state.index === 0}
            onClick={() => go(state.index - 1)}
          >
            <ChevronLeft aria-hidden className="size-6" />
          </IconButton>
          <Button
            variant="secondary"
            icon={<LayoutGrid aria-hidden className="size-5" />}
            onClick={() => setSheetOpen(true)}
          >
            Arkusz
          </Button>
          <div className="flex-1" />
          {last ? (
            <Button onClick={() => setConfirm(true)}>Oddaj arkusz</Button>
          ) : (
            <Button
              iconEnd={<ChevronRight aria-hidden className="size-5" />}
              onClick={() => go(state.index + 1)}
            >
              Dalej
            </Button>
          )}
        </div>
      </div>

      <dialog
        ref={sheetRef}
        aria-labelledby="sheet-title"
        onCancel={(e) => {
          e.preventDefault()
          setSheetOpen(false)
        }}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl bg-surface p-0 text-ink shadow-lg backdrop:bg-[var(--overlay)]"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="sheet-title" className="text-heading text-ink">
                Arkusz
              </h2>
              <p className="tabular mt-1 text-small text-ink-2">
                Odpowiedzi: {answered} z {state.items.length}
                {blank > 0 && ` · bez odpowiedzi: ${blank}`}
              </p>
            </div>
            <IconButton label="Zamknij" onClick={() => setSheetOpen(false)}>
              <X aria-hidden className="size-6" />
            </IconButton>
          </div>
          <ol className="mt-5 grid grid-cols-5 gap-2">
            {state.items.map((it, i) => (
              <li key={it.taskId}>
                <button
                  type="button"
                  aria-current={i === state.index ? 'step' : undefined}
                  aria-label={`Zadanie ${i + 1}: ${it.response ? 'z odpowiedzią' : 'bez odpowiedzi'}${it.flagged ? ', oznaczone' : ''}`}
                  onClick={() => {
                    setSheetOpen(false)
                    go(i)
                  }}
                  className={clsx(
                    'tabular relative grid h-12 w-full place-items-center rounded-lg text-body font-extrabold',
                    it.response
                      ? 'bg-brand text-on-brand'
                      : 'border-2 border-line-strong bg-surface text-ink',
                    i === state.index && 'ring-3 ring-ink ring-offset-2 ring-offset-surface',
                  )}
                >
                  {i + 1}
                  {it.flagged && (
                    <Flag
                      aria-hidden
                      className="absolute top-1 right-1 size-3"
                      fill="currentColor"
                    />
                  )}
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-micro font-bold text-ink-3">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-sm bg-brand" /> z odpowiedzią
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-sm border-2 border-line-strong" /> bez
              odpowiedzi
            </span>
            <span className="flex items-center gap-1.5">
              <Flag aria-hidden className="size-3" fill="currentColor" /> wrócę tu
            </span>
          </p>
          <Button
            block
            size="lg"
            className="mt-6"
            onClick={() => {
              setSheetOpen(false)
              setConfirm(true)
            }}
          >
            Oddaj arkusz
          </Button>
        </div>
      </dialog>

      <ConfirmDialog
        open={confirm}
        title="Oddać arkusz?"
        confirmLabel="Oddaj i sprawdź"
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void finish()}
      >
        {blank > 0
          ? `Bez odpowiedzi: ${blank} ${blank === 1 ? 'zadanie' : blank < 5 ? 'zadania' : 'zadań'}. Po oddaniu nie zmienisz już odpowiedzi.`
          : 'Po oddaniu nie zmienisz już odpowiedzi.'}
      </ConfirmDialog>
    </div>
  )
}

// ---------- result ----------

function MockResultView({ loaded }: { loaded: Loaded }) {
  const { state, tasks, title, topicNames } = loaded
  const result: MockResult = useMemo(
    () => finishMock(state, tasks, state.finishedAt ?? state.deadline).result,
    [state, tasks],
  )
  const pct = result.maxPoints ? Math.round((result.points / result.maxPoints) * 100) : 0
  const minutes = Math.max(1, Math.round(result.ms / 60_000))
  const limit = Math.round((state.deadline - state.startedAt) / 60_000)

  useEffect(() => {
    document.title = `Wynik: ${title} · Leapy`
  }, [title])

  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-16 sm:px-6">
      <section className="rounded-2xl bg-brand p-6 text-on-brand sm:p-8">
        <p className="text-lead font-bold text-on-brand-2">Egzamin próbny · {title}</p>
        <h1 className="tabular mt-1 text-display text-on-brand">
          {result.points} z {result.maxPoints} pkt
        </h1>
        <p className="tabular mt-2 text-lead text-on-brand-2">
          {pct}% · {minutes} z {limit} min
        </p>
        <p className="mt-4 max-w-[48ch] text-small text-on-brand-2">
          Wynik z arkusza ćwiczebnego Leapy. Nie przelicza się na wynik egzaminu.
        </p>
      </section>

      <section aria-labelledby="by-topic" className="mt-6 rounded-2xl bg-surface p-5 shadow-sm">
        <h2 id="by-topic" className="text-heading text-ink">
          Punkty w tematach
        </h2>
        <ul className="mt-4 flex flex-col gap-4">
          {result.byTopic.map((t) => {
            const name = topicNames.get(t.topic) ?? t.topic
            return (
              <li key={t.topic}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="font-bold text-ink">{name}</span>
                  <span className="tabular text-small font-bold text-ink-2">
                    {t.points} / {t.maxPoints} pkt
                  </span>
                </div>
                <ProgressBar value={t.points} max={t.maxPoints} label={`${name}: punkty`} />
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="answers" className="mt-6">
        <h2 id="answers" className="text-heading text-ink">
          Zadania i wyjaśnienia
        </h2>
        <ol className="mt-4 flex flex-col gap-2">
          {result.items.map((r, i) => {
            const task = tasks.get(r.taskId)
            const item = state.items[i]
            if (!task || !item) return null
            const Icon = !r.answered ? Minus : r.grade.correct ? Check : X
            return (
              <li key={r.taskId}>
                <details className="group rounded-xl bg-surface shadow-sm">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3">
                    <span
                      className={clsx(
                        'grid size-8 shrink-0 place-items-center rounded-md',
                        !r.answered && 'bg-surface-2 text-ink-2',
                        r.answered && r.grade.correct && 'bg-correct text-on-feedback',
                        r.answered && !r.grade.correct && 'bg-wrong text-on-feedback',
                      )}
                    >
                      <Icon aria-hidden className="size-4" strokeWidth={3} />
                    </span>
                    <span className="sr-only">
                      {!r.answered ? 'Bez odpowiedzi' : r.grade.correct ? 'Dobrze' : 'Źle'}:
                    </span>
                    <span className="tabular w-6 shrink-0 font-extrabold text-ink-3">{i + 1}.</span>
                    <Prose html={task.prompt} className="line-clamp-1 min-w-0 flex-1 text-small" />
                    <span className="tabular shrink-0 text-small font-bold text-ink-2">
                      {r.points}/{r.maxPoints}
                    </span>
                  </summary>
                  <div className="border-t border-line px-4 pt-4 pb-5">
                    <TaskView
                      task={task}
                      order={item.order}
                      graded={{ response: r.response, grade: r.grade }}
                      onSubmit={noop}
                      onDraft={noop}
                    />
                    <h3 className="mt-5 font-extrabold text-ink">Wyjaśnienie</h3>
                    <Prose html={task.explanation} className="mt-1" />
                  </div>
                </details>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="mt-8">
        <ShareButton
          content={{
            kicker: 'Egzamin próbny w Leapy',
            value: `${result.points} z ${result.maxPoints} pkt`,
            detail: title,
            steps: Math.round((pct / 100) * 5),
          }}
        />
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <ButtonLink to="/app/egzamin-probny" size="lg" block>
          Nowy arkusz
        </ButtonLink>
        <ButtonLink to="/app/postepy" variant="secondary" size="lg" block>
          Zobacz postępy
        </ButtonLink>
      </div>
    </main>
  )
}
