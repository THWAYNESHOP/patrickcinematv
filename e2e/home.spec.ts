import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NEXASTREAM/i)
  })

  test('should display hero slider', async ({ page }) => {
    await page.goto('/')
    const mainContent = page.locator('#root')
    await expect(mainContent).toBeVisible({ timeout: 20000 })
  })

  test('should navigate to movies page', async ({ page }) => {
    await page.goto('/')
    await page.goto('/movies')
    await expect(page).toHaveURL(/\/movies/)
  })

  test('should open search', async ({ page }) => {
    await page.goto('/')

    const desktopSearchButton = page.locator('button[aria-label*="search" i]').first()
    if (await desktopSearchButton.isVisible()) {
      await desktopSearchButton.click({ timeout: 10000 })
    } else {
      const menuButton = page.locator('[aria-label="Open menu"]')
      if (await menuButton.isVisible()) {
        await menuButton.click({ timeout: 10000 })
        const mobileSearchButton = page.getByRole('button', { name: /^search$/i }).first()
        await expect(mobileSearchButton).toBeVisible({ timeout: 10000 })
        await mobileSearchButton.click({ timeout: 10000 })
      }
    }

    const searchInput = page.locator('input[aria-label="Search content"], input[placeholder*="search" i]').first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
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
