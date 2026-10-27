// Generates every brand file from src/brand/geometry.js:
/* global document */
//   brand/concepts/*.svg   three logo concepts (A, B, C)
//   brand/final/*.svg      chosen concept C: lockups, mark, wordmark, light/dark/mono
//   public/                favicon.svg, PNG icons, apple-touch-icon, OG image
// PNGs are rendered with Playwright's Chromium so they match the browser exactly.
// Usage: npm run brand:build

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { BRAND, WORD_BOX, mark, sparkle, svg, wordmark } from '../../src/brand/geometry.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = (p) => resolve(root, p)

async function write(path, content) {
  await mkdir(dirname(out(path)), { recursive: true })
  await writeFile(out(path), content)
}

// ---------- Concepts ----------

// A "Skok L": the l takes off, a dotted arc carries it over "eap",
// and it lands as the y one step higher. A stepped baseline names the two levels.
const conceptA = svg(
  '-8 -32 284 186',
  `${wordmark({ rise: [0, 0, 0, 0, -16] })}
  <path d="M10 18C60 -34 196 -34 252 32" fill="none" stroke="${BRAND.violet}" stroke-width="6" stroke-linecap="round" stroke-dasharray="0 13"/>
  <path d="${sparkle(256, 30, 9)}" fill="${BRAND.sun}" stroke="${BRAND.sun}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M-2 146H206V130H268" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".35"/>`,
  'Leapy, koncepcja A: Skok L',
)

// B "Schody": every letter stands one stair higher; the p is mid-jump,
// lifted off its stair with a small puff of motion under it.
const stairRise = [0, -5, -10, -41, -20]
const conceptB = svg(
  '-8 4 284 128',
  `<defs><mask id="b-gap"><rect x="-10" y="0" width="300" height="160" fill="#fff"/>
    <path d="M259.5 40L228 108" stroke="#000" stroke-width="25" stroke-linecap="round"/></mask></defs>
  ${wordmark({ rise: stairRise })}
  <path d="M-2 116H18V111H83V106H147V101H211V96H268" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" mask="url(#b-gap)" opacity=".45"/>
  <g fill="${BRAND.violet}"><circle cx="170" cy="88" r="5"/><circle cx="181" cy="85" r="6.5"/><circle cx="192" cy="89" r="4.5"/></g>`,
  'Leapy, koncepcja B: Schody',
)

// C "Ikona": app tile with an L whose foot bends into a leap arc ending in a spark.
const conceptC = svg('0 0 512 512', mark({ id: 'c' }), 'Leapy, koncepcja C: Ikona')

await write('brand/concepts/A-skok-l.svg', conceptA)
await write('brand/concepts/B-schody.svg', conceptB)
await write('brand/concepts/C-ikona.svg', conceptC)

// ---------- Final (concept C) ----------

const wb = WORD_BOX
const wordOnly = (color) => svg(`${wb.x} ${wb.y} ${wb.w} ${wb.h}`, wordmark({ color }), 'Leapy')

// Horizontal lockup: 128px tile, wordmark x-height centred on the tile.
function horizontal({ word, mono = false, id, tileOpts = {} }) {
  const s = 0.82
  const tile = mono ? mark({ mono: true, id }) : mark({ id, ...tileOpts })
  return svg(
    '0 0 380 128',
    `<g transform="scale(0.25)">${tile}</g><g transform="translate(156 ${64 - 80 * s}) scale(${s})">${wordmark({ color: word })}</g>`,
  )
}

// Vertical lockup: tile above, wordmark centred under it.
function vertical({ word, mono = false, id }) {
  const s = 0.8
  const tile = mono ? mark({ mono: true, id }) : mark({ id })
  const ww = 266 * s
  return svg(
    '0 0 240 284',
    `<g transform="translate(40 0) scale(0.3125)">${tile}</g><g transform="translate(${(240 - ww) / 2} ${184 - 23.5 * s}) scale(${s})">${wordmark({ color: word })}</g>`,
  )
}

// On a violet field the tile inverts to white so it doesn't vanish into the ground.
const horizontalOnColor = () =>
  horizontal({ word: BRAND.white, id: 'oc', tileOpts: { tile: BRAND.white, l: BRAND.violet } })

