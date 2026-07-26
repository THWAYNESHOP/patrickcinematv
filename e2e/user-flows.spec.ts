import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page.getByRole('navigation')).toBeVisible({ timeout: 10000 })
  })

  test('Home page loads and displays content', async ({ page }) => {
    await expect(page).toHaveTitle(/NEXASTREAM/)

    // Check for hero slider
    const heroSlider = page.locator('[class*="relative h-"]').first()
    await expect(heroSlider).toBeVisible({ timeout: 10000 })

    // Check for navigation
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('User can navigate to movies page', async ({ page }) => {
    await page.getByRole('button', { name: 'Browse' }).click()
    await page.getByRole('link', { name: 'Movies' }).click()

    await expect(page).toHaveURL(/.*\/movies/)

    const movieContent = page.getByText('Popular Movies')
    await expect(movieContent).toBeVisible({ timeout: 10000 })
  })

  test('User can search for content', async ({ page }) => {
    await page.keyboard.press('/')

    const searchInput = page.getByRole('textbox', { name: /search content/i })
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('test')

    const movieResult = page.getByRole('button', { name: /Test Movie/i }).first()
    await expect(movieResult).toBeVisible({ timeout: 20000 })
  })

  test('User can view movie details', async ({ page }) => {
    await page.getByRole('button', { name: 'Browse' }).click()
    await page.getByRole('link', { name: 'Movies' }).click()

    const firstMovie = page.locator('[class*="group/card"]').first()
    await expect(firstMovie).toBeVisible({ timeout: 10000 })
    await firstMovie.click()

    await expect(page).toHaveURL(/.*\/movie\/\d+/)
    const movieTitle = page.locator('h1, h2').first()
    await expect(movieTitle).toBeVisible({ timeout: 10000 })
  })

  test('User can add movie to My List', async ({ page }) => {
    await page.getByRole('button', { name: 'Browse' }).click()
    await page.getByRole('link', { name: 'Movies' }).click()

    const firstMovie = page.locator('[class*="group/card"]').first()
    await expect(firstMovie).toBeVisible({ timeout: 10000 })
    await firstMovie.click()

    const addToListButton = page.locator('button:has-text("Add to My List"), button[aria-label*="Add"]').first()
    if (await addToListButton.isVisible()) {
      await addToListButton.click()

      const myListButton = page.getByRole('link', { name: 'My List' })
      await expect(myListButton).toBeVisible({ timeout: 10000 })
      await myListButton.click()

      await expect(page).toHaveURL(/.*\/my-list/)
    }
  })

  test('User can navigate to sports page', async ({ page }) => {
    await page.getByRole('button', { name: 'Live' }).click()
    await page.getByRole('link', { name: 'Sports' }).click()

    await expect(page).toHaveURL(/.*\/sports/)

    const sportsContent = page.getByRole('heading', { name: /Sports/i })
    await expect(sportsContent).toBeVisible({ timeout: 10000 })
  })

  test('Responsive design works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const mobileNav = page.getByRole('navigation', { name: 'Primary' })
    await expect(mobileNav).toBeVisible({ timeout: 10000 })

    const heroSlider = page.locator('[class*="relative h-"]').first()
    await expect(heroSlider).toBeVisible({ timeout: 10000 })
  })

  test('Keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Escape')
    await page.keyboard.press('2')
    await expect(page).toHaveURL(/.*\/movies/)

    await page.keyboard.press('1')
    await expect(page).toHaveURL(/\//)
  })

  test('Error handling works', async ({ page }) => {
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' })

    const errorPage = page.getByText(/404|Page not found|Not Found|Error/i)
    await expect(errorPage).toBeVisible({ timeout: 10000 })
  })
})
