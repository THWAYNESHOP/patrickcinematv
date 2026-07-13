/* eslint-disable no-undef */
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://[::1]:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.0/axe.min.js' });

const result = await page.evaluate(async () => {
  const res = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
  return res.violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    description: v.description,
    nodes: v.nodes.map(n => ({
      html: n.html,
      target: n.target,
      failureSummary: n.failureSummary,
      snippet: n.html,
      all: n.all,
      any: n.any,
      none: n.none,
    })),
  }));
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
