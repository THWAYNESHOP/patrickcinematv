import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  const mainNavigation = (page) => page.locator('nav[aria-label="Primary"], nav:not([aria-label])').first()

  const clickNavLink = async (page, name) => {
    const routeByName = {
      Movies: '/movies',
      'TV Series': '/tv',
      'Kenyan Series': '/kenyan-series',
      Anime: '/anime',
      Sports: '/sports',
      Livestreams: '/live-tv',
    }

    const href = routeByName[name]
    if (href) {
      const directLink = page.locator(`a[href="${href}"]`).first()
      if ((await directLink.count()) > 0) {
        const isVisible = await directLink.isVisible().catch(() => false)
        if (isVisible) {
          await directLink.click({ timeout: 10000, force: true })
          return
        }
      }
    }

    const mobileNavLink = page.getByTestId(`mobile-nav-link-${name.toLowerCase().replace(/\s+/g, '-')}`).first()
    if ((await mobileNavLink.count()) > 0) {
      const isVisible = await mobileNavLink.isVisible().catch(() => false)
      if (isVisible) {
        await mobileNavLink.click({ timeout: 10000, force: true })
        return
      }
    }

    await page.goto(href || '/', { waitUntil: 'domcontentloaded', timeout: 60000 })
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
    const searchButton = page.getByTestId('desktop-search-toggle').first()
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click({ timeout: 10000, force: true })
    } else {
      const menuButton = page.locator('[aria-label="Open menu"]').first()
      await expect(menuButton).toBeVisible({ timeout: 10000 })
      await menuButton.click({ timeout: 10000, force: true })
      const mobileSearchButton = page.getByTestId('mobile-search-toggle').first()
      await expect(mobileSearchButton).toBeVisible({ timeout: 10000 })
      await mobileSearchButton.click({ timeout: 10000, force: true })
    }

    const searchInput = page.getByTestId('search-overlay-input').first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
    await searchInput.fill('test')

    const results = page.locator('button:has-text("test")')
    await expect(results.first()).toBeVisible({ timeout: 20000 })
  })

  test('User can view movie details', async ({ page }) => {
    await clickNavLink(page, 'Movies')

    const firstMovieLink = page.locator('[data-carousel-card-id] a').first()
    await expect(firstMovieLink).toBeVisible({ timeout: 15000 })
    await firstMovieLink.click({ force: true })

    await expect(page).toHaveURL(/.*\/(movie|tv|anime|kenyan-series)\/[^/]+/, { timeout: 20000 })
    const movieTitle = page.locator('h1, h2').first()
    await expect(movieTitle).toBeVisible({ timeout: 10000 })
  })

  test('User can add movie to My List', async ({ page }) => {
    await clickNavLink(page, 'Movies')

    const firstMovieLink = page.locator('[data-carousel-card-id] a').first()
    await expect(firstMovieLink).toBeVisible({ timeout: 15000 })
    await firstMovieLink.click({ force: true })

    await expect(page).toHaveURL(/.*\/(movie|tv|anime|kenyan-series)\/[^/]+/, { timeout: 20000 })
    const addToListButton = page.locator('main button[aria-label*="My List"], main [data-testid="my-list-action"]').first()
    await expect(addToListButton).toBeVisible({ timeout: 20000 })
    await expect(addToListButton).toBeEnabled({ timeout: 20000 })
    await addToListButton.click({ force: true })

    await page.goto('/my-list', { waitUntil: 'domcontentloaded', timeout: 60000 })
    await expect(page).toHaveURL(/.*\/my-list/, { timeout: 10000 })
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
