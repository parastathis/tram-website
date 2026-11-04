import { chromium } from 'playwright'
import { execSync } from 'node:child_process'
const url = process.argv[2]
const tag = 'pwmem' + Date.now()
const b = await chromium.launch({ channel: 'msedge', args: ['--' + tag] })
const tree = () => { const out = execSync('powershell -NoProfile -ExecutionPolicy Bypass -File "C:/Users/paras/AppData/Local/Temp/claude/ff3b03de682e8f16/508cbad5-9237-4b9a-83f3-b494bbbe1c78/scratchpad/procs.ps1"', { maxBuffer: 1 << 26 }).toString(); const ps = JSON.parse(out); const roots = ps.filter((p) => (p.CommandLine || '').includes(tag)).map((p) => p.ProcessId); const kids = new Set(roots); let grew = true; while (grew) { grew = false; for (const p of ps) if (kids.has(p.ParentProcessId) && !kids.has(p.ProcessId)) { kids.add(p.ProcessId); grew = true } } return Math.round(ps.filter((p) => kids.has(p.ProcessId)).reduce((a, p) => a + p.WorkingSetSize, 0) / 1e6) }
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
await p.goto(url, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000)
const e = p.getByRole('button', { name: /Μπες/ }); if (await e.count()) { await e.first().click({ force: true }) }
await p.waitForTimeout(12000)
const before = tree()
const H = await p.evaluate(() => document.getElementById('hero').offsetHeight)
await p.mouse.move(700, 450)
for (let y = 0; y < H; y += 60) { await p.mouse.wheel(0, 60); await p.waitForTimeout(16) }
await p.waitForTimeout(1500)
for (let y = H; y > 0; y -= 60) { await p.mouse.wheel(0, -60); await p.waitForTimeout(16) }
await p.waitForTimeout(1500)
console.log(url, 'MB before scroll', before, 'after hero there and back', tree())
await b.close()
