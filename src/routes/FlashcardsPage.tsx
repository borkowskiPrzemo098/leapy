import { clsx } from 'clsx'
import { RotateCcw, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ScreenSkeleton } from '@/app/AppLayout'
import { findTopic, loadCatalog, loadPack } from '@/content/data'
import type { CompiledCard } from '@/content/schema'
import { newSeed, rng, shuffle } from '@/engine/random'
import { cardQuality, isDue, type Quality } from '@/engine/srs'
import { Html } from '@/features/content/Prose'
import { recordReview } from '@/features/study/queries'
import { useStudy, useStudyHydrated } from '@/state/study'
import { progress } from '@/storage'
import { Button, ButtonLink } from '@/ui/Button'
import { IconButton } from '@/ui/controls'
import { LoadError } from '@/ui/LoadError'
import { ClimbArt, EmptyState, Page } from '@/ui/Page'
import { ProgressBar } from '@/ui/progress'

const DECK = 20

interface Deck {
  title: string
  backTo: string
  /** Cards due today or never seen, due first */
  due: CompiledCard[]
  all: CompiledCard[]
  topicNames: Map<string, string>
}

async function loadDeck(
  params: { exam?: string; subject?: string; topic?: string },
  study: { exam: string | null; subjects: string[] },
): Promise<Deck> {
  const catalog = await loadCatalog()
  let cards: CompiledCard[] = []
  let title = 'Fiszki'
  let backTo = '/app/cwicz'
  const topicNames = new Map<string, string>()
  for (const e of catalog.exams)
    for (const s of e.subjects)
      for (const sec of s.sections) for (const t of sec.topics) topicNames.set(t.id, t.name)

  if (params.exam && params.subject && params.topic) {
    const found = findTopic(catalog, params.exam, params.subject, params.topic)
    if (!found) throw new Error('Nie ma takiego tematu.')
    const pack = await loadPack(params.exam, params.subject)
    cards = pack.cards.filter((c) => c.topic === params.topic)
    title = `Fiszki: ${found.topic.name}`
    backTo = `/app/egzaminy/${params.exam}/${params.subject}/${params.topic}`
  } else if (study.exam) {
    const exam = catalog.exams.find((e) => e.id === study.exam)
    const subjects = (exam?.subjects ?? []).filter(
      (s) => study.subjects.includes(s.id) && s.cards > 0,
    )
    const packs = await Promise.all(subjects.map((s) => loadPack(study.exam ?? '', s.id)))
    cards = packs.flatMap((p) => p.cards)
  }

  const srs = new Map((await progress().srs()).map((r) => [r.taskId, r]))
  const now = Date.now()
  const rand = rng(newSeed())
  const dueCards = cards
    .filter((c) => {
      const r = srs.get(c.id)
      return r && isDue(r, now)
    })
    .sort((a, b) => (srs.get(a.id)?.due ?? 0) - (srs.get(b.id)?.due ?? 0))
  const fresh = shuffle(
    cards.filter((c) => !srs.has(c.id)),
    rand,
  )
  return {
    title,
    backTo,
    due: [...dueCards, ...fresh].slice(0, DECK),
    all: shuffle(cards, rand).slice(0, DECK),
    topicNames,
  }
}

export default function FlashcardsPage() {
  const params = useParams()
  const study = useStudy()
  const hydrated = useStudyHydrated()
  const navigate = useNavigate()
  const [run, setRun] = useState(0)
  const [browseAll, setBrowseAll] = useState(false)
  const scoped = !!params.topic
  const key = `${params.exam}|${params.subject}|${params.topic}|${run}`
  const [res, setRes] = useState<{ key: string; value: Deck | { error: string } }>()

  useEffect(() => {
    if (!scoped && !hydrated) return
    let alive = true
    loadDeck(params, { exam: study.exam, subjects: study.subjects }).then(
      (d) => alive && setRes({ key, value: d }),
      (e: unknown) =>
        alive && setRes({ key, value: { error: e instanceof Error ? e.message : String(e) } }),
    )
    return () => {
      alive = false
    }
    // params/study are read once per key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hydrated])

  const deck = res?.key === key ? res.value : null
  if (!deck) return <ScreenSkeleton />
  if ('error' in deck) return <LoadError message={deck.error} />

  const cards = browseAll ? deck.all : deck.due
  if (!deck.all.length)
    return (
      <Page title={deck.title}>
        <EmptyState
          art={<ClimbArt done={0} />}
          title="Nie ma tu jeszcze fiszek"
          action={
            <ButtonLink to="/app/egzaminy" block>
              {study.exam ? 'Zmień przedmioty' : 'Wybierz egzamin'}
            </ButtonLink>
          }
        >
          Fiszki powstają z mini-ściąg w lekcjach. Pojawią się, gdy twoje przedmioty dostaną lekcje.
        </EmptyState>
      </Page>
    )
  if (!cards.length)
    return (
      <Page title={deck.title}>
        <EmptyState
          art={<ClimbArt done={5} />}
          title="Na dziś fiszki powtórzone"
          action={
            <Button block variant="secondary" onClick={() => setBrowseAll(true)}>
              Przejrzyj wszystkie mimo to
            </Button>
          }
        >
          Karty wrócą, gdy przyjdzie ich termin. Im lepiej je znasz, tym rzadziej się pojawiają.
        </EmptyState>
      </Page>
    )

  return (
    <Deckplayer
      key={`${key}|${browseAll}`}
      deck={deck}
      cards={cards}
      onAgain={() => {
        setBrowseAll(false)
        setRun((n) => n + 1)
      }}
      onClose={() => navigate(deck.backTo)}
    />
  )
}

type Rating = keyof typeof cardQuality
const ratings: { id: Rating; label: string; key: string }[] = [
  { id: 'forgot', label: 'Nie pamiętam', key: '1' },
  { id: 'hard', label: 'Z trudem', key: '2' },
  { id: 'know', label: 'Wiem', key: '3' },
]

function Deckplayer({
  deck,
  cards,
  onAgain,
  onClose,
}: {
  deck: Deck
  cards: CompiledCard[]
  onAgain: () => void
  onClose: () => void
}) {
  // Forgotten cards go to the back of the queue once, so they come back in the same sitting.
  const [queue, setQueue] = useState(cards)
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [tally, setTally] = useState<Record<Rating, number>>({ forgot: 0, hard: 0, know: 0 })
  const requeued = useRef(new Set<string>())
  const [forgotten, setForgotten] = useState<ReadonlySet<string>>(new Set())
  const [startedAt] = useState(() => Date.now())
  const [sessionId] = useState(() => crypto.randomUUID())
  const saved = useRef(false)
  const actions = useRef<HTMLDivElement>(null)
  const front = useRef<HTMLElement>(null)
  const back = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = `${deck.title} · Leapy`
  }, [deck.title])

  const card = queue[pos]
  const done = pos >= queue.length
  const reviewed = Math.min(pos, queue.length)

  const rate = useCallback(
    (r: Rating) => {
      if (!card || !flipped) return
      void recordReview(card.id, cardQuality[r] as Quality)
      setTally((t) => ({ ...t, [r]: t[r] + 1 }))
      if (r === 'forgot') {
        setForgotten((f) => new Set(f).add(card.id))
        if (!requeued.current.has(card.id)) {
          requeued.current.add(card.id)
          setQueue((q) => [...q, card])
        }
      }
      setFlipped(false)
      setPos((p) => p + 1)
    },
    [card, flipped],
  )

  // The hidden face is inert (not focusable, not read out); focus follows the visible action.
  useEffect(() => {
    if (front.current) front.current.inert = flipped
    if (back.current) back.current.inert = !flipped
    actions.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [flipped, pos])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setFlipped(true)
        return
      }
      const r = ratings.find((x) => x.key === e.key)
      if (flipped && r) {
        e.preventDefault()
        rate(r.id)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [flipped, rate])

  useEffect(() => {
    if (!done || saved.current) return
    saved.current = true
    const total = cards.length
    void progress().saveSession({
      id: sessionId,
      mode: 'cards',
      scope: deck.title,
      startedAt: startedAt,
      finishedAt: Date.now(),
      summary: {
        total,
        answered: total,
        correct: total - forgotten.size,
        score: total - forgotten.size,
        accuracy: total ? (total - forgotten.size) / total : 0,
        ms: Date.now() - startedAt,
        wrongTaskIds: [...forgotten],
      },
    })
  }, [done, cards.length, deck.title, forgotten, sessionId, startedAt])

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-3 sm:px-4">
          <IconButton label="Zakończ fiszki" onClick={onClose}>
            <X aria-hidden className="size-6" />
          </IconButton>
          <ProgressBar
            value={reviewed}
            max={queue.length}
            label="Postęp fiszek"
            className="flex-1"
          />
          <span className="tabular w-14 text-right text-small font-bold text-ink-3">
            {Math.min(pos + 1, queue.length)} / {queue.length}
          </span>
        </div>
      </header>

      {done ? (
        <main id="main" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-16 sm:px-6">
          <section className="rounded-2xl bg-brand p-6 text-on-brand sm:p-8">
            <p className="text-lead font-bold text-on-brand-2">{deck.title}</p>
            <h1 className="tabular mt-1 text-display text-on-brand">
              {cards.length - forgotten.size} z {cards.length}
            </h1>
            <p className="mt-2 text-lead text-on-brand-2">fiszek pamiętasz od razu albo z trudem</p>
            <dl className="tabular mt-6 grid max-w-sm grid-cols-3 gap-2">
              {ratings.map((r) => (
                <div key={r.id} className="rounded-xl bg-brand-deep/60 px-3 py-2">
                  <dt className="text-micro font-bold text-on-brand-2">{r.label}</dt>
                  <dd className="text-heading text-on-brand">{tally[r.id]}</dd>
                </div>
              ))}
            </dl>
          </section>
          <p className="mt-6 text-small text-ink-2">
            Karty, których nie pamiętasz, wrócą jutro. Znane wracają po kilku dniach, potem coraz
            rzadziej.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              block
              icon={<RotateCcw aria-hidden className="size-5" />}
              onClick={onAgain}
            >
              Jeszcze raz
            </Button>
            <ButtonLink to={deck.backTo} variant="secondary" size="lg" block>
              Wróć
            </ButtonLink>
          </div>
        </main>
      ) : card ? (
        <main
          id="main"
          className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-6 pb-10 sm:px-6"
        >
          <div className="flip" data-flipped={flipped}>
            <div className="flip-inner">
              <section
                ref={front}
                aria-hidden={flipped}
                className="flex min-h-72 flex-col rounded-2xl bg-surface p-6 shadow-md sm:p-8"
              >
                <p className="text-micro font-bold text-ink-3">
                  {deck.topicNames.get(card.topic) ?? ''}
                </p>
                <div className="flex flex-1 items-center py-6">
                  <Html html={card.front} className="text-title text-ink" />
                </div>
                <p className="text-small text-ink-3">
                  Przypomnij sobie odpowiedź, potem odwróć kartę.
                </p>
              </section>
              <section
                ref={back}
                aria-hidden={!flipped}
                className="flip-back flex min-h-72 flex-col rounded-2xl bg-brand-soft p-6 shadow-md sm:p-8"
              >
                <Html html={card.front} className="text-small font-bold text-brand-text" />
                <div className="math-scroll flex flex-1 items-center py-6">
                  <Html html={card.back} className="text-title text-ink" />
                </div>
                <p className="text-small text-ink-2">Jak dobrze to pamiętasz?</p>
              </section>
            </div>
          </div>

          <div ref={actions} className="mt-6">
            {flipped ? (
              <div role="group" aria-label="Oceń, jak pamiętasz" className="grid grid-cols-3 gap-2">
                {ratings.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => rate(r.id)}
                    aria-keyshortcuts={r.key}
                    className={clsx(
                      'mb-1 flex min-h-14 flex-col items-center justify-center rounded-xl px-2 font-bold transition-[box-shadow,transform] duration-[var(--dur-fast)] active:translate-y-1',
                      r.id === 'know'
                        ? 'bg-brand text-on-brand shadow-[0_4px_0_var(--brand-deep)] active:shadow-none'
                        : 'border-2 border-line-strong bg-surface text-ink shadow-[0_4px_0_var(--line-strong)] active:shadow-none',
                    )}
                  >
                    {r.label}
                    <span
                      aria-hidden
                      className={clsx(
                        'hidden text-micro md:block',
                        r.id === 'know' ? 'text-on-brand-2' : 'text-ink-3',
                      )}
                    >
                      klawisz {r.key}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <Button block size="lg" onClick={() => setFlipped(true)}>
                Pokaż odpowiedź
              </Button>
            )}
          </div>
        </main>
      ) : null}
    </div>
  )
}
