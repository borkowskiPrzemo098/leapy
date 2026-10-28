import { useEffect, useState } from 'react'
import type { Catalog, CompiledTask, SearchIndex, SiteData, SubjectPack, TopicFile } from './schema'
import { DATA_VERSION } from './version'

// Loads compiled content from /data (precached by the service worker, so it works offline).
// Each file is fetched once per page load; components read it through useResource().

const cache = new Map<string, Promise<unknown>>()

function load<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined
  if (!p) {
    p = fetch(url).then(async (r) => {
      if (!r.ok) throw new Error(`Nie udało się wczytać treści (${r.status}).`)
      const data = (await r.json()) as { version?: number }
      if (data.version !== DATA_VERSION)
        throw new Error('Treść pochodzi z innej wersji aplikacji. Odśwież stronę.')
      return data as T
    })
    p.catch(() => cache.delete(url))
    cache.set(url, p)
  }
  return p
}

export const loadCatalog = () => load<Catalog>('/data/catalog.json')
export const loadPack = (exam: string, subject: string) =>
  load<SubjectPack>(`/data/${exam}/${subject}.json`)
export const loadSite = () => load<SiteData>('/data/site.json')
export const loadSearch = () => load<SearchIndex>('/data/search.json')

// Resources already in memory, by useResource key. Prerendered public pages embed the data
// they were built from and seed it here, so their first render matches the HTML (no flash).
const ready = new Map<string, unknown>()
// Only static content is kept; learner data (stats) must re-read every time.
const cacheable = (key: string) =>
  key === 'catalog' || key === 'site' || key.startsWith('pack:') || key.startsWith('topic:')
/** Keys read during this render pass (the prerender script embeds exactly these). */
export const readKeys = new Set<string>()

export function seedResource(key: string, data: unknown) {
  ready.set(key, data)
}

export type Resource<T> =
  { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; data: T }

/** Minimal async-resource hook: re-runs when `key` changes. */
export function useResource<T>(key: string | null, loader: () => Promise<T>): Resource<T> {
  const cached = key !== null && ready.has(key) ? (ready.get(key) as T) : undefined
  if (key !== null && cached !== undefined) readKeys.add(key)
  const [state, setState] = useState<{ key: string | null; res: Resource<T> }>({
    key,
    res: { status: 'loading' },
  })
  useEffect(() => {
    if (key === null || ready.has(key)) return
    let alive = true
    loader().then(
      (data) => {
        if (cacheable(key)) ready.set(key, data)
        if (alive) setState({ key, res: { status: 'ready', data } })
      },
      (e: unknown) =>
        alive &&
        setState({
          key,
          res: { status: 'error', error: e instanceof Error ? e.message : String(e) },
        }),
    )
    return () => {
      alive = false
    }
    // loader is derived from key by every caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  if (cached !== undefined) return { status: 'ready', data: cached }
  return state.key === key ? state.res : { status: 'loading' }
}

export const useCatalog = () => useResource('catalog', loadCatalog)
export const useSite = () => useResource('site', loadSite)
export const usePack = (exam: string, subject: string) =>
  useResource(`pack:${exam}/${subject}`, () => loadPack(exam, subject))

/** A topic's lesson: from the pack when it is already in memory, else from the small topic file. */
export function loadTopic(exam: string, subject: string, topic: string): Promise<TopicFile> {
  const fromPack = (p: SubjectPack): TopicFile => ({
    version: p.version,
    lesson: p.lessons[topic] ?? null,
    taskCount: tasksOfTopic(p, topic).length,
  })
  const inMemory = ready.get(`pack:${exam}/${subject}`) as SubjectPack | undefined
  if (inMemory) return Promise.resolve(fromPack(inMemory))
  // Offline with only the pack cached: fall back to it.
  return load<TopicFile>(`/data/${exam}/${subject}/${topic}.json`).catch(() =>
    loadPack(exam, subject).then(fromPack),
  )
}

export function findSubject(catalog: Catalog, exam: string, subject: string) {
  const e = catalog.exams.find((x) => x.id === exam)
  const s = e?.subjects.find((x) => x.id === subject)
  return e && s ? { exam: e, subject: s } : null
}

export function findTopic(catalog: Catalog, exam: string, subject: string, topic: string) {
  const found = findSubject(catalog, exam, subject)
  if (!found) return null
  for (const section of found.subject.sections) {
    const t = section.topics.find((x) => x.id === topic)
    if (t) return { ...found, section, topic: t }
  }
  return null
}

export const subjectLabel = (s: { name: string; level?: string }) =>
  s.level ? `${s.name} · poziom ${s.level}` : s.name

export const tasksOfTopic = (pack: SubjectPack, topic: string): CompiledTask[] =>
  pack.tasks.filter((t) => t.topic === topic)
