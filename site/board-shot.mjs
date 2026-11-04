import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
for (const [n, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  await p.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await p.waitForTimeout(2500)
  const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }); await p.waitForTimeout(1500) }
  const end = await p.evaluate(() => document.getElementById('hero').offsetHeight - innerHeight)
  for (let y = 0; y <= end * 0.9; y += 150) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(40) }
  await p.waitForTimeout(2600); await p.screenshot({ path: `../shots/board-${n}.png` })
  await p.goto('http://localhost:5190/paraggelia', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(800); await p.screenshot({ path: `../shots/order-scrolled-${n}.png` })
}
await b.close()
