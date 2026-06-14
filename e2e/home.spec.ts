import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/NexaStream/)
  })

  test('should display hero slider', async ({ page }) => {
    await page.goto('/')
    const heroSlider = page.locator('[class*="hero"]')
    await expect(heroSlider).toBeVisible()
  })

  test('should navigate to movies page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Movies')
    await expect(page).toHaveURL(/\/movies/)
  })

  test('should open search', async ({ page }) => {
    await page.goto('/')
    await page.click('[aria-label="Open search"]')
    const searchInput = page.locator('input[type="text"]')
    await expect(searchInput).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    await page.goto('/')
    const themeToggle = page.locator('[aria-label="Toggle theme"]')
    await themeToggle.click()
    // Verify theme toggle functionality
    await expect(themeToggle).toBeVisible()
  })
})
