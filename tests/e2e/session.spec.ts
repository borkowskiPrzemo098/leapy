import { expect, test, type Page } from '@playwright/test'

// Plays one full topic session, answering every task type with whatever is on screen,
// then checks the summary, the recorded progress and the error-report link.

async function answerCurrent(page: Page) {
  const check = page.getByRole('button', { name: 'Sprawdź' })
  const input = page.getByLabel('Twoja odpowiedź')
  if (await input.isVisible().catch(() => false)) {
    await input.fill('1')
    await check.click()
    return
  }
  const order = page.getByRole('list', { name: 'Do ułożenia' })
  if (await order.isVisible().catch(() => false)) {
    while ((await order.getByRole('button').count()) > 0)
      await order.getByRole('button').first().click()
    await check.click()
    return
  }
  const values = page.getByRole('list', { name: 'Wartości do wyboru' })
  if (await values.isVisible().catch(() => false)) {
    const n = await page
      .getByRole('list', { name: 'Elementy do dopasowania' })
      .getByRole('button')
      .count()
    for (let i = 0; i < n; i++) await values.getByRole('button').nth(i).click()
    await check.click()
    return
  }
  const radios = page.getByRole('radio', { name: 'Prawda' })
  if ((await radios.count()) > 0) {
    for (const r of await radios.all()) await r.click()
    await check.click()
    return
  }
  // single (answers on tap) or multi (toggle, then check)
  await page.locator('main button[aria-pressed]').first().click()
  if (await check.isVisible().catch(() => false)) await check.click()
}

test('a full topic session records progress and ends with a summary', async ({ page }) => {
  await page.goto('/app/egzaminy/matura/matematyka-p/procenty')
  await expect(page.getByRole('heading', { name: 'Najważniejsze w 30 sekund' })).toBeVisible()
  await page.getByRole('link', { name: /Ćwicz temat/ }).click()

  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`${i + 1} / 10`)).toBeVisible()
    await answerCurrent(page)
    const feedback = page
      .getByRole('status')
      .filter({ has: page.getByRole('button', { name: /Dalej|Zobacz wynik/ }) })
    await expect(feedback).toBeVisible()
    await expect(feedback.getByRole('link', { name: 'Zgłoś błąd w zadaniu' })).toHaveAttribute(
      'href',
      /^mailto:.*procenty\.\d{3}/,
    )
    await feedback.getByRole('button', { name: /Dalej|Zobacz wynik/ }).click()
  }

  await expect(page.getByRole('heading', { level: 1, name: /z 10$/ })).toBeVisible()
  await page.getByRole('link', { name: 'Wróć' }).click()
  await page.getByRole('link', { name: 'Wróć do tematów' }).click()
  await expect(page.getByText(/10 zadań · \d+% poprawnych/)).toBeVisible()
})

test('quick session asks for an exam first, then mixes tasks from chosen subjects', async ({
  page,
}) => {
  await page.goto('/app/cwicz')
  await page.getByRole('link', { name: 'Najpierw wybierz egzamin' }).click()
  await page.getByRole('button', { name: /^Matura/ }).click()
  await page
    .getByRole('button', { name: /Dodaj do moich przedmiotów: Matematyka, poziom podstawowy/ })
    .click()
  await page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .getByRole('link', { name: /^Ćwicz/ })
    .click()
  await page.getByRole('link', { name: 'Zacznij szybką sesję' }).click()
  await expect(page.getByText('1 / 10')).toBeVisible()
})

test('backup export produces a valid file and import restores it', async ({ page }) => {
  await page.goto('/app/egzaminy')
  await page.getByRole('button', { name: /^Egzamin ósmoklasisty/ }).click()
  await page.getByRole('button', { name: /Dodaj do moich przedmiotów: Matematyka$/ }).click()
  await page.goto('/app/profil')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Zapisz kopię' }).click()
  const file = await (await download).path()
  expect(file).toBeTruthy()

  await page.getByRole('button', { name: 'Usuń wszystkie postępy' }).click()
  await page.getByRole('button', { name: 'Tak, usuń' }).click()
  await expect(page.getByText('Wszystkie postępy zostały usunięte')).toBeVisible()

  await page.locator('input[type=file]').setInputFiles(file)
  await page.getByRole('button', { name: 'Wczytaj i zastąp' }).click()
  await expect(page.getByText(/Wczytano kopię/)).toBeVisible()
  await page.goto('/app')
  await expect(page.getByRole('heading', { level: 2, name: 'Egzamin ósmoklasisty' })).toBeVisible()
})
