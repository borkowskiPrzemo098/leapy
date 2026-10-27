import type { Page } from '@playwright/test'

/**
 * Answers whatever task is on screen. With `check: false` (mock exams) it only fills the
 * answer; in practice it also presses "Sprawdź" where the type needs it.
 */
export async function answerCurrent(page: Page, { check: submit = true } = {}) {
  const check = page.getByRole('button', { name: 'Sprawdź' })
  const input = page.getByLabel('Twoja odpowiedź')
  if (await input.isVisible().catch(() => false)) {
    await input.fill('1')
    if (submit) await check.click()
    return
  }
  const order = page.getByRole('list', { name: 'Do ułożenia' })
  if (await order.isVisible().catch(() => false)) {
    while ((await order.getByRole('button').count()) > 0)
      await order.getByRole('button').first().click()
    if (submit) await check.click()
    return
  }
  const values = page.getByRole('list', { name: 'Wartości do wyboru' })
  if (await values.isVisible().catch(() => false)) {
    const n = await page
      .getByRole('list', { name: 'Elementy do dopasowania' })
      .getByRole('button')
      .count()
    for (let i = 0; i < n; i++) await values.getByRole('button').nth(i).click()
    if (submit) await check.click()
    return
  }
  const radios = page.getByRole('radio', { name: 'Prawda' })
  if ((await radios.count()) > 0) {
    for (const r of await radios.all()) await r.click()
    if (submit) await check.click()
    return
  }
  // single (answers on tap) or multi (toggle, then check)
  await page
    .locator('main button[aria-pressed]')
    .filter({ hasNotText: /Wrócę tu|Oznaczone/ })
    .first()
    .click()
  if (submit && (await check.isVisible().catch(() => false))) await check.click()
}
