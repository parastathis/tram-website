import { chromium } from 'playwright'
const URL0 = process.argv[2] || 'https://tram-butcher.vercel.app'
const b = await chromium.launch({ channel: 'msedge', headless: false, args: ['--enable-gpu-rasterization'] })
for (const [n, w, h, cpu] of [['desk', 1440, 900, 1], ['phone', 390, 844, 4]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 })
  const p = await ctx.newPage()
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu })
  await p.addInitScript(() => {
    window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(e.duration))).observe({ type: 'longtask', buffered: true })
    window.__fr = []; let last = 0; const loop = (t) => { if (last) window.__fr.push(t - last); last = t; requestAnimationFrame(loop) }; requestAnimationFrame(loop)
  })
  const measure = async (label, fn) => {
    await p.evaluate(() => { window.__lt = []; window.__fr = [] })
    await fn()
    const r = await p.evaluate(() => { const f = window.__fr; const s = [...f].sort((a, b) => a - b); return { frames: f.length, avg: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), jank: f.filter((x) => x > 50).length, long: window.__lt.length, longMs: Math.round(window.__lt.reduce((a, b) => a + b, 0)) } })
    console.log(n, label, JSON.stringify(r))
  }
  await p.goto(URL0 + '/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000)
  const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }); await p.waitForTimeout(2000) }
  await measure('idle-top', () => p.waitForTimeout(3000))
  const H = await p.evaluate(() => document.getElementById('hero').offsetHeight)
  const total = await p.evaluate(() => document.documentElement.scrollHeight)
  await p.mouse.move(w / 2, h / 2)
  await measure('scroll-hero', async () => { for (let y = 0; y < H; y += 60) { await p.mouse.wheel(0, 60); await p.waitForTimeout(16) } await p.waitForTimeout(800) })
  await measure('scroll-rest', async () => { for (let y = H; y < total; y += 80) { await p.mouse.wheel(0, 80); await p.waitForTimeout(16) } await p.waitForTimeout(800) })
  await p.goto(URL0 + '/paraggelia', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(4000)
  await p.mouse.move(w / 2, h / 2)
  await measure('order-scroll', async () => { for (let i = 0; i < 80; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(16) } await p.waitForTimeout(800) })
  await measure('order-add', async () => { await p.getByRole('button', { name: /^Βάλε .* στο καλάθι$/ }).nth(5).click(); await p.waitForTimeout(1500) })
  await ctx.close()
}
await b.close()
