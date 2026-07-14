import { test, expect } from '@playwright/test'

test.describe('Search overlay', () => {
  test('should open search, show results, and close with Escape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    const openSearchButton = page.locator('button[aria-label="Open search"]').first()
    await expect(openSearchButton).toBeVisible({ timeout: 20000 })
    await openSearchButton.click({ timeout: 10000 })

    const searchInput = page.getByRole('textbox', { name: /search content/i })
    await expect(searchInput).toBeVisible({ timeout: 20000 })
    await expect(searchInput).toBeEditable({ timeout: 20000 })
    await searchInput.click({ timeout: 10000 })
    await searchInput.fill('Dune', { timeout: 10000 })

    await expect(page.locator('text=Dune: Part Two')).toBeVisible({ timeout: 20000 })

    await page.keyboard.press('Escape')
    await expect(searchInput).toBeHidden({ timeout: 10000 })
  })
})
