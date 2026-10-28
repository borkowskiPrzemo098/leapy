import { expect, test } from '@playwright/test'

// Public, prerendered pages: static HTML with content and SEO tags before any JavaScript runs,
// then the same page in the browser, navigation into the app, and the site files.

test('home is prerendered with content, meta and JSON-LD', async ({ request }) => {
  const res = await request.get('/')
  expect(res.status()).toBe(200)
  const html = await res.text()
  expect(html).toContain('Skocz na wyższy poziom.')
  expect(html).toContain('<link rel="canonical" href="https://leapy.pages.dev/" />')
  expect(html).toMatch(/<meta name="description" content="Darmowa nauka/)
  expect(html).toContain('"@type":"Organization"')
  expect(html).toContain('id="page-data"')
})

test('topic page is prerendered with the lesson, breadcrumbs and LearningResource', async ({
  request,
}) => {
  const html = await (await request.get('/egzaminy/matura/matematyka-p/logarytmy')).text()
  expect(html).toContain('<title>Logarytmy: lekcja i zadania (matura) · Leapy</title>')
  expect(html).toContain('Najważniejsze w 30 sekund')
  expect(html).toContain('class="katex"')
  expect(html).toContain('"@type":"BreadcrumbList"')
  expect(html).toContain('"@type":"LearningResource"')
})

test('sitemap, robots, redirects and a noindex 404', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('<loc>https://leapy.pages.dev/egzaminy/matura</loc>')
  expect(sitemap).toContain('/blog/powtorki-rozlozone-w-czasie</loc>')
  expect(sitemap).not.toContain('/app')
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Disallow: /app')
  expect(robots).toContain('Sitemap: https://leapy.pages.dev/sitemap.xml')
  expect(await (await request.get('/404.html')).text()).toContain('content="noindex"')
})

test('browse from home to a topic and into the app', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Skocz na wyższy poziom.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: /^Szkoła średnia\s*Matura/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Matura' })).toBeVisible()
  await page
    .getByRole('link', { name: /Matematyka · poziom podstawowy/ })
    .first()
    .click()
  await page.getByRole('link', { name: /^Logarytmy/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Logarytmy' })).toBeVisible()
  await expect(page).toHaveTitle('Logarytmy: lekcja i zadania (matura) · Leapy')
  await page.getByText('Pokaż rozwiązanie').click()
  await expect(page.getByText(/^Odpowiedź [A-D]\.$/)).toBeVisible()
  await page.getByRole('link', { name: 'Otwórz w aplikacji' }).click()
  await expect(page).toHaveURL(/\/app\/egzaminy\/matura\/matematyka-p\/logarytmy$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Logarytmy' })).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)
  expect(errors).toEqual([])
})

test('blog, FAQ, pricing and legal pages render', async ({ page }) => {
  await page.goto('/blog')
  await page.getByRole('link', { name: /Powtórki rozłożone w czasie/ }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: /Powtórki rozłożone w czasie/ }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Krzywa zapominania' })).toBeVisible()

  await page.goto('/faq')
  await page.getByText('Czy Leapy jest darmowe?').click()
  await expect(
    page.getByText('Wszystkie obecne funkcje są bezpłatne', { exact: false }),
  ).toBeVisible()

  await page.goto('/cennik')
  await expect(page.getByRole('heading', { name: '0 zł' })).toBeVisible()

  for (const [path, title] of [
    ['/prywatnosc', 'Polityka prywatności'],
    ['/regulamin', 'Regulamin'],
    ['/o-leapy', 'O Leapy'],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  }
  await page.goto('/nie-ma-takiej-strony')
  await expect(page.getByRole('heading', { level: 1, name: 'Nie ma takiej strony' })).toBeVisible()
})

test('the sample task on the home page can be answered', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '½' }).click()
  await expect(page.getByText('Nie tym razem.')).toBeVisible()
  await page.getByRole('button', { name: /Spróbuj jeszcze raz/ }).click()
  await page.getByRole('button', { name: /^2/ }).first().click()
  await expect(page.getByText('Jest! Dobrze.')).toBeVisible()
})
