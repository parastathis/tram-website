import { chromium } from 'playwright'
const browser = await chromium.launch({ channel: 'msedge' })
const errs = []
for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errs.push(`${name}: ${m.text()}`) })
  page.on('pageerror', (e) => errs.push(`${name}: ${e.message}`))
  await page.addInitScript(() => { window.open = () => null })
  const s = (k) => page.screenshot({ path: `../shots/lines-${name}-${k}.png` })
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2800)
  const enter = page.getByRole('button', { name: /Μπες/ }); if (await enter.count()) { await enter.first().click({ force: true }); await page.waitForTimeout(1500) }
  const H = await page.evaluate(() => document.getElementById('hero').offsetHeight)
  for (let y = 0; y <= H * 0.8; y += 200) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(40) }
  await page.waitForTimeout(2500); await s('1-board')
  for (const id of ['pagkos', 'ippokratis']) { await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id); await page.waitForTimeout(1800); await s(`2-${id}`) }
  await page.evaluate(() => { const r = document.querySelector('#ippokratis ol'); window.scrollTo(0, r.getBoundingClientRect().top + scrollY - 200) }); await page.waitForTimeout(1800); await s('3-stops')
  await page.evaluate(() => { const r = document.querySelector('#ippokratis ol'); window.scrollTo(0, r.getBoundingClientRect().top + scrollY + r.offsetHeight - 500) }); await page.waitForTimeout(1800); await s('4-stops-end')
  // to the order line from the board
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500)
  await page.goto('http://localhost:5190/paraggelia', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500); await s('5-order')
  await page.getByRole('button', { name: /^Βάλε .* στο καλάθι$/ }).first().click(); await page.waitForTimeout(1300)
  await page.getByRole('button', { name: /^Βάλε .* στο καλάθι$/ }).nth(3).click(); await page.waitForTimeout(1300); await s('6-order-added')
  await page.getByRole('radio', { name: /Αρνί/ }).click(); await page.waitForTimeout(1500); await s('7-rail-jump')
  if (w > 1000) await page.getByRole('button', { name: 'Ολοκλήρωση παραγγελίας' }).click()
  else { await page.getByRole('button', { name: /Δες το καλάθι/ }).click(); await page.waitForTimeout(700); await s('8a-cart'); await page.getByRole('button', { name: 'Συνέχεια' }).click() }
  await page.waitForTimeout(900); await s('8-checkout')
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov > 0) errs.push(`${name}: overflow ${ov}`)
  await page.goto('http://localhost:5190/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200)
  const ov2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (ov2 > 0) errs.push(`${name}: home overflow ${ov2}`)
}
console.log(errs.join('\n') || 'no errors')
await browser.close()
