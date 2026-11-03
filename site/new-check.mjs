import { chromium } from 'playwright'
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['kreata', 'pagkos', 'magazi', 'nea', 'paraggelia']
const browser = await chromium.launch({ channel: 'msedge' })
const errs = []
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })).newPage()
  page.on('console', (m) => { if (m.type() === 'error') errs.push(`${name}: ${m.text()}`) })
  page.on('pageerror', (e) => errs.push(`${name}: ${e.message}`))
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2800)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.round(h * 0.8)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(80) }
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (ov > 0) errs.push(`${name}: horizontal overflow ${ov}px`)
  for (const id of ids) {
    const top = await page.evaluate((id) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + window.scrollY : -1 }, id)
    if (top < 0) { errs.push(`missing #${id}`); continue }
    for (const [k, off] of [['a', 0], ['b', h * 0.85]]) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + off)); await page.waitForTimeout(1600); await page.screenshot({ path: `../shots/new-${id}-${name}-${k}.png` }) }
  }
}
console.log(errs.join('\n') || 'no errors')
await browser.close()
