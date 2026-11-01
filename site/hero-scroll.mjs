import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=no-user-gesture-required'] })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e)))
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(3200)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }) }
  await page.waitForTimeout(2500)
  const total = await page.evaluate(() => document.getElementById('hero').offsetHeight - window.innerHeight)
  for (const p of [0, 0.15, 0.3, 0.45, 0.58, 0.63, 0.72, 0.95]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * p)); await page.waitForTimeout(900)
    await page.screenshot({ path: `../shots/hs-${name}-${String(Math.round(p * 100)).padStart(3, '0')}.png` })
  }
  console.log(name, errs)
}
await b.close()
