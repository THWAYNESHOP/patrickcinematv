import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should open auth modal when clicking sign in button', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click sign in button (adjust selector based on your actual implementation)
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await signInButton.click()
    
    // Verify modal is visible
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Welcome Back')).toBeVisible()
  })

  test('should toggle between login and register modes', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Open auth modal
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Switch to register mode
    await page.getByText(/register/i).click()
    
    // Verify register form is visible
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Open auth modal and switch to register
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.getByText(/register/i).click()
    
    // Type password
    await page.getByLabel(/^password$/i).fill('Test123!')
    
    // Verify strength indicator appears
    await expect(page.getByText(/password strength/i)).toBeVisible()
  })

  test('should close modal when close button is clicked', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Open auth modal
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Close modal
    await page.getByLabel('Close modal').click()
    
    // Verify modal is hidden
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
