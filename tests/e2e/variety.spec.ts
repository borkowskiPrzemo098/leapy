import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { answerCurrent } from './helpers'

// Zadanie dnia, Błyskawica and the colour themes unlocked by level.

async function chooseMathP(page: Page) {
  await page.goto('/app/egzaminy')
  await page.getByRole('button', { name: /^Matura/ }).click()
  await page
    .getByRole('button', { name: /Dodaj do moich przedmiotów: Matematyka, poziom podstawowy/ })
    .click()
}

test('daily task: one task, then the Start card says it is done', async ({ page }) => {
  await chooseMathP(page)
  await page.goto('/app')
  const card = page.getByRole('region', { name: 'Zadanie dnia' })
  await expect(card).toContainText('Każdego dnia inne')
  await card.getByRole('link', { name: 'Rozwiąż' }).click()
  await expect(page.getByText('1 / 1')).toBeVisible()
  await answerCurrent(page)
  await page.getByRole('button', { name: 'Zobacz wynik' }).click()
  await expect(page.getByText('Pierwsze zadanie dnia za tobą')).toBeVisible()
  await page.goto('/app')
  await expect(page.getByRole('region', { name: 'Zadanie dnia' })).toContainText('Zrobione na dziś')
})

test('Błyskawica: answers move on by themselves and the clock ends the run', async ({ page }) => {
  await page.clock.install()
  await chooseMathP(page)
  await page.goto('/app/cwicz')
  await page.getByRole('link', { name: /Błyskawica/ }).click()
  await expect(page.getByText('60 s')).toBeVisible()
  await answerCurrent(page)
  await page.clock.runFor(1000)
  await answerCurrent(page)
  await page.clock.runFor(61_000)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/poprawn/)
  await expect(page.getByText(/Odpowiedzi: 2/)).toBeVisible()
  await expect(page.getByText(/rekord/i)).toBeVisible()
})

test('colour themes: locked until their level, stored colour applies before paint', async ({
  page,
}) => {
  await page.goto('/app/profil')
  const group = page.getByRole('radiogroup', { name: 'Kolor aplikacji' })
  await expect(group.getByRole('radio', { name: /Fioletowy/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  const teal = group.getByRole('radio', { name: /Morski/ })
  await expect(teal).toHaveAttribute('aria-disabled', 'true')
  await expect(teal).toContainText('od stopnia 3')
  await teal.click({ force: true })
  await expect(page.locator('html')).not.toHaveAttribute('data-accent', /./)

  await page.addInitScript(() => localStorage.setItem('leapy:accent', 'morski'))
  await page.goto('/app')
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'morski')
})

test('install guide: Profil lists the steps, Start shows the card on a phone', async ({
  page,
  isMobile,
}) => {
  await page.goto('/app/profil')
  const guide = page.locator('section', {
    has: page.getByRole('heading', { name: 'Ikonka na telefonie' }),
  })
  await expect(guide.getByRole('heading', { name: 'iPhone i iPad (Safari)' })).toBeVisible()
  await expect(guide.getByText('Do ekranu początkowego')).toBeVisible()
  await page.goto('/app')
  const card = page.getByRole('region', { name: 'Dodaj Leapy do ekranu telefonu' })
  if (!isMobile) return
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Nie teraz' }).click()
  await page.reload()
  await expect(card).toHaveCount(0)
})
