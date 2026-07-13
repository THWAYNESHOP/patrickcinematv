/* eslint-disable no-undef */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://[::1]:5173/?cachebust=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1000);
const badges = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('span')).filter(el => el.textContent?.trim() === 'New').map(el => ({
    outerHTML: el.outerHTML,
    className: el.className,
    color: window.getComputedStyle(el).color,
    backgroundColor: window.getComputedStyle(el).backgroundColor,
  }));
});
console.log(JSON.stringify({ url: page.url(), badges }, null, 2));
await browser.close();
