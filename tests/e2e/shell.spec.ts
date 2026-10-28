import { expect, test } from '@playwright/test'

const screens = [
  ['Egzaminy', 'Egzaminy'],
  ['Ćwicz', 'Ćwicz'],
  ['Postępy', 'Postępy'],
  ['Profil', 'Profil'],
  ['Start', 'Cześć!'],
] as const

test('every tab opens its screen without horizontal scroll', async ({ page, isMobile }) => {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/app$/)
  const nav = page.getByRole('navigation', { name: 'Główna nawigacja' })
  for (const [link, heading] of screens) {
    // On desktop the centre action reads "Ćwicz teraz"
    const name = !isMobile && link === 'Ćwicz' ? 'Ćwicz teraz' : link
    await nav.getByRole('link', { name, exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `horizontal overflow on ${link}`).toBe(0)
  }
})

test('tab bar targets are at least 48px and sit above the fold', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'phone layout only')
  await page.goto('/app')
  const links = page.getByRole('navigation', { name: 'Główna nawigacja' }).getByRole('link')
  await expect(links).toHaveCount(5)
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  for (const link of await links.all()) {
    const box = await link.boundingBox()
    if (!box) throw new Error('tab not rendered')
    expect(box.height).toBeGreaterThanOrEqual(48)
    expect(box.width).toBeGreaterThanOrEqual(48)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
  }
})

test('theme and nickname persist across reloads', async ({ page }) => {
  await page.goto('/app/profil')
  await page.getByRole('radio', { name: 'Ciemny' }).click()
  await page.getByLabel('Nick').fill('Ola')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.goto('/app')
  await expect(page.getByRole('heading', { level: 1, name: 'Cześć, Ola!' })).toBeVisible()
})

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('/app')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  // First load is not controlled yet; reload so the service worker serves the page.
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)

  await context.setOffline(true)
  await page.goto('/app/postepy')
  await expect(page.getByRole('heading', { level: 1, name: 'Postępy' })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Offline' })).toBeVisible()
  await context.setOffline(false)
})

test('unknown app path shows the 404 screen', async ({ page }) => {
  await page.goto('/app/nie-ma-takiej')
  await expect(page.getByRole('heading', { level: 1, name: 'Nie ma takiego ekranu' })).toBeVisible()
})

test('picking an exam and subjects is remembered and shown on Start', async ({ page }) => {
  await page.goto('/app/egzaminy')
  await page.getByRole('button', { name: /^Matura/ }).click()
  await page
    .getByRole('button', { name: 'Dodaj do moich przedmiotów: Matematyka, poziom rozszerzony' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Usuń z moich przedmiotów: Matematyka, poziom rozszerzony' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.reload()
  await page.goto('/app')
  await expect(page.getByRole('heading', { level: 2, name: 'Matura' })).toBeVisible()
  await expect(page.getByText(/Matematyka \(poziom rozszerzony\)/)).toBeVisible()
})

test('a chosen subject is cached in the background and its tasks work offline', async ({
  page,
  context,
}) => {
  await page.goto('/app/egzaminy')
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
  await page.getByRole('button', { name: /^Matura/ }).click()
  await page
    .getByRole('button', { name: 'Dodaj do moich przedmiotów: Matematyka, poziom podstawowy' })
    .click()
  // The pack lands in the runtime cache
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const cache = await caches.open('leapy-content')
        return !!(await cache.match('/data/matura/matematyka-p.json'))
      }),
    )
    .toBe(true)

  await context.setOffline(true)
  await page.goto('/app/sesja/temat/matura/matematyka-p/logarytmy')
  await expect(page.getByText('1 / 10')).toBeVisible()
  await context.setOffline(false)
})
