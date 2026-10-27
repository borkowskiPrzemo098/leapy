// Captures review screenshots of the running dev server:
//   node scripts/dev/capture-review.mjs [outDir] [baseUrl]
import { chromium, devices } from 'playwright'

const out = process.argv[2] ?? '.impeccable/review'
const base = process.argv[3] ?? 'http://localhost:5180'
const phone = { width: 390, height: 844 }
const desk = { width: 1280, height: 800 }

// [file, viewport, path, colour scheme, options]
const shots = [
  ['mobile', phone, '/app', 'light', { ios: true }],
  ['mobile-practice', phone, '/app/cwicz', 'light'],
  ['mobile-exams-picked', phone, '/app/egzaminy', 'light', { pick: true }],
  ['mobile-progress', phone, '/app/postepy', 'light'],
  ['mobile-404', phone, '/app/nie-ma', 'dark'],
  ['mobile-profile-dark', phone, '/app/profil', 'dark'],
  ['phone-360', { width: 360, height: 640 }, '/app', 'light'],
  ['desktop', desk, '/app', 'light'],
  ['desktop-exams', desk, '/app/egzaminy', 'light', { pick: true }],
  ['desktop-practice', desk, '/app/cwicz', 'light'],
]

const browser = await chromium.launch()
for (const [name, viewport, path, colorScheme, opt = {}] of shots) {
  const ctx = await browser.newContext({
    viewport,
    colorScheme,
    ...(opt.ios ? { userAgent: devices['iPhone 13'].userAgent } : {}),
  })
  const page = await ctx.newPage()
  await page.goto(base + path)
  if (opt.pick) {
    await page.getByRole('button', { name: /^Matura/ }).click()
    await page.getByRole('button', { name: /Matematyka.*podstawowy/ }).click()
    await page
      .getByRole('button', { name: /polski/i })
      .last()
      .click()
  }
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: name.startsWith('mobile') })
  await ctx.close()
}
await browser.close()
console.log(`captured ${shots.length} screenshots into ${out}`)