const finals = {
  'brand/final/logo-horizontal-on-violet.svg': horizontalOnColor(),
  'brand/final/logo-horizontal.svg': horizontal({ word: BRAND.ink, id: 'hl' }),
  'brand/final/logo-horizontal-dark.svg': horizontal({ word: BRAND.white, id: 'hd' }),
  'brand/final/logo-horizontal-mono.svg': horizontal({
    word: 'currentColor',
    mono: true,
    id: 'hm',
  }),
  'brand/final/logo-vertical.svg': vertical({ word: BRAND.ink, id: 'vl' }),
  'brand/final/logo-vertical-dark.svg': vertical({ word: BRAND.white, id: 'vd' }),
  'brand/final/logo-vertical-mono.svg': vertical({ word: 'currentColor', mono: true, id: 'vm' }),
  'brand/final/mark.svg': svg('0 0 512 512', mark({ id: 'mk' })),
  'brand/final/mark-dark.svg': svg(
    '0 0 512 512',
    mark({ id: 'mkd', tile: BRAND.white, l: BRAND.violet }),
  ),
  'brand/final/mark-mono.svg': svg('0 0 512 512', mark({ mono: true, id: 'mkm' })),
  'brand/final/wordmark.svg': wordOnly(BRAND.ink),
  'brand/final/wordmark-dark.svg': wordOnly(BRAND.white),
  'brand/final/wordmark-mono.svg': wordOnly('currentColor'),
  'public/favicon.svg': svg('0 0 512 512', mark({ id: 'fv' })),
  'public/brand/logo-horizontal.svg': horizontal({ word: BRAND.ink, id: 'phl' }),
  'public/brand/logo-horizontal-dark.svg': horizontal({ word: BRAND.white, id: 'phd' }),
}
for (const [path, content] of Object.entries(finals)) await write(path, content)

// ---------- PNG rasters ----------

const fontCss = await readFile(
  out(
    'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-wght-normal.woff2',
  ),
)
const fontLatin = await readFile(
  out(
    'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2',
  ),
)
const fontFace = `
@font-face{font-family:PJS;src:url(data:font/woff2;base64,${fontLatin.toString('base64')}) format('woff2');font-weight:200 800;unicode-range:U+0000-00FF}
@font-face{font-family:PJS;src:url(data:font/woff2;base64,${fontCss.toString('base64')}) format('woff2');font-weight:200 800;unicode-range:U+0100-024F}`

const rasters = [
  // [file, size, svg body]: transparent corners for "any" icons, full bleed where the OS masks
  ['public/favicon-32.png', 32, mark({ id: 'r32' })],
  ['public/icons/pwa-192.png', 192, mark({ id: 'r192' })],
  ['public/icons/pwa-512.png', 512, mark({ id: 'r512' })],
  ['public/icons/maskable-512.png', 512, mark({ id: 'rm', square: true, scale: 0.72 })],
  ['public/apple-touch-icon.png', 180, mark({ id: 'ra', square: true, scale: 0.84 })],
  ['brand/final/png/mark-1024.png', 1024, mark({ id: 'r1k' })],
]

// OG: violet field, mark, wordmark and the tagline climbing a stair line.
const og = `<!doctype html><meta charset="utf-8"><style>${fontFace}
html,body{margin:0}
.og{width:1200px;height:630px;background:${BRAND.violet};position:relative;overflow:hidden;font-family:PJS;color:#fff}
.stairs{position:absolute;inset:0}
.logo{position:absolute;left:96px;top:96px;width:440px}
h1{position:absolute;left:96px;top:300px;margin:0;font-size:84px;line-height:1;font-weight:800;letter-spacing:-.025em;width:760px}
p{position:absolute;left:96px;bottom:84px;margin:0;font-size:28px;font-weight:600;color:#d9d2ff}
</style><div class="og">
<svg class="stairs" viewBox="0 0 1200 630"><path d="M700 630V520H840V410H980V300H1120V190H1200V630Z" fill="${BRAND.violetDeep}" opacity=".55"/><path d="${sparkle(1060, 130, 34)}" fill="${BRAND.sun}" stroke="${BRAND.sun}" stroke-width="8" stroke-linejoin="round"/></svg>
<div class="logo">${horizontalOnColor().replace('<svg ', '<svg width="440" ')}</div>
<h1>Skocz na wyższy poziom.</h1>
<p>Nauka do egzaminu ósmoklasisty i matury. Za darmo, offline.</p>
</div>`

const browser = await chromium.launch()
const page = await browser.newPage({ deviceScaleFactor: 1 })
for (const [file, size, body] of rasters) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg('0 0 512 512', body)}`,
  )
  await mkdir(dirname(out(file)), { recursive: true })
  await page.screenshot({ path: out(file), omitBackground: true })
}
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(og, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: out('public/og-default.png') })
await browser.close()

console.log(`brand: ${3 + Object.keys(finals).length} SVG + ${rasters.length + 1} PNG written`)
