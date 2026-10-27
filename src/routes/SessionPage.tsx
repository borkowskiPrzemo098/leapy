import { clsx } from 'clsx'
import { Bookmark, Flag, Lightbulb, RotateCcw, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { loadCatalog, loadPack } from '@/content/data'
import type { CompiledTask } from '@/content/schema'
import { correctAnswerHtml, type Response } from '@/engine/grade'
import { newSeed, rng } from '@/engine/random'
import {
  answer,
  currentItem,
  isFinished,
  markHintUsed,
  next,
  startSession,
  summarize,
  type SessionMode,
  type SessionState,
} from '@/engine/session'
import { Html, Prose } from '@/features/content/Prose'
import { pickTasks } from '@/features/session/pick'
import { TaskView } from '@/features/session/TaskView'
import { reportMailto } from '@/lib/report'
import { useStudy, useStudyHydrated } from '@/state/study'
import { progress } from '@/storage'
import { Button, ButtonLink } from '@/ui/Button'
import { IconButton } from '@/ui/controls'
import { LoadError } from '@/ui/LoadError'
import { ClimbArt, EmptyState, Page } from '@/ui/Page'
import { ProgressBar } from '@/ui/progress'

const SESSION_LENGTH = 10

interface Prepared {
  tasks: Map<string, CompiledTask>
  session: SessionState
  title: string
  backTo: string
}

/** Builds the task list for a route: one topic, or a quick mix from the learner's subjects. */
async function prepare(
  mode: SessionMode,
  params: { exam?: string; subject?: string; topic?: string },
  study: { exam: string | null; subjects: string[] },
): Promise<Prepared | null> {
  const seed = newSeed()
  const rand = rng(seed)
  let pool: CompiledTask[] = []
  let title = 'Szybka sesja'
  let scope = 'quick'
  let backTo = '/app/cwicz'

  if (mode === 'topic') {
    const { exam = '', subject = '', topic = '' } = params
    const [catalog, pack] = await Promise.all([loadCatalog(), loadPack(exam, subject)])
    const t = catalog.exams
      .find((e) => e.id === exam)
      ?.subjects.find((s) => s.id === subject)
      ?.sections.flatMap((s) => s.topics)
      .find((x) => x.id === topic)
    if (!t) return null
    pool = pack.tasks.filter((x) => x.topic === topic)
    title = t.name
    scope = `${exam}/${subject}/${topic}`
    backTo = `/app/egzaminy/${exam}/${subject}/${topic}`
  } else if (study.exam) {
    const catalog = await loadCatalog()
    const exam = catalog.exams.find((e) => e.id === study.exam)
    const subjects = (exam?.subjects ?? []).filter(
      (s) => study.subjects.includes(s.id) && s.tasks > 0,
    )
    const packs = await Promise.all(subjects.map((s) => loadPack(study.exam ?? '', s.id)))
    pool = packs.flatMap((p) => p.tasks)
  }
  if (!pool.length)
    return {
      tasks: new Map(),
      session: startSession({ id: '', mode, scope, tasks: [], seed, now: Date.now() }),
      title,
      backTo,
    }

  const history = await progress().attempts()
  const chosen = pickTasks(pool, history, SESSION_LENGTH, rand)
  const session = startSession({
    id: crypto.randomUUID(),
    mode,
    scope,
    tasks: chosen,
    seed,
    now: Date.now(),
  })
  return { tasks: new Map(chosen.map((t) => [t.id, t])), session, title, backTo }
}

export default function SessionPage({ mode }: { mode: SessionMode }) {
  const params = useParams()
  const study = useStudy()
  const navigate = useNavigate()
  const [run, setRun] = useState(0)
  const hydrated = useStudyHydrated()
  // A new run (Jeszcze raz) or a different route starts a new session.
  const key = `${mode}|${params.exam}|${params.subject}|${params.topic}|${run}`
  const [result, setResult] = useState<{
    key: string
    value: Prepared | null | { error: string }
  }>()

  useEffect(() => {
    if (mode === 'quick' && !hydrated) return
    let alive = true
    prepare(mode, params, { exam: study.exam, subjects: study.subjects }).then(
      (p) => alive && setResult({ key, value: p }),
      (e: unknown) =>
        alive && setResult({ key, value: { error: e instanceof Error ? e.message : String(e) } }),
    )
    return () => {
      alive = false
    }
    // params/study are read once per key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated])

  const prep = result?.key === key ? result.value : 'loading'
  if (prep === 'loading') return <ScreenSkeleton />
  if (prep === null) return <LoadError message="Nie ma takiego tematu." />
  if ('error' in prep) return <LoadError message={prep.error} />
  if (!prep.session.items.length)
    return (
      <Page title={prep.title}>
        <EmptyState
          art={<ClimbArt done={0} />}
          title="Nie ma jeszcze zadań do tej sesji"
          action={
            <ButtonLink to="/app/egzaminy" block>
              {study.exam ? 'Zmień przedmioty' : 'Wybierz egzamin'}
            </ButtonLink>
          }
        >
          {study.exam
            ? 'Wybrane przedmioty nie mają jeszcze zadań. Dodajemy je partiami.'
            : 'Najpierw wybierz egzamin i przedmioty, które zdajesz.'}
        </EmptyState>
      </Page>
    )

  return (
    <Player
      key={prep.session.id}
      prep={prep}
      onAgain={() => setRun((n) => n + 1)}
      onClose={() => navigate(prep.backTo)}
    />
  )
}

function Player({
  prep,
  onAgain,
  onClose,
}: {
  prep: Prepared
  onAgain: () => void
  onClose: () => void
}) {
  const [state, setState] = useState(prep.session)
  const [showHint, setShowHint] = useState(false)
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())
  const [canSubmit, setCanSubmit] = useState(false)
  const draft = useRef<(() => void) | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  const item = currentItem(state)
  const task = item ? prep.tasks.get(item.taskId) : undefined
  const graded = useMemo(
    () =>
      item?.response && item.grade ? { response: item.response, grade: item.grade } : undefined,
    [item],
  )
  const finished = isFinished(state)

  useEffect(() => {
    void progress()
      .bookmarks()
      .then((b) => setBookmarked(new Set(b.map((x) => x.taskId))))
  }, [])

  const onDraft = useCallback((fn: (() => void) | null) => {
    draft.current = fn
    setCanSubmit(!!fn)
  }, [])

  // Side effects (writes to IndexedDB) run here, never inside a state updater,
  // so StrictMode's double-invoked updaters cannot record an attempt twice.
  const stateRef = useRef(state)
  const update = useCallback((ns: SessionState) => {
    stateRef.current = ns
    setState(ns)
  }, [])

  const onSubmit = useCallback(
    (r: Response) => {
      const s = stateRef.current
      if (!task || s.items[s.index]?.grade) return
      const { state: ns, grade } = answer(s, task, r, Date.now())
      const it = ns.items[ns.index]
      update(ns)
      onDraft(null)
      void progress().recordAttempt({
        taskId: task.id,
        exam: task.exam,
        subject: task.subject,
        topic: task.topic,
        ts: Date.now(),
        correct: grade.correct,
        score: grade.score,
        ms: it?.ms ?? 0,
        mode: ns.mode,
        sessionId: ns.id,
        hintUsed: !!it?.hintUsed,
      })
    },
    [task, onDraft, update],
  )

  const goNext = useCallback(() => {
    const ns = next(stateRef.current, Date.now())
    setShowHint(false)
    update(ns)
    if (isFinished(ns))
      void progress().saveSession({
        id: ns.id,
        mode: ns.mode,
        scope: ns.scope,
        startedAt: ns.startedAt,
        finishedAt: ns.finishedAt ?? Date.now(),
        summary: summarize(ns),
      })
    window.scrollTo({ top: 0 })
  }, [update])

  // Move focus to the feedback so screen readers hear the result and Enter continues.
  useEffect(() => {
    if (graded) feedbackRef.current?.focus({ preventScroll: true })
  }, [graded])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        e.key !== 'Enter' ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLButtonElement
      )
        return
      if (graded) goNext()
      else draft.current?.()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [graded, goNext])

  const done = state.items.filter((i) => i.grade).length
  const summary = useMemo(() => (finished ? summarize(state) : null), [finished, state])

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-3 sm:px-4">
          <IconButton label="Zakończ sesję" onClick={onClose}>
            <X aria-hidden className="size-6" />
          </IconButton>
          <ProgressBar
            value={done}
            max={state.items.length}
            label="Postęp sesji"
            className="flex-1"
          />
          <span className="tabular w-14 text-right text-small font-bold text-ink-3">
            {Math.min(state.index + 1, state.items.length)} / {state.items.length}
          </span>
        </div>
      </header>

      {summary ? (
        <Summary prep={prep} summary={summary} onAgain={onAgain} />
      ) : task && item ? (
        <>
          <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-64 sm:px-6">
            <p className="mb-3 text-micro font-bold text-ink-3">{prep.title}</p>
            <TaskView
              key={task.id}
              task={task}
              order={item.order}
              {...(graded ? { graded } : {})}
              onSubmit={onSubmit}
              onDraft={onDraft}
            />
            {!graded && task.hint && (
              <div className="mt-6">
                {showHint ? (
                  <div className="rounded-xl bg-reward-soft p-4 text-ink">
                    <p className="mb-1 flex items-center gap-2 text-small font-extrabold">
                      <Lightbulb aria-hidden className="size-4" /> Podpowiedź
                    </p>
                    <Prose html={task.hint} />
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    icon={<Lightbulb aria-hidden className="size-5" />}
                    onClick={() => {
                      setShowHint(true)
                      update(markHintUsed(stateRef.current))
                    }}
                  >
                    Pokaż podpowiedź
                  </Button>
                )}
              </div>
            )}
          </main>

          <div className="fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)]">
            {graded ? (
              <div
                ref={feedbackRef}
                tabIndex={-1}
                role="status"
                className={clsx(
                  'mx-auto max-h-[60dvh] max-w-2xl overflow-y-auto rounded-t-2xl px-5 pt-5 pb-4 shadow-lg outline-none sm:px-6',
                  graded.grade.correct ? 'bg-correct-soft' : 'bg-wrong-soft',
                )}
              >
                <p
                  className={clsx(
                    'text-title',
                    graded.grade.correct ? 'animate-leap text-correct-text' : 'text-wrong-text',
                  )}
                >
                  {graded.grade.correct
                    ? 'Jest! Dobrze.'
                    : graded.grade.score > 0
                      ? 'Częściowo dobrze'
                      : 'Tym razem nie'}
                </p>
                {!graded.grade.correct && (
                  <p className="mt-2 text-ink">
                    <span className="font-bold">Poprawna odpowiedź: </span>
                    <Html as="span" html={correctAnswerHtml(task)} />
                  </p>
                )}
                <details className="mt-3" open={!graded.grade.correct}>
                  <summary className="cursor-pointer font-bold text-ink">
                    Wyjaśnienie krok po kroku
                  </summary>
                  <Prose html={task.explanation} className="mt-2" />
                </details>
                <div className="mt-4 flex items-center gap-2">
                  <Button block size="lg" onClick={goNext}>
                    {state.index + 1 < state.items.length ? 'Dalej' : 'Zobacz wynik'}
                  </Button>
                  <IconButton
                    label={bookmarked.has(task.id) ? 'Usuń zakładkę' : 'Dodaj zakładkę'}
                    aria-pressed={bookmarked.has(task.id)}
                    onClick={() =>
                      void progress()
                        .toggleBookmark(task.id)
                        .then((on) =>
                          setBookmarked((b) => {
                            const n = new Set(b)
                            if (on) n.add(task.id)
                            else n.delete(task.id)
                            return n
                          }),
                        )
                    }
                  >
                    <Bookmark
                      aria-hidden
                      className="size-6"
                      fill={bookmarked.has(task.id) ? 'currentColor' : 'none'}
                    />
                  </IconButton>
                  <a
                    href={reportMailto({ taskId: task.id })}
                    aria-label="Zgłoś błąd w zadaniu"
                    title="Zgłoś błąd w zadaniu"
                    className="grid size-12 shrink-0 place-items-center rounded-lg text-ink-2 hover:bg-surface/60"
                  >
                    <Flag aria-hidden className="size-6" />
                  </a>
                </div>
              </div>
            ) : (
              task.type !== 'single' && (
                <div className="mx-auto max-w-2xl border-t border-line bg-bg/95 px-4 pt-3 pb-3 backdrop-blur-md sm:px-6">
                  <Button block size="lg" disabled={!canSubmit} onClick={() => draft.current?.()}>
                    Sprawdź
                  </Button>
                </div>
              )
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function Summary({
  prep,
  summary,
  onAgain,
}: {
  prep: Prepared
  summary: ReturnType<typeof summarize>
  onAgain: () => void
}) {
  const pct = Math.round(summary.accuracy * 100)
  const minutes = Math.max(1, Math.round(summary.ms / 60000))
  const steps = 5
  const done = Math.round(summary.accuracy * steps)
  return (
    <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-16 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-on-brand sm:p-8">
        <p className="text-lead font-bold text-on-brand-2">{prep.title}</p>
        <h1 className="mt-1 text-display text-on-brand">
          {summary.correct} z {summary.total}
        </h1>
        <p className="mt-2 text-lead text-on-brand-2">
          {pct}% poprawnych · około {minutes} min
        </p>
        <div className="mt-6 max-w-64">
          <ClimbArt steps={steps} done={done} onBrand />
        </div>
      </section>

      {summary.wrongTaskIds.length > 0 && (
        <section aria-labelledby="wrong" className="mt-6 rounded-2xl bg-surface p-5 shadow-sm">
          <h2 id="wrong" className="text-heading text-ink">
            Do powtórki: {summary.wrongTaskIds.length}
          </h2>
          <p className="mt-1 text-small text-ink-2">
            Te zadania wrócą w kolejnych sesjach, dopóki ich nie opanujesz.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {summary.wrongTaskIds.map((id) => {
              const t = prep.tasks.get(id)
              return t ? (
                <li key={id} className="rounded-xl bg-wrong-soft px-4 py-3">
                  <Prose html={t.prompt} className="line-clamp-2 text-small" />
                </li>
              ) : null
            })}
          </ul>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          block
          icon={<RotateCcw aria-hidden className="size-5" />}
          onClick={onAgain}
        >
          Jeszcze raz
        </Button>
        <ButtonLink to={prep.backTo} variant="secondary" size="lg" block>
          Wróć
        </ButtonLink>
      </div>
      <p className="mt-6 text-center text-small text-ink-3">
        <Link to="/app/postepy">Zobacz postępy</Link>
      </p>
    </main>
  )
}
