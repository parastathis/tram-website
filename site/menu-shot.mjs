import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
for (const [n, w, h] of [['phone', 390, 844], ['desk', 1440, 900]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  await p.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000)
  const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }); await p.waitForTimeout(2500) }
  await p.getByRole('button', { name: 'Μενού' }).click(); await p.waitForTimeout(2300); await p.screenshot({ path: `../shots/menu2-${n}.png` })
  await p.keyboard.press('Escape'); await p.waitForTimeout(1800)
  await p.evaluate(() => { const f = [...document.querySelectorAll('figcaption')].find((x) => x.textContent.includes('ρολόι')); f.closest('figure').scrollIntoView({ block: 'center' }) }); await p.waitForTimeout(1800); await p.screenshot({ path: `../shots/clock-${n}.png` })
}
await b.close()
