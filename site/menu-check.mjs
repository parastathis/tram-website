import { chromium } from 'playwright'
const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => m.type() === 'error' && errs.push(m.text()))
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(3200)
  await page.screenshot({ path: `../shots/load-${name}.png` })
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
  await page.getByRole('button', { name: 'Μενού' }).click(); await page.waitForTimeout(1800)
  await page.screenshot({ path: `../shots/menu-${name}.png` })
  console.log(name, errs)
}
await browser.close()
