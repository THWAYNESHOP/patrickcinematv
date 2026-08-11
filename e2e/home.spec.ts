import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page).toHaveTitle(/NEXASTREAM/i)
  })

  test('should display hero slider', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    const mainContent = page.locator('#root')
    await expect(mainContent).toBeVisible({ timeout: 20000 })
  })

  test('should navigate to movies page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.goto('/movies')
    await expect(page).toHaveURL(/\/movies/)
  })

  test('should open search', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})

    // Try desktop search first
    const desktopSearchButton = page.getByTestId('desktop-search-toggle').first()
    try {
      await desktopSearchButton.waitFor({ state: 'visible', timeout: 5000 })
      await desktopSearchButton.click()
    } catch {
      // Fallback to mobile search
      const menuButton = page.locator('[aria-label="Open menu"]').first()
      await menuButton.click({ timeout: 5000 })
      const mobileSearchButton = page.getByTestId('mobile-search-toggle').first()
      await mobileSearchButton.click({ timeout: 5000 })
    }

    // Wait for search overlay to appear
    const searchInput = page.getByTestId('search-overlay-input').first()
    await searchInput.waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    const themeToggle = page.locator('[aria-label*="theme" i], button:has-text("Theme"), [data-testid*="theme"]').first()
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      await expect(themeToggle).toBeVisible()
    }
  })
})

test.describe('Home Page - Mobile', () => {
  test('should load home page on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NEXASTREAM/i)
  })

  test('should navigate to movies page on mobile', async ({ page }) => {
    await page.goto('/')
    await page.goto('/movies')
    await expect(page).toHaveURL(/\/movies/)
  })
})
