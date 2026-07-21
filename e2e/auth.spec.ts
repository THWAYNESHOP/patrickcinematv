import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  const safeClick = async (locator) => {
    await locator.scrollIntoViewIfNeeded()
    await locator.waitFor({ state: 'visible', timeout: 10000 })
    await locator.page().waitForTimeout(150)
    try {
      await locator.click({ timeout: 10000 })
    } catch {
      await locator.evaluate((element) => {
        if (element instanceof HTMLElement) {
          element.click()
        }
      })
    }
  }

  const openAuthModal = async (page) => {
    const signInButton = page.locator('button[aria-label="Sign in"]:visible, button:has-text("Sign In"):visible').first()
    if (!(await signInButton.isVisible())) {
      const menuButton = page.locator('[aria-label="Open menu"]:visible')
      if (await menuButton.isVisible()) {
        await menuButton.click({ timeout: 10000 })
      }
    }

    await expect(signInButton).toBeVisible({ timeout: 10000 })
    await safeClick(signInButton)
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
  }

  test('should open auth modal when clicking sign in button', async ({ page }) => {
    await page.goto('/')
    await openAuthModal(page)
    await expect(page.getByText('Welcome Back')).toBeVisible()
  })

  test('should toggle between login and register modes', async ({ page }) => {
    await page.goto('/')
    await openAuthModal(page)

    const registerToggle = page.getByRole('button', { name: /sign up/i }).first()
    await safeClick(registerToggle)

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/')
    await openAuthModal(page)

    const registerToggle2 = page.getByRole('button', { name: /sign up/i }).first()
    await safeClick(registerToggle2)

    await page.getByLabel(/^password$/i).fill('Test123!')
    await expect(page.getByText(/password strength/i)).toBeVisible()
  })

  test('should close modal when close button is clicked', async ({ page }) => {
    await page.goto('/')
    await openAuthModal(page)

    const closeBtn = page.getByLabel('Close modal').first()
    await safeClick(closeBtn)

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should toggle forgot password mode and back to sign in', async ({ page }) => {
    await page.goto('/')
    await openAuthModal(page)

    const forgotLink = page.getByRole('button', { name: /forgot password\?/i }).first()
    await safeClick(forgotLink)

    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible({ timeout: 5000 })
    const backToSignIn = page.getByRole('button', { name: /back to sign in/i }).first()
    await safeClick(backToSignIn)

    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 5000 })
  })
})
