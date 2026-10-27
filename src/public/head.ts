import { createContext, useContext, useEffect } from 'react'
import { SITE_NAME, SITE_URL } from './site'

// Title, description, canonical, Open Graph and JSON-LD for public pages.
// During prerender a collector receives the values; in the browser the document is updated.

export interface Head {
  title: string
  description: string
  /** Path, e.g. "/egzaminy/matura" */
  path: string
  image?: string
  type?: 'website' | 'article'
  jsonLd?: object[]
  /** Pages that should not be indexed (404) */
  noindex?: boolean
}

/** Prerender passes a callback that receives the page head. */
export const HeadCollector = createContext<((h: Head) => void) | null>(null)

export const fullTitle = (t: string) => (t.includes('Leapy') ? t : `${t} · ${SITE_NAME}`)

export function useHead(h: Head) {
  const collector = useContext(HeadCollector)
  collector?.(h)
  const key = JSON.stringify(h)
  useEffect(() => {
    document.title = fullTitle(h.title)
    const set = (selector: string, attr: string, value: string, create: () => HTMLElement) => {
      let el = document.head.querySelector<HTMLElement>(selector)
      if (!el) {
        el = create()
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }
    const meta =
      (name: string, prop = false) =>
      () => {
        const m = document.createElement('meta')
        m.setAttribute(prop ? 'property' : 'name', name)
        return m
      }
    set('meta[name="description"]', 'content', h.description, meta('description'))
    set('meta[property="og:title"]', 'content', fullTitle(h.title), meta('og:title', true))
    set('meta[property="og:description"]', 'content', h.description, meta('og:description', true))
    set('link[rel="canonical"]', 'href', SITE_URL + h.path, () => {
      const l = document.createElement('link')
      l.rel = 'canonical'
      return l
    })
    // key captures every field
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

/** <head> markup for the prerender script. */
export function headHtml(h: Head) {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const url = SITE_URL + h.path
  const image = SITE_URL + (h.image ?? '/og-default.png')
  const tags = [
    `<title>${esc(fullTitle(h.title))}</title>`,
    `<meta name="description" content="${esc(h.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${h.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="pl_PL" />`,
    `<meta property="og:title" content="${esc(fullTitle(h.title))}" />`,
    `<meta property="og:description" content="${esc(h.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    h.noindex ? `<meta name="robots" content="noindex" />` : '',
    ...(h.jsonLd ?? []).map(
      (j) =>
        `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`,
    ),
  ]
  return tags.filter(Boolean).join('\n    ')
}
