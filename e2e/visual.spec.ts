import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to consistent size for visual tests
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('Home page visual snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Wait for hero slider to load
    await page.waitForSelector('[class*="relative h-"]', { timeout: 15000 })
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('home-page-full.png', {
      fullPage: true,
      maxDiffPixels: 100, // Allow for minor differences
      animations: 'disabled',
    })
  })

  test('Home page hero section snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Wait for hero slider
    const hero = page.locator('[class*="relative h-"]').first()
    await expect(hero).toBeVisible({ timeout: 15000 })
    
    // Take screenshot of hero section only
    await expect(hero).toHaveScreenshot('home-hero.png', {
      maxDiffPixels: 50,
      animations: 'disabled',
    })
  })

  test('Movies page visual snapshot', async ({ page }) => {
    await page.goto('/movies', { waitUntil: 'networkidle' })
    
    // Wait for content to load
    await page.waitForSelector('[data-carousel-card-id]', { timeout: 15000 })
    
    await expect(page).toHaveScreenshot('movies-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled',
    })
  })

  test('TV Series page visual snapshot', async ({ page }) => {
    await page.goto('/tv', { waitUntil: 'networkidle' })
    
    // Wait for content to load
    await page.waitForSelector('[data-carousel-card-id]', { timeout: 15000 })
    
    await expect(page).toHaveScreenshot('tv-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled',
    })
  })

  test('Sports page visual snapshot', async ({ page }) => {
    await page.goto('/sports', { waitUntil: 'networkidle' })
    
    // Wait for content to load or fallback to page title
    try {
      await page.waitForSelector('[data-carousel-card-id]', { timeout: 15000 })
    } catch {
      // Fallback - sports page might not have carousel cards
      await page.waitForSelector('h1, h2', { timeout: 10000 })
    }
    
    await expect(page).toHaveScreenshot('sports-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled',
    })
  })

  test('Anime page visual snapshot', async ({ page }) => {
    await page.goto('/anime', { waitUntil: 'networkidle' })
    
    // Wait for content to load
    await page.waitForSelector('[data-carousel-card-id]', { timeout: 15000 })
    
    await expect(page).toHaveScreenshot('anime-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled',
    })
  })

  test('Settings page visual snapshot', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })
    
    // Wait for settings to load
    await page.waitForSelector('button[type="button"]', { timeout: 15000 })
    
    await expect(page).toHaveScreenshot('settings-page.png', {
      fullPage: true,
      maxDiffPixels: 50,
      animations: 'disabled',
    })
  })

  test('Navigation bar visual snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const navbar = page.locator('nav').first()
    await expect(navbar).toBeVisible({ timeout: 15000 })
    
    await expect(navbar).toHaveScreenshot('navbar.png', {
      maxDiffPixels: 30,
      animations: 'disabled',
    })
  })

  test('Search overlay visual snapshot', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Open search
    const searchButton = page.getByTestId('desktop-search-toggle').first()
    await searchButton.click({ timeout: 5000 })
    
    // Wait for search overlay
    const searchInput = page.getByTestId('search-overlay-input').first()
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    
    // Take screenshot of search overlay
    const searchOverlay = page.locator('.fixed.inset-0.z-50').first()
    await expect(searchOverlay).toHaveScreenshot('search-overlay.png', {
      maxDiffPixels: 50,
      animations: 'disabled',
    })
  })

  test('Mobile home page visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Wait for hero slider
    await page.waitForSelector('[class*="relative h-"]', { timeout: 15000 })
    
    await expect(page).toHaveScreenshot('home-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100,
      animations: 'disabled',
    })
  })

  test('Content carousel card visual snapshot', async ({ page }) => {
    await page.goto('/movies', { waitUntil: 'networkidle' })
    
    // Wait for carousel to load
    await page.waitForSelector('[data-carousel-card-id]', { timeout: 15000 })
    
    const card = page.locator('[data-carousel-card-id]').first()
    await expect(card).toBeVisible()
    
    await expect(card).toHaveScreenshot('carousel-card.png', {
      maxDiffPixels: 30,
      animations: 'disabled',
    })
  })

  test('Error page visual snapshot', async ({ page }) => {
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' })
    
    // Wait for error page
    await page.waitForSelector('h1, h2', { timeout: 5000 })
    
    await expect(page).toHaveScreenshot('error-page.png', {
      fullPage: true,
      maxDiffPixels: 50,
      animations: 'disabled',
    })
  })
})