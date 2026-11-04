import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const errs = []
for (const [n, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  p.on('pageerror', (e) => errs.push(n + ': ' + e.message))
  await p.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000)
  const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }); await p.waitForTimeout(6000) }
  const end = await p.evaluate(() => document.getElementById('hero').offsetHeight - innerHeight)
  for (let y = 0; y <= end * 0.4; y += 120) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(40) }
  await p.waitForTimeout(1500); await p.screenshot({ path: `../shots/pick-${n}-tram.png` })
  for (let y = end * 0.4; y <= end * 0.95; y += 120) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(40) }
  await p.waitForTimeout(2500); await p.screenshot({ path: `../shots/pick-${n}-1.png` })
  await p.getByRole('radio', { name: /^Το μαγαζί/ }).click({ force: true }); await p.waitForTimeout(1600); await p.screenshot({ path: `../shots/pick-${n}-2.png` })
  await p.getByRole('radio', { name: /^Παράγγειλε τώρα/ }).click({ force: true }); await p.waitForTimeout(1600)
  await p.getByRole('radio', { name: /^Παράγγειλε τώρα/ }).click({ force: true }); await p.waitForTimeout(1500)
  console.log(n, 'after second tap:', p.url())
}
console.log(errs.join('\n') || 'no errors'); await b.close()
