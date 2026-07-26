import { test, expect } from '@playwright/test'

test.describe('Search overlay', () => {
  const openSearch = async (page) => {
    const openSearchButton = page.getByTestId('desktop-search-toggle').first()
    if (await openSearchButton.isVisible()) {
      await openSearchButton.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      try {
        await openSearchButton.click({ timeout: 10000 })
      } catch {
        await openSearchButton.evaluate((element) => {
          element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        })
      }
      return
    }

    const menuButton = page.locator('[aria-label="Open menu"], [aria-label="Close menu"]:visible').first()
    if (await menuButton.isVisible()) {
      await menuButton.click({ timeout: 10000 })
      const mobileSearchButton = page.getByTestId('mobile-search-toggle').first()
      await expect(mobileSearchButton).toBeVisible({ timeout: 10000 })
      await mobileSearchButton.scrollIntoViewIfNeeded()
      await page.waitForTimeout(150)
      try {
        await mobileSearchButton.click({ timeout: 10000 })
      } catch {
        await mobileSearchButton.evaluate((element) => {
          element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        })
      }
      return
    }

    throw new Error('Unable to open search: control not found')
  }

  test('should open search, show results, and close with Escape', async ({ page }) => {
    // Mock TMDB search API to avoid network flakiness and ensure deterministic results
    await page.route('**/search/multi**', async (route) => {
      const mock = {
        results: [
          {
            id: 693134,
            title: 'Dune: Part Two',
            media_type: 'movie',
            poster_path: '/test-poster.jpg',
            release_date: '2024-03-01',
            vote_average: 7.8,
          },
        ],
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mock),
      })
    })

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
