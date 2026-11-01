import { chromium } from 'playwright'
const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2800)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(h * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(100) }
  const top = await page.evaluate(() => document.getElementById('ippokratis').getBoundingClientRect().top + window.scrollY)
  for (const [k, off] of [['a', 0], ['b', h * 0.9], ['c', h * 1.6]]) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + off)); await page.waitForTimeout(1800); await page.screenshot({ path: `../shots/butcher-${name}-${k}.png` }) }
}
await browser.close()
