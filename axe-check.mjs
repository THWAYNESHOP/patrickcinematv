/* eslint-disable no-undef */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://[::1]:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 });

const perf = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const paints = performance.getEntriesByType('paint').map(e => ({name: e.name, startTime: e.startTime}));
  const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0];
  return {
    domContentLoaded: nav.domContentLoadedEventEnd || null,
    load: nav.loadEventEnd || null,
    paints,
    lcpTime: lcpEntry ? (lcpEntry.renderTime || lcpEntry.startTime) : null,
  };
});

await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js' });
const axe = await page.evaluate(async () => {
  const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  return {
    summary: {
      violations: res.violations.length,
      passes: res.passes.length,
      incomplete: res.incomplete.length,
      inapplicable: res.inapplicable.length,
    },
    violations: res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length }))
  };
});

console.log(JSON.stringify({ perf, axe }, null, 2));
await browser.close();
