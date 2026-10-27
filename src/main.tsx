import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { createRouter, loadPublic } from './app/router'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing in index.html')

let embeddedKeys: Record<string, unknown> = {}
const isApp = /^\/(app|dev)(\/|$)/.test(location.pathname)

async function start(el: HTMLElement) {
  if (!isApp) {
    // Public page: load its chunk and the data embedded by the prerender before rendering,
    // so React's first render matches the static HTML.
    const [{ seedResource }] = await Promise.all([import('./content/data'), loadPublic()])
    const embedded = document.getElementById('page-data')
    if (embedded?.textContent) {
      embeddedKeys = JSON.parse(embedded.textContent) as Record<string, unknown>
      for (const [k, v] of Object.entries(embeddedKeys)) seedResource(k, v)
    }
  }
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={createRouter()} />
    </StrictMode>,
  )
  if (!isApp) {
    // Embedded data is trimmed to the first page; load the full files for later navigation.
    const data = await import('./content/data')
    void data.loadSite().then((d) => data.seedResource('site', d))
    for (const k of Object.keys(embeddedKeys))
      if (k.startsWith('pack:')) {
        const [exam = '', subject = ''] = k.slice(5).split('/')
        void data.loadPack(exam, subject).then((p) => data.seedResource(k, p))
      }
  }
}
void start(root)
