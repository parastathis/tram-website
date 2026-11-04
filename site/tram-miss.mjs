import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge', headless: false })
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await p.goto('http://localhost:5190/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000)
const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }) }
await p.waitForTimeout(9000)
await p.mouse.move(700, 450)
const H = await p.evaluate(() => document.getElementById('hero').offsetHeight)
for (let y = 0; y < H * 0.7; y += 100) { await p.mouse.wheel(0, 100); await p.waitForTimeout(16) }
await p.waitForTimeout(1200)
for (let y = H * 0.7; y > 0; y -= 100) { await p.mouse.wheel(0, -100); await p.waitForTimeout(16) }
await p.waitForTimeout(1200)
console.log(await p.evaluate(() => window.__tram))
await b.close()
