import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=no-user-gesture-required'] })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  const errs = []; page.on('pageerror', e => errs.push(String(e)))
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(3200)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }) }
  await page.waitForTimeout(2500); await page.screenshot({ path: `../shots/hero-play-${name}.png` })
  await page.evaluate(() => { const v = document.querySelector('#hero video'); if (v) { v.currentTime = v.duration - 0.05 } })
  await page.waitForTimeout(1300); await page.screenshot({ path: `../shots/hero-cut1-${name}.png` })
  await page.waitForTimeout(1200); await page.screenshot({ path: `../shots/hero-cut2-${name}.png` })
  await page.waitForTimeout(2500); await page.screenshot({ path: `../shots/hero-after-${name}.png` })
  console.log(name, errs)
}
await b.close()
