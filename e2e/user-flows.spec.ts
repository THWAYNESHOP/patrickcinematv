import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  const mainNavigation = (page) => page.locator('nav[aria-label="Primary"], nav:not([aria-label])').first()

  const clickNavLink = async (page, name) => {
    const link = page.getByRole('link', { name })
    if (await link.isVisible()) {
      await link.click()
      return
    }

    const dropdownButtonNames = new Map([
      ['Movies', 'Browse'],
      ['TV Series', 'Browse'],
      ['Kenyan Series', 'Browse'],
      ['Anime', 'Browse'],
      ['Sports', 'Live'],
      ['Livestreams', 'Live'],
    ])
    const dropdownLabel = dropdownButtonNames.get(name)

    if (dropdownLabel) {
      const toggleButton = page.getByRole('button', { name: dropdownLabel })
      if ((await toggleButton.count()) > 0 && await toggleButton.isVisible()) {
        await toggleButton.click()
      }
    }

    await page.getByRole('link', { name }).click()
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(mainNavigation(page)).toBeVisible({ timeout: 10000 })
  })

  test('Home page loads and displays content', async ({ page }) => {
    await expect(page).toHaveTitle(/NEXASTREAM/)

    // Check for hero slider
    const heroSlider = page.locator('[class*="relative h-"]').first()
    await expect(heroSlider).toBeVisible({ timeout: 10000 })

    // Check for navigation
    await expect(mainNavigation(page)).toBeVisible()
  })

  test('User can navigate to movies page', async ({ page }) => {
    await clickNavLink(page, 'Movies')

    await expect(page).toHaveURL(/.*\/movies/)

    const movieContent = page.getByRole('heading', { name: 'Movies' })
    await expect(movieContent).toBeVisible({ timeout: 10000 })
  })

  test('User can search for content', async ({ page }) => {
    await page.keyboard.press('/')

    const searchInput = page.getByRole('textbox', { name: /search content/i })
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('test')

    const results = page.locator('button:has-text("test")')
    await expect(results.first()).toBeVisible({ timeout: 20000 })
  })

  test('User can view movie details', async ({ page }) => {
    await clickNavLink(page, 'Movies')

    const firstMovie = page.locator('[data-carousel-card-id]').first()
    await expect(firstMovie).toBeVisible({ timeout: 10000 })
    await firstMovie.click()

    await expect(page).toHaveURL(/.*\/(movie|tv|anime|kenyan-series)\/[^/]+/)
    const movieTitle = page.locator('h1, h2').first()
    await expect(movieTitle).toBeVisible({ timeout: 10000 })
  })

  test('User can add movie to My List', async ({ page }) => {
    await clickNavLink(page, 'Movies')

    const firstMovie = page.locator('[data-carousel-card-id]').first()
    await expect(firstMovie).toBeVisible({ timeout: 10000 })
    await firstMovie.click()

    const addToListButton = page.locator('main button[aria-label="My List"]').first()
    await expect(addToListButton).toBeVisible({ timeout: 10000 })
    await expect(addToListButton).toBeEnabled({ timeout: 10000 })
    await addToListButton.click()

    const myListButton = page.locator('a[href="/my-list"]').first()
    if ((await myListButton.count()) > 0 && await myListButton.isVisible()) {
      await myListButton.click()
    } else {
      await page.goto('/my-list')
    }

    await expect(page).toHaveURL(/.*\/my-list/)
  })

  test('User can navigate to sports page', async ({ page }) => {
    await clickNavLink(page, 'Sports')

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

    const errorHeading = page.getByRole('heading', { name: 'Page not found' })
    await expect(errorHeading).toBeVisible({ timeout: 10000 })

    const errorCode = page.getByText('404')
    await expect(errorCode).toBeVisible()
  })
})
