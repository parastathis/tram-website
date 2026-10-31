import { chromium } from 'playwright'
const browser = await chromium.launch({ channel: 'msedge' })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2800)
const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
for (const p of [0.2, 0.45, 0.6, 0.7, 0.85, 1.0]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(1800 * p)); await page.waitForTimeout(700)
  await page.screenshot({ path: `../shots/hero-${Math.round(p * 100)}.png` })
}
await browser.close()
