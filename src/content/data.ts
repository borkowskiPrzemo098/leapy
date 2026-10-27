import { useEffect, useState } from 'react'
import type { Catalog, CompiledTask, SubjectPack } from './schema'
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

export type Resource<T> =
  { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; data: T }

/** Minimal async-resource hook: re-runs when `key` changes. */
export function useResource<T>(key: string | null, loader: () => Promise<T>): Resource<T> {
  const [state, setState] = useState<{ key: string | null; res: Resource<T> }>({
    key,
    res: { status: 'loading' },
  })
  useEffect(() => {
    if (key === null) return
    let alive = true
    loader().then(
      (data) => alive && setState({ key, res: { status: 'ready', data } }),
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
  return state.key === key ? state.res : { status: 'loading' }
}

export const useCatalog = () => useResource('catalog', loadCatalog)

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
