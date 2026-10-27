import { expect, test } from '@playwright/test'
import { answerCurrent } from './helpers'

// The new-learner path from zero to the first share card:
// onboarding → 5-task test → rewards → share card → dashboard and badges.

test.use({ storageState: { cookies: [], origins: [] } })

test('new learner: onboarding, first test, rewards and a share card', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/app\/witaj$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Do czego się przygotowujesz?' }),
  ).toBeVisible()

  await page.getByRole('button', { name: /^Matura/ }).click()
  await expect(page.getByRole('heading', { name: 'Które przedmioty zdajesz?' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dalej' })).toBeDisabled()
  await page.getByRole('button', { name: /Matematyka · poziom podstawowy/ }).click()
  await page.getByRole('button', { name: 'Dalej' }).click()

  await page.getByRole('button', { name: /^Regularnie/ }).click()
  await expect(page.getByRole('heading', { name: 'Gotowe' })).toBeVisible()
  await page.getByRole('button', { name: 'Zrób test na start' }).click()

  for (let i = 0; i < 5; i++) {
    await expect(page.getByText(`${i + 1} / 5`)).toBeVisible()
    await answerCurrent(page)
    await page.getByRole('button', { name: /Dalej|Zobacz wynik/ }).click()
  }
  await expect(page.getByRole('heading', { level: 1, name: /z 5$/ })).toBeVisible()
  await expect(page.getByText(/^\+\d+ XP$/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Nowa odznaka|Nowe odznaki/ })).toBeVisible()
  await expect(page.getByText('Pierwszy stopień', { exact: true })).toBeVisible()

  // Share card: drawn locally, both formats, downloaded where Web Share has no files
  await page.getByRole('button', { name: 'Udostępnij wynik' }).click()
  const dialog = page.getByRole('dialog', { name: 'Karta do udostępnienia' })
  await expect(dialog.getByRole('img', { name: /^Karta: Test na start/ })).toBeVisible()
  const size = await dialog
    .getByRole('img')
    .evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight])
  expect(size).toEqual([1080, 1350])
  await dialog.getByRole('radio', { name: 'Relacja 9:16' }).click()
  await expect
    .poll(() => dialog.getByRole('img').evaluate((img: HTMLImageElement) => img.naturalHeight))
    .toBe(1920)
  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Udostępnij lub zapisz' }).click()
  expect((await download).suggestedFilename()).toBe('leapy-story.png')
  await dialog.getByRole('button', { name: 'Zamknij' }).click()

  // Dashboard: no onboarding again, today's goal and level are shown
  await page.getByRole('link', { name: 'Wróć' }).click()
  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Dziś' })).toBeVisible()
  await expect(page.getByText('Jeszcze 5 do celu')).toBeVisible()
  await expect(page.getByText('Stopień 1')).toBeVisible()

  // The badge notice is shown once
  await page.goto('/app/postepy')
  await expect(page.getByRole('heading', { name: 'Odznaki' })).toBeVisible()
  await expect(page.getByText(/^1 z 12 · stopień 1/)).toBeVisible()
})

test('onboarding can be skipped and does not come back', async ({ page }) => {
  await page.goto('/app')
  await page.getByRole('button', { name: 'Pomiń' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Cześć!' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Cześć!' })).toBeVisible()
})

test('profile: goals and the calendar reminder file', async ({ page }) => {
  await page.goto('/app/witaj')
  await page.getByRole('button', { name: 'Pomiń' }).click()
  await page.goto('/app/profil')
  await page.getByRole('radio', { name: '20', exact: true }).click()
  await page.getByLabel('Godzina przypomnienia').fill('07:30')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Pobierz wydarzenie (.ics)' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('leapy-przypomnienie.ics')
  await page.reload()
  await expect(page.getByRole('radio', { name: '20', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(page.getByLabel('Godzina przypomnienia')).toHaveValue('07:30')
})
