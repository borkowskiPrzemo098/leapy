// Prerenders the public pages to static HTML after `vite build`:
//   dist/<path>/index.html for every public route, dist/404.html, sitemap.xml, robots.txt and
//   _redirects (Cloudflare Pages: app routes fall back to the app shell, app.html).
// Run: node --import ./scripts/prerender/register.mjs --import tsx scripts/prerender/prerender.tsx
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { readKeys, seedResource } from '../../src/content/data'
import type { Catalog, SiteData, SubjectPack } from '../../src/content/schema'
import { HeadCollector, headHtml, type Head } from '../../src/public/head'
import { PublicApp } from '../../src/public/PublicApp'
import { SITE_URL } from '../../src/public/site'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const dist = join(root, 'dist')
const json = <T,>(p: string) => JSON.parse(readFileSync(join(dist, 'data', p), 'utf8')) as T

const catalog = json<Catalog>('catalog.json')
const site = json<SiteData>('site.json')
const data = new Map<string, unknown>([
  ['catalog', catalog],
  ['site', site],
])
for (const e of catalog.exams)
  for (const s of e.subjects)
    data.set(`pack:${e.id}/${s.id}`, json<SubjectPack>(`${e.id}/${s.id}.json`))
for (const [k, v] of data) seedResource(k, v)

// ---------- routes ----------
const routes: string[] = [
  '/',
  '/egzaminy',
  '/blog',
  '/faq',
  '/cennik',
  '/prywatnosc',
  '/regulamin',
  '/o-leapy',
]
for (const e of catalog.exams) {
  routes.push(`/egzaminy/${e.id}`)
  for (const s of e.subjects) {
    routes.push(`/egzaminy/${e.id}/${s.id}`)
    for (const sec of s.sections)
      for (const t of sec.topics) if (t.hasLesson) routes.push(`/egzaminy/${e.id}/${s.id}/${t.id}`)
  }
}
for (const p of site.posts) routes.push(`/blog/${p.slug}`)

/**
 * Data a page embeds: everything it read, except that a subject pack is trimmed to the topic
 * the page shows (the client fetches the full pack in the background after the first render).
 */
function embedFor(path: string) {
  const out: Record<string, unknown> = {}
  const topic = /^\/egzaminy\/[^/]+\/[^/]+\/([^/]+)$/.exec(path)?.[1]
  for (const k of readKeys) {
    const v = data.get(k)
    if (k.startsWith('pack:') && topic) {
      const p = v as SubjectPack
      out[k] = {
        ...p,
        lessons: { [topic]: p.lessons[topic] },
        tasks: p.tasks.filter((t) => t.topic === topic && t.type === 'single').slice(0, 1),
        cards: [],
      }
    } else if (k === 'site') {
      // Only what this page shows: post bodies on their own page, one static page, FAQ on /faq
      const s = v as SiteData
      const slug = path.split('/').pop() ?? ''
      out[k] = {
        ...s,
        posts: s.posts.map((p) => (path === `/blog/${p.slug}` ? p : { ...p, html: '' })),
        pages: s.pages[slug] ? { [slug]: s.pages[slug] } : {},
        faq: path === '/faq' ? s.faq : [],
      }
    } else out[k] = v
  }
  return out
}

// ---------- template ----------
const template = readFileSync(join(dist, 'index.html'), 'utf8')
  .replace(/\s*<title>[\s\S]*?<\/title>/, '')
  .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
  .replace(/\s*<meta property="og:[^>]*\/>/g, '')
if (!template.includes('<div id="root"></div>')) throw new Error('index.html: brak <div id="root">')

function render(path: string) {
  readKeys.clear()
  let head: Head | null = null
  const markup = renderToString(
    <HeadCollector.Provider value={(h) => (head = h)}>
      <StaticRouter location={path}>
        <PublicApp />
      </StaticRouter>
    </HeadCollector.Provider>,
  )
  if (!head) throw new Error(`${path}: strona nie ustawiła <head>`)
  const pageData = JSON.stringify(embedFor(path)).replace(/</g, '\\u003c')
  return {
    head: head as Head,
    html: template
      .replace('</head>', `  ${headHtml(head)}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
      .replace(
        '</body>',
        `  <script type="application/json" id="page-data">${pageData}</script>\n  </body>`,
      ),
  }
}

const written: string[] = []
for (const path of routes) {
  const { head, html } = render(path)
  if (head.noindex) throw new Error(`${path}: strona istnieje w spisie, a renderuje 404`)
  // Clean URLs: /egzaminy/matura → egzaminy/matura.html (Cloudflare Pages and vite preview serve it)
  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path.slice(1)}.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  written.push(path)
}
writeFileSync(join(dist, '404.html'), render('/404').html)

// ---------- sitemap, robots, redirects ----------
const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${written.map((p) => `  <url><loc>${SITE_URL}${p === '/' ? '/' : p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
)
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /app
Disallow: /dev

Sitemap: ${SITE_URL}/sitemap.xml
`,
)
writeFileSync(
  join(dist, '_redirects'),
  `/app /app.html 200\n/app/* /app.html 200\n/dev/* /app.html 200\n`,
)

if (!existsSync(join(dist, 'app.html'))) throw new Error('dist/app.html: brak powłoki aplikacji')
const pages = readdirSync(dist).length
console.log(
  `prerender: ${written.length} stron + 404, sitemap.xml, robots.txt, _redirects (${pages} pozycji w dist)`,
)
