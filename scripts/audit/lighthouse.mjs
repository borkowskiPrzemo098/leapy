// Lighthouse (mobile) for key pages of a running production build:
//   npm run build && npm run preview -- --port 4173   (in another terminal)
//   node scripts/audit/lighthouse.mjs [baseUrl]
// Writes .impeccable/review/lighthouse/*.json and prints a score table; exits 1 below 95.
import { mkdirSync, writeFileSync } from 'node:fs'
import lighthouse from 'lighthouse'
import { chromium } from 'playwright'

const base = process.argv[2] ?? 'http://localhost:4173'
const pages = [
  '/',
  '/egzaminy/matura',
  '/egzaminy/matura/matematyka-p/logarytmy',
  '/blog/powtorki-rozlozone-w-czasie',
  '/faq',
  '/app',
  '/app/cwicz',
  '/app/postepy',
  '/app/egzaminy/matura/matematyka-p/logarytmy',
]
const out = '.impeccable/review/lighthouse'
mkdirSync(out, { recursive: true })

// Chromium from Playwright with a debugging port; Lighthouse attaches to it.
const PORT = 9333
// Performance varies run to run; as Lighthouse recommends, keep the median of several runs.
const RUNS = 3
const browser = await chromium.launch({ args: [`--remote-debugging-port=${PORT}`] })
const perf = (r) => r.lhr.categories.performance.score ?? 0
const rows = []
let worst = 100
try {
  for (const path of pages) {
    const runs = []
    for (let i = 0; i < RUNS; i++) {
      const one = await lighthouse(base + path, {
        port: PORT,
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false,
        },
      })
      if (one) runs.push(one)
    }
    if (!runs.length) continue
    runs.sort((a, b) => perf(a) - perf(b))
    const r = runs[Math.floor(runs.length / 2)]
    const c = { ...r.lhr.categories }
    // App routes are noindex by design, so SEO (is-crawlable) only counts on public pages.
    if (path.startsWith('/app')) delete c.seo
    const s = Object.fromEntries(
      Object.entries(c).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)]),
    )
    const failed = Object.values(r.lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary')
      .filter((a) => !(path.startsWith('/app') && a.id === 'is-crawlable'))
      .map((a) => a.id)
    rows.push({ path, ...s, failed: failed.join(', ') })
    worst = Math.min(worst, ...Object.values(s))
    writeFileSync(`${out}/${path.replace(/\W+/g, '_') || 'home'}.json`, r.report)
  }
} finally {
  await browser.close()
}
console.table(rows)
if (worst < 95) {
  console.error(`lighthouse: najniższy wynik ${worst} < 95`)
  process.exit(1)
}
