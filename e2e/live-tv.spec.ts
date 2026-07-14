import { test, expect } from '@playwright/test'

test.describe('Live TV page', () => {
  test('should search for a channel and show results', async ({ page }) => {
    await page.goto('/live-tv', { waitUntil: 'domcontentloaded' })

    const searchInput = page.getByPlaceholder('Search channels, teams or tournaments...')
    await expect(searchInput).toBeVisible({ timeout: 20000 })
    await searchInput.click({ timeout: 10000 })
    await searchInput.fill('ESPN', { timeout: 10000 })

    const result = page.locator('text=ESPN').first()
    await expect(result).toBeVisible({ timeout: 20000 })
  })
})
