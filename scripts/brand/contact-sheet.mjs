// Renders every logo file onto one PNG for visual review: node scripts/brand/contact-sheet.mjs <out.png>
import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const r = (p) => readFileSync(p, 'utf8')
const png = (p, w) =>
  `<img src="data:image/png;base64,${readFileSync(p).toString('base64')}" width="${w}" alt="">`
const cell = (f, w, bg = '#fff', col = '#17123a') =>
  `<div style="background:${bg};color:${col};padding:24px;border-radius:16px"><div style="width:${w}px">${r(f).replace('<svg ', '<svg style="width:100%;height:auto;display:block" ')}</div><small style="font:12px sans-serif;opacity:.6">${f}</small></div>`

const html = `<body style="margin:0;padding:24px;background:#ddd;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
${cell('brand/concepts/A-skok-l.svg', 420)}${cell('brand/concepts/B-schody.svg', 420)}${cell('brand/concepts/C-ikona.svg', 200)}
${cell('brand/final/logo-horizontal.svg', 380)}${cell('brand/final/logo-horizontal-dark.svg', 380, '#0e0a22')}${cell('brand/final/logo-horizontal-mono.svg', 380, '#fff', '#5b3df5')}
${cell('brand/final/logo-vertical.svg', 200)}${cell('brand/final/mark-dark.svg', 120, '#0e0a22')}${cell('brand/final/mark-mono.svg', 120)}
${png('public/icons/maskable-512.png', 160)}${png('public/favicon-32.png', 32)}${png('public/apple-touch-icon.png', 90)}
${png('public/og-default.png', 600)}
</body>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })
await page.setContent(html)
await page.screenshot({ path: process.argv[2] ?? 'contact-sheet.png', fullPage: true })
await browser.close()
