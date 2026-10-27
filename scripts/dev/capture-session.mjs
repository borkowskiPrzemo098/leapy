// Plays one topic session on the running dev server and screenshots every task before and
// after answering (one file per task type): node scripts/dev/capture-session.mjs [outDir] [topicPath]
/* global document */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const out = process.argv[2] ?? '.impeccable/review/session'
const topic = process.argv[3] ?? 'matura/matematyka-p/logarytmy'
const base = 'http://localhost:5180'
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(`${base}/app/sesja/temat/${topic}`)
await page.getByText('1 / 10').waitFor()

const seen = new Set()
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(300)
  const kind = await page.evaluate(() => {
    if (document.querySelector('#answer')) return 'text'
    if (document.querySelector('[aria-label="Do ułożenia"]')) return 'ordering'
    if (document.querySelector('[aria-label="Wartości do wyboru"]')) return 'match'
    if (document.querySelector('[role="radio"]')) return 'truefalse'
    return document.body.innerText.includes('Zaznacz wszystkie poprawne') ? 'multi' : 'single'
  })
  const first = !seen.has(kind)
  seen.add(kind)
  if (first) await page.screenshot({ path: `${out}/${kind}-1.png`, fullPage: true })
  const check = page.getByRole('button', { name: 'Sprawdź' })
  if (kind === 'text') {
    await page.locator('#answer').fill('2')
    await check.click()
  } else if (kind === 'ordering') {
    const pool = page.getByRole('list', { name: 'Do ułożenia' })
    while ((await pool.getByRole('button').count()) > 0)
      await pool.getByRole('button').first().click()
    if (first) await page.screenshot({ path: `${out}/${kind}-2.png`, fullPage: true })
    await check.click()
  } else if (kind === 'match') {
    const values = page.getByRole('list', { name: 'Wartości do wyboru' })
    const n = await page
      .getByRole('list', { name: 'Elementy do dopasowania' })
      .getByRole('button')
      .count()
    for (let j = 0; j < n; j++) await values.getByRole('button').nth(j).click()
    if (first) await page.screenshot({ path: `${out}/${kind}-2.png`, fullPage: true })
    await check.click()
  } else if (kind === 'truefalse') {
    for (const r of await page.getByRole('radio', { name: 'Prawda' }).all()) await r.click()
    await check.click()
  } else {
    await page.locator('main button[aria-pressed]').first().click()
    if (kind === 'multi') await check.click()
  }
  await page.waitForTimeout(450)
  if (first) await page.screenshot({ path: `${out}/${kind}-graded.png` })
  await page.getByRole('button', { name: /Dalej|Zobacz wynik/ }).click()
}
await page.waitForTimeout(400)
await page.screenshot({ path: `${out}/summary.png`, fullPage: true })
await browser.close()
console.log(`captured: ${[...seen].join(', ')}, summary`)
