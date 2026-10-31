import { chromium } from 'playwright'
import fs from 'node:fs'
const sites = {
  santioni: 'https://santionispirits.com/', agrumea: 'https://agrumea.com/', ironhill: 'https://ironhill.in/',
  tender: 'https://www.tendergourmetbutchery.com.au/', dishoom: 'https://www.dishoom.com/', promeat: 'https://promeat.chipsa.design/',
  qissa: 'https://qissa.in/', hozon: 'https://hozon.jp/',
}
fs.mkdirSync('../ref/sites', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, url] of Object.entries(sites)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })
  const page = await ctx.newPage()
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(7000)
    const total = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, 6000))
    const n = 8
    for (let i = 0; i < n; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((total - 900) * i / (n - 1)))
      await page.waitForTimeout(900)
      await page.screenshot({ path: `../ref/sites/${name}-${i}.png` })
    }
    const fonts = await page.evaluate(() => [...new Set([...document.querySelectorAll('h1,h2,h3,a,button,p')].map(e => getComputedStyle(e).fontFamily.split(',')[0]))].slice(0, 8))
    console.log(name, 'ok', total, JSON.stringify(fonts))
  } catch (e) { console.log(name, 'ERR', String(e).slice(0, 120)) }
  await ctx.close()
}
await browser.close()
