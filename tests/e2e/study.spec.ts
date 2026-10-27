import { expect, test, type Page } from '@playwright/test'
import { answerCurrent } from './helpers'

// E3 study modes end to end: mock exam (navigation, flags, resume, submit, time-out),
// mistakes, spaced-repetition reviews with a fake clock, flashcards and the statistics screen.

const START = new Date('2026-10-27T10:00:00')
const DAY = 24 * 60 * 60 * 1000

/** Plays a 10-task topic session and returns how many answers were fully correct. */
async function playTopic(page: Page, topic = 'procenty') {
  await page.goto(`/app/sesja/temat/matura/matematyka-p/${topic}`)
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`${i + 1} / 10`)).toBeVisible()
    await answerCurrent(page)
    await page.getByRole('button', { name: /Dalej|Zobacz wynik/ }).click()
  }
  const heading = page.getByRole('heading', { level: 1, name: /z 10$/ })
  await expect(heading).toBeVisible()
  return Number(((await heading.textContent()) ?? '').split(' ')[0])
}

test('mock exam: move, flag, resume after reload, submit and see points', async ({ page }) => {
  await page.goto('/app/egzamin-probny')
  await expect(page.getByText('To nie jest oficjalny arkusz CKE.', { exact: false })).toBeVisible()
  await page
    .getByRole('link', { name: 'Zacznij egzamin próbny: Matematyka · poziom podstawowy' })
    .click()

  await expect(page.getByText(/^Zadanie 1 z 15/)).toBeVisible()
  await expect(page.getByText('Pozostały czas:', { exact: false })).toBeVisible()
  await answerCurrent(page, { check: false })
  // No feedback during the exam
  await expect(page.getByRole('button', { name: /Dalej$/ })).toBeVisible()
  await expect(page.getByText('Jest! Dobrze.')).toHaveCount(0)

  await page.getByRole('button', { name: /Dalej$/ }).click()
  await expect(page.getByText(/^Zadanie 2 z 15/)).toBeVisible()
  await page.getByRole('button', { name: 'Wrócę tu' }).click()
  await expect(page.getByRole('button', { name: 'Oznaczone' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  // The sheet survives a reload (the clock keeps running)
  await page.reload()
  await expect(page.getByText(/^Zadanie 2 z 15/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Oznaczone' })).toBeVisible()

  // Leaving keeps it resumable
  await page.getByRole('button', { name: 'Wyjdź z arkusza (czas biegnie dalej)' }).click()
  await expect(page.getByText('Rozpoczęty arkusz', { exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Wróć do arkusza' }).click()

  await page.getByRole('button', { name: 'Arkusz', exact: true }).click()
  const sheet = page.getByRole('dialog', { name: 'Arkusz' })
  await expect(sheet.getByRole('button', { name: 'Zadanie 1: z odpowiedzią' })).toBeVisible()
  await expect(
    sheet.getByRole('button', { name: 'Zadanie 2: bez odpowiedzi, oznaczone' }),
  ).toBeVisible()
  await sheet.getByRole('button', { name: 'Oddaj arkusz' }).click()
  const confirm = page.getByRole('dialog', { name: 'Oddać arkusz?' })
  await expect(confirm).toContainText('Bez odpowiedzi: 14 zadań')
  await confirm.getByRole('button', { name: 'Oddaj i sprawdź' }).click()

  await expect(page.getByRole('heading', { level: 1, name: /^[01] z 15 pkt$/ })).toBeVisible()
  await expect(page).toHaveURL(/\?wynik=/)
  await page.getByRole('heading', { name: 'Zadania i wyjaśnienia' }).scrollIntoViewIfNeeded()
  await page.locator('details summary').first().click()
  await expect(page.getByRole('heading', { name: 'Wyjaśnienie' }).first()).toBeVisible()

  // The result stays readable after a reload and shows up in statistics and on the setup screen
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: /z 15 pkt$/ })).toBeVisible()
  await page.goto('/app/postepy')
  await expect(page.getByRole('heading', { name: 'Egzaminy próbne' })).toBeVisible()
  await page.goto('/app/egzamin-probny')
  await expect(page.getByText(/Ostatnio: [01] z 15 pkt/)).toBeVisible()
})

test('mock exam hands itself in when time is up', async ({ page }) => {
  await page.clock.install({ time: START })
  await page.goto('/app/sesja/probny/matura/matematyka-p')
  await expect(page.getByText(/^Zadanie 1 z 15/)).toBeVisible()
  await page.clock.fastForward('40:05')
  await expect(page.getByRole('heading', { level: 1, name: '0 z 15 pkt' })).toBeVisible()
  await expect(page.getByText('40 z 40 min', { exact: false })).toBeVisible()
})

test('mistakes return in "Moje błędy" and reviews come back on the next day', async ({ page }) => {
  await page.clock.install({ time: START })
  const correct = await playTopic(page)
  const wrong = 10 - correct

  await page.goto('/app/cwicz')
  await expect(page.getByRole('link', { name: /Powtórki\s*Na dziś nic/ })).toBeVisible()
  if (wrong > 0) {
    await expect(
      page.getByRole('link', { name: new RegExp(`Moje błędy\\s*${wrong} do poprawy`) }),
    ).toBeVisible()
    await page.getByRole('link', { name: /Moje błędy/ }).click()
    await expect(page.getByText(`1 / ${wrong}`)).toBeVisible()
  }

  // Same day: nothing is due yet
  await page.goto('/app/sesja/powtorki')
  await expect(page.getByRole('heading', { name: 'Na dziś wszystko powtórzone' })).toBeVisible()

  // Two days later every task from that session is due (first interval: 1 day)
  await page.clock.setSystemTime(new Date(START.getTime() + 2 * DAY))
  await page.goto('/app/cwicz')
  await expect(page.getByRole('link', { name: /Powtórki\s*10 na dziś/ })).toBeVisible()
  await page.goto('/app/sesja/powtorki')
  await expect(page.getByText('1 / 10')).toBeVisible()
  await answerCurrent(page)
  await page.getByRole('button', { name: 'Dalej' }).click()
  await page.goto('/app/cwicz')
  await expect(page.getByRole('link', { name: /Powtórki\s*9 na dziś/ })).toBeVisible()
})

test('flashcards: flip, rate, forgotten cards come back in the same sitting', async ({ page }) => {
  await page.goto('/app/egzaminy/matura/matematyka-p/logarytmy')
  await page.getByRole('link', { name: 'Ucz się na fiszkach' }).click()
  await expect(page.getByText('1 / 6')).toBeVisible()

  await page.getByRole('button', { name: 'Pokaż odpowiedź' }).click()
  await page.getByRole('button', { name: 'Nie pamiętam' }).click()
  await expect(page.getByText('2 / 7')).toBeVisible()

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Space')
    await page.keyboard.press('3')
  }
  await expect(page.getByRole('heading', { level: 1, name: '5 z 6' })).toBeVisible()

  // Known cards are not due again today; the forgotten one is due tomorrow
  await page.goto('/app/sesja/fiszki/matura/matematyka-p/logarytmy')
  await expect(page.getByRole('heading', { name: 'Na dziś fiszki powtórzone' })).toBeVisible()
})

test('statistics show streak, calendar and topic mastery after a session', async ({ page }) => {
  await page.clock.install({ time: START })
  await playTopic(page, 'logarytmy')
  await page.goto('/app/postepy')
  await expect(page.getByText('Seria', { exact: true })).toBeVisible()
  await expect(page.getByText('1 dzień').first()).toBeVisible()
  await expect(page.getByRole('img', { name: /Kalendarz nauki.*aktywne dni 1\./ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Ostatnie 14 dni' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Logarytmy.*z 10 opanowanych/ })).toBeVisible()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBe(0)

  // Table view: every value is reachable without hovering
  await page.getByText('Pokaż jako tabelę').click()
  await expect(page.getByRole('cell', { name: '10' }).first()).toBeVisible()
})
