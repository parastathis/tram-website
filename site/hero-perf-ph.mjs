import { chromium } from 'playwright'
const b = await chromium.launch({ channel: 'msedge', args: ['--autoplay-policy=no-user-gesture-required'] })
const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage()
await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(3000)
const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) await enter.first().click({ force: true })
await page.waitForTimeout(4000)
const res = await page.evaluate(() => new Promise((ok) => {
  const deltas = []; let t0 = performance.now(); let n = 0
  const tick = (t) => { deltas.push(t - t0); t0 = t; if (++n < 240) requestAnimationFrame(tick); else ok({ max: Math.max(...deltas.slice(5)), avg: deltas.reduce((a, b) => a + b, 0) / deltas.length, long: deltas.filter(d => d > 40).length }) }
  requestAnimationFrame(tick)
  let y = 0; const iv = setInterval(() => { y += 60; window.scrollTo(0, y); if (y > 2300) clearInterval(iv) }, 16)
}))
console.log('frames', JSON.stringify(res))
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500)
const total = await page.evaluate(() => document.getElementById('hero').offsetHeight - window.innerHeight)
for (const p of [0.3, 0.58]) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * p)); await page.waitForTimeout(1200); await page.screenshot({ path: `../shots/perf-ph-${p}.png` }) }
await b.close()
