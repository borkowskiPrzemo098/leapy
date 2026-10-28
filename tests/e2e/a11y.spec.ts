import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { answerCurrent } from './helpers'

// WCAG 2.2 AA with axe on every kind of screen, in the light and the dark theme.
// Contrast is checked per theme because the tokens differ.

const pages = [
  '/',
  '/egzaminy/matura',
  '/egzaminy/matura/matematyka-p',
  '/egzaminy/matura/matematyka-p/logarytmy',
  '/blog',
  '/blog/powtorki-rozlozone-w-czasie',
  '/faq',
  '/cennik',
  '/prywatnosc',
  '/nie-ma-takiej-strony',
  '/app',
  '/app/egzaminy',
  '/app/egzaminy/matura/matematyka-p',
  '/app/egzaminy/matura/matematyka-p/logarytmy',
  '/app/cwicz',
  '/app/egzamin-probny',
  '/app/postepy',
  '/app/profil',
  '/app/sesja/fiszki',
]

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze()
  return violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.nodes.map((n) => `${n.target.join(' ')} ${n.any[0]?.message ?? ''}`).join(' | ')}`,
  )
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe, ${scheme}`, () => {
    test.use({ colorScheme: scheme })
    for (const path of pages) {
      test(path, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('h1').first()).toBeVisible()
        await page.waitForLoadState('networkidle')
        expect(await audit(page)).toEqual([])
      })
    }

    test('practice session with feedback', async ({ page }) => {
      await page.goto('/app/egzaminy/matura/matematyka-p/logarytmy')
      await page.getByRole('link', { name: /Ćwicz temat/ }).click()
      await expect(page.getByText('1 / 10')).toBeVisible()
      await answerCurrent(page)
      await expect(page.getByRole('button', { name: /Dalej|Zobacz wynik/ })).toBeVisible()
      expect(await audit(page)).toEqual([])
    })
  })
}
