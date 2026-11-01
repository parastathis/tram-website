import { chromium } from 'playwright'
import { readFileSync } from 'fs'
const svg = readFileSync('public/favicon.svg', 'utf8')
const b = await chromium.launch({ channel: 'msedge' })
for (const [name, s] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const p = await (await b.newContext({ viewport: { width: s, height: s }, deviceScaleFactor: 1 })).newPage()
  await p.setContent(`<body style="margin:0;background:#0E0C0D">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</body>`)
  await p.screenshot({ path: `public/${name}`, omitBackground: false })
}
await b.close()
