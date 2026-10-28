import { ChevronRight, Search, X } from 'lucide-react'
import type MiniSearch from 'minisearch'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadSearch } from '@/content/data'
import type { SearchDoc } from '@/content/schema'

/** Lowercase without Polish diacritics, so "zrodlo" finds "źródło" and the other way round. */
const fold = (s: string) => s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')

let engine: Promise<MiniSearch<SearchDoc>> | null = null

/** Index built on first use: MiniSearch and data/search.json load only when someone searches. */
function getEngine() {
  engine ??= Promise.all([import('minisearch'), loadSearch()]).then(
    ([{ default: Mini }, index]) => {
      const ms = new Mini<SearchDoc>({
        fields: ['title', 'where', 'text'],
        storeFields: ['title', 'where'],
        processTerm: (t) => fold(t),
        searchOptions: { boost: { title: 4, where: 1.5 }, prefix: true, fuzzy: 0.2 },
      })
      ms.addAll(index.docs)
      return ms
    },
  )
  engine.catch(() => (engine = null))
  return engine
}

type Hit = Pick<SearchDoc, 'id' | 'title' | 'where'>

/** Topic search over every exam; results link straight to the topic screen. */
export function TopicSearch({ onActive }: { onActive?: (active: boolean) => void }) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[] | null>(null)
  const [failed, setFailed] = useState(false)
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const q = query.trim()

  useEffect(() => onActive?.(q.length > 0), [q, onActive])

  useEffect(() => {
    if (!q) return
    let live = true
    getEngine()
      .then((ms) => {
        if (!live) return
        setFailed(false)
        setHits(
          ms
            .search(q)
            .slice(0, 20)
            .map((r) => ({
              id: r.id as string,
              title: r.title as string,
              where: r.where as string,
            })),
        )
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [q])

  return (
    <search className="block">
      <label htmlFor={inputId} className="mb-2 block text-small font-bold text-ink-2">
        Szukaj tematu
      </label>
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-3"
        />
        <input
          ref={input}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => void getEngine().catch(() => undefined)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          placeholder="np. logarytmy, ułamki, czasy przeszłe"
          autoComplete="off"
          enterKeyHint="search"
          aria-controls={`${inputId}-results`}
          className="min-h-14 w-full rounded-xl border-2 border-line bg-surface pr-14 pl-12 text-body font-semibold text-ink outline-none placeholder:text-ink-3 focus-visible:border-brand [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              input.current?.focus()
            }}
            aria-label="Wyczyść wyszukiwanie"
            className="absolute top-1/2 right-1 grid size-12 -translate-y-1/2 place-items-center rounded-lg text-ink-2 hover:bg-surface-2"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}
      </div>

      <div id={`${inputId}-results`} aria-live="polite">
        {q && failed && (
          <p className="mt-4 text-body text-ink-2">
            Wyszukiwarka potrzebuje połączenia przy pierwszym użyciu.
          </p>
        )}
        {q && !failed && hits && (
          <>
            <p className="mt-4 text-small font-bold text-ink-2">
              {hits.length === 0
                ? `Brak tematów dla „${q}”. Spróbuj krótszego słowa.`
                : `${hits.length === 20 ? 'Pierwsze 20' : hits.length} ${resultsWord(hits.length)}`}
            </p>
            {hits.length > 0 && (
              <ul className="mt-2 flex flex-col gap-2">
                {hits.map((h) => (
                  <li key={h.id}>
                    <Link
                      to={`/app/egzaminy/${h.id}`}
                      className="flex min-h-16 items-center gap-3 rounded-xl bg-surface px-4 py-3 no-underline shadow-sm hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-body font-bold text-ink">{h.title}</span>
                        <span className="block truncate text-small text-ink-2">{h.where}</span>
                      </span>
                      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </search>
  )
}

function resultsWord(n: number) {
  if (n === 1) return 'temat'
  const d = n % 10
  const t = n % 100
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? 'tematy' : 'tematów'
}
