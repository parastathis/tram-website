import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge' })
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })).newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000)
const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }); await p.waitForTimeout(2500) }
await p.screenshot({ path: '../shots/ph-00.png' })
await p.touchscreen.tap(195, 300); await p.evaluate(() => window.scrollBy(0, 60)); await p.waitForTimeout(1800)
console.log('after first scroll, y =', await p.evaluate(() => Math.round(scrollY)), 'hero h', await p.evaluate(() => innerHeight))
await p.screenshot({ path: '../shots/ph-01.png' })
const total = await p.evaluate(() => document.documentElement.scrollHeight)
let k = 2
await p.screenshot({ path: '../shots/ph-01b.png' })
for (let y = 844 * 2; y < total; y += 760) { await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y); await p.waitForTimeout(900); await p.screenshot({ path: `../shots/ph-${String(k++).padStart(2, '0')}.png` }) }
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500)
await p.getByRole('button', { name: 'Μενού' }).click(); await p.waitForTimeout(2200); await p.screenshot({ path: '../shots/ph-menu.png' })
console.log(k, errs.join('\n') || 'no errors'); await b.close()
