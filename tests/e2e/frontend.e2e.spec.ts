import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('homepage má klubový titulek, navigaci a patičku', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/HC Čestice/)
    await expect(page.locator('nav').first()).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('podstránka /zapasy se načte s vlastním titulkem', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/zapasy')
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/HC Čestice/)
  })

  test('neexistující stránka vrátí 404', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/tato-stranka-neexistuje')
    expect(response?.status()).toBe(404)
  })
})
