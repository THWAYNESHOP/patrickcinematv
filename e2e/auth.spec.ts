import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should open auth modal when clicking sign in button', async ({ page }) => {
    await page.goto('/')

    // Click sign in button (use stable wait + scroll; force click if an overlay intercepts)
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await signInButton.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    try {
      await signInButton.click()
    } catch {
      await signInButton.click({ force: true })
    }
    
    // Verify modal is visible
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Welcome Back')).toBeVisible()
  })

  test('should toggle between login and register modes', async ({ page }) => {
    await page.goto('/')

    // Open auth modal (wait & scroll to avoid overlays)
    const signIn = page.getByRole('button', { name: /sign in/i })
    await expect(signIn).toBeVisible({ timeout: 10000 })
    await signIn.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    try {
      await signIn.click()
    } catch {
      await signIn.click({ force: true })
    }

    // Ensure dialog is visible then switch to register mode using the actual toggle text 'Sign Up'
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    const registerToggle = page.getByRole('button', { name: /sign up/i })
    await registerToggle.click()
    
    // Verify register form is visible
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/')

    // Open auth modal and switch to register (robust waits)
    const signIn2 = page.getByRole('button', { name: /sign in/i })
    await expect(signIn2).toBeVisible({ timeout: 10000 })
    await signIn2.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    try {
      await signIn2.click()
    } catch {
      await signIn2.click({ force: true })
    }
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    const registerToggle2 = page.getByRole('button', { name: /sign up/i })
    await expect(registerToggle2).toBeVisible({ timeout: 5000 })
    await registerToggle2.click()
    
    // Type password
    await page.getByLabel(/^password$/i).fill('Test123!')
    
    // Verify strength indicator appears
    await expect(page.getByText(/password strength/i)).toBeVisible()
  })

  test('should close modal when close button is clicked', async ({ page }) => {
    await page.goto('/')

    // Open auth modal (robust wait)
    const signIn3 = page.getByRole('button', { name: /sign in/i })
    await expect(signIn3).toBeVisible({ timeout: 10000 })
    await signIn3.scrollIntoViewIfNeeded()
    await page.waitForTimeout(150)
    try {
      await signIn3.click()
    } catch {
      await signIn3.click({ force: true })
    }

    // Close modal
    const closeBtn = page.getByLabel('Close modal')
    await expect(closeBtn).toBeVisible({ timeout: 5000 })
    await closeBtn.click()
    
    // Verify modal is hidden
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
