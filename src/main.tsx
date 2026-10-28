import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { createRouter, loadPublic } from './app/router'
import { routePath } from './lib/env'
import { loadCatalog, loadPack, loadSite, loadTopic, seedResource } from './content/data'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing in index.html')

let embeddedKeys: Record<string, unknown> = {}
const path = routePath(location.pathname)
const isApp = /^\/(app|dev)(\/|$)/.test(path)
// Deep link into a subject: start fetching its pack now, in parallel with the route chunk.
const deep = /^\/app\/egzaminy\/([a-z0-9-]+)\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/.exec(path)
if (deep?.[3]) {
  void loadTopic(deep[1] ?? '', deep[2] ?? '', deep[3]).catch(() => undefined)
  void import('@/routes/TopicPage') // same chunk the router loads lazily
} else if (deep) void loadPack(deep[1] ?? '', deep[2] ?? '').catch(() => undefined)
// Every app screen needs the catalog; do not wait for the route chunk to ask for it.
if (isApp) void loadCatalog().catch(() => undefined)

async function start(el: HTMLElement) {
  if (!isApp) {
    // Public page: load its chunk and the data embedded by the prerender before rendering,
    // so React's first render matches the static HTML.
    await loadPublic()
    const embedded = document.getElementById('page-data')
    if (embedded?.textContent) {
      embeddedKeys = JSON.parse(embedded.textContent) as Record<string, unknown>
      for (const [k, v] of Object.entries(embeddedKeys)) seedResource(k, v)
    }
  }
  const app = (
    <StrictMode>
      <RouterProvider router={createRouter()} />
    </StrictMode>
  )
  // Prerendered public pages are hydrated, not replaced: the static text stays the painted
  // (LCP) element instead of being redrawn once the JS arrives.
  if (!isApp && el.hasChildNodes()) hydrateRoot(el, app)
  else {
    // GitHub Pages serves /app/* deep links from 404.html: drop its static "not found" markup.
    el.removeAttribute('data-fallback')
    el.replaceChildren()
    createRoot(el).render(app)
  }
  if (!isApp) {
    // Embedded data is trimmed to the first page; load the full files for later navigation.
    void loadSite().then((d) => seedResource('site', d))
    for (const k of Object.keys(embeddedKeys))
      if (k.startsWith('pack:')) {
        const [exam = '', subject = ''] = k.slice(5).split('/')
        void loadPack(exam, subject).then((p) => seedResource(k, p))
      }
  }
}
void start(root)
