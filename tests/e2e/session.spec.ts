import { expect, test } from '@playwright/test'
import { answerCurrent } from './helpers'

// Plays one full topic session, answering every task type with whatever is on screen,
// then checks the summary, the recorded progress and the error-report link.

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
