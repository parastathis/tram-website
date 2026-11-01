import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2800)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(h * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80) }
  const top = await page.evaluate(() => document.getElementById('magazi').getBoundingClientRect().top + window.scrollY)
  for (const [k, off] of [['a', 0], ['b', h * 1.0], ['c', h * 2.0], ['d', h * 3.0]]) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + off)); await page.waitForTimeout(1600); await page.screenshot({ path: `../shots/shop-${name}-${k}.png` }) }
}
await b.close()
