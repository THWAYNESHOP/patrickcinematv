/* eslint-env node */
import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const page = await browser.newPage()
const response = await page.goto('http://localhost:5173/', { waitUntil: 'load', timeout: 30000 })
console.log('STATUS', response.status())
const button = page.locator('button[aria-label="Open search"]')
console.log('count', await button.count())
for (let i = 0; i < await button.count(); i++) {
  const item = button.nth(i)
  console.log('index', i, 'visible', await item.isVisible(), 'enabled', await item.isEnabled(), 'box', await item.boundingBox(), 'class', await item.getAttribute('class'))
}
const overlay = page.locator('[role="dialog"], [aria-modal="true"], .fixed, .absolute').first()
console.log('overlay count', await overlay.count())
await browser.close()
