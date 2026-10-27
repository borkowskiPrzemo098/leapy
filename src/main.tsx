import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { createRouter, loadPublic } from './app/router'
import { loadPack, loadSite, seedResource } from './content/data'

const root = document.getElementById('root')
if (!root) throw new Error('#root missing in index.html')

let embeddedKeys: Record<string, unknown> = {}
const isApp = /^\/(app|dev)(\/|$)/.test(location.pathname)

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
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={createRouter()} />
    </StrictMode>,
  )
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
