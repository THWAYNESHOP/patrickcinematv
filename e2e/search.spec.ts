import { test, expect } from '@playwright/test'

test.describe('Search overlay', () => {
  const openSearch = async (page) => {
    const openSearchButton = page.locator('button[aria-label="Open search"]').first()
    if (await openSearchButton.isVisible()) {
      await openSearchButton.scrollIntoViewIfNeeded()
      await openSearchButton.click({ timeout: 10000 })
      return
    }

    const menuButton = page.locator('[aria-label="Open menu"], [aria-label="Close menu"]').first()
    if (await menuButton.isVisible()) {
      await menuButton.click({ timeout: 10000 })
      const mobileSearchButton = page.getByRole('button', { name: /^search$/i }).first()
      await expect(mobileSearchButton).toBeVisible({ timeout: 10000 })
      await mobileSearchButton.click({ timeout: 10000 })
      return
    }

    throw new Error('Unable to open search: control not found')
  }

  test('should open search, show results, and close with Escape', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' })

    await openSearch(page)

    const searchInput = page.getByRole('textbox', { name: /search content/i })
    await expect(searchInput).toBeVisible({ timeout: 20000 })
    await expect(searchInput).toBeEditable({ timeout: 20000 })
    await searchInput.click({ timeout: 10000 })
    await searchInput.fill('Dune', { timeout: 10000 })

    const duneResult = page.getByRole('button', { name: /Dune: Part Two/i }).first()
    await expect(duneResult).toBeVisible({ timeout: 20000 })

    await page.keyboard.press('Escape')
    await expect(searchInput).toBeHidden({ timeout: 10000 })
  })
})
