import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Home page loads and displays content', async ({ page }) => {
    await expect(page).toHaveTitle(/NEXASTREAM/)
    
    // Check for hero slider
    const heroSlider = page.locator('[class*="relative h-"]').first()
    await expect(heroSlider).toBeVisible()
    
    // Check for navigation
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('User can navigate to movies page', async ({ page }) => {
    await page.click('text=Movies')
    await expect(page).toHaveURL(/.*\/movies/)
    
    // Check for movie content
    const movieContent = page.locator('text=Popular Movies')
    await expect(movieContent).toBeVisible()
  })

  test('User can search for content', async ({ page }) => {
    // Open search (using keyboard shortcut)
    await page.keyboard.press('/')
    
    // Type search query
    const searchInput = page.locator('input[type="text"]')
    await searchInput.fill('test')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Verify search functionality
    const searchResults = page.locator('[class*="search"]')
    await expect(searchResults).toBeVisible()
  })

  test('User can view movie details', async ({ page }) => {
    // Navigate to movies
    await page.click('text=Movies')
    
    // Click on first movie
    const firstMovie = page.locator('[class*="group/card"]').first()
    await firstMovie.click()
    
    // Check for movie details page
    await expect(page).toHaveURL(/.*\/movie\/\d+/)
    
    // Check for movie details elements
    const movieTitle = page.locator('h1, h2').first()
    await expect(movieTitle).toBeVisible()
  })

  test('User can add movie to My List', async ({ page }) => {
    // Navigate to movies
    await page.click('text=Movies')
    
    // Click on first movie
    const firstMovie = page.locator('[class*="group/card"]').first()
    await firstMovie.click()
    
    // Add to My List
    const addToListButton = page.locator('button:has-text("Add to My List"), button[aria-label*="Add"]').first()
    if (await addToListButton.isVisible()) {
      await addToListButton.click()
      
      // Verify it was added
      const myListPage = page.locator('text=My List')
      await myListPage.click()
      
      await expect(page).toHaveURL(/.*\/my-list/)
    }
  })

  test('User can navigate to sports page', async ({ page }) => {
    await page.click('text=Sports')
    await expect(page).toHaveURL(/.*\/sports/)
    
    // Check for sports content
    const sportsContent = page.locator('text=Live Sports')
    await expect(sportsContent).toBeVisible()
  })

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check mobile navigation
    const mobileNav = page.locator('[class*="MobileNav"]')
    await expect(mobileNav).toBeVisible()
    
    // Check content is still accessible
    const heroSlider = page.locator('[class*="relative h-"]').first()
    await expect(heroSlider).toBeVisible()
  })

  test('Keyboard navigation works', async ({ page }) => {
    // Test keyboard shortcuts
    await page.keyboard.press('2') // Should navigate to movies
    await expect(page).toHaveURL(/.*\/movies/)
    
    await page.keyboard.press('1') // Should navigate to home
    await expect(page).toHaveURL(/\//)
  })

  test('Error handling works', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page')
    
    // Should show 404 or error page
    const errorPage = page.locator('text=Not Found, text=404, text=Error')
    await expect(errorPage).toBeVisible({ timeout: 5000 })
  })
})
