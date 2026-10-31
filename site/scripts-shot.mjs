import { chromium } from 'playwright'
const url = process.argv[2] || 'http://localhost:5190/'
const out = process.argv[3] || '../shots'
import fs from 'node:fs'
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${out}/${name}-fold.png` })
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  // scroll through in steps so scroll-triggered work runs
  for (let y = 0; y < total; y += Math.round(h * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120) }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  const steps = []
  for (const f of [0.08, 0.14, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * f)); await page.waitForTimeout(500)
    await page.screenshot({ path: `${out}/${name}-${Math.round(f * 100)}.png` }); steps.push(f)
  }
  console.log(name, { total, overflow, errors })
  await ctx.close()
}
await browser.close()
