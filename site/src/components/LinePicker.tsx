/**
 * Two prints on a string: pick where you go. Ported from 21st.dev "Hanging Polaroid Image
 * Carousel" by kedhareswer (https://21st.dev/@kedhareswer/components/polaroid-line-carousel).
 * Kept: the sagging string drawn as a quadratic curve, prints pegged to it that slide along with a
 * critically damped spring, swing on their pegs with the line's speed and settle with a little
 * overshoot, a light breeze at rest, drag with rubber-banding at the ends, arrow keys, the print in
 * the middle is the selected one, the caption that rises for it, the simulation written straight to
 * the DOM and paused off screen, reduced motion holds them still.
 * Changed: two prints only (Παράγγειλε τώρα, Το μαγαζί), both always in view; a tap on a print
 * selects it and slides it to the middle, a tap on the selected print (or the button) takes you
 * there; Greek captions in the site's faces, wooden pegs on a tram-red string, no autoplay.
 */
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

export type Print = { image: string; note: string; title: string; caption: string; cta: string; go: () => void; alt: string }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const stringY = (x: number, w: number, y0: number, sag: number) => { const t = clamp(x / w, 0, 1); return y0 + 4 * sag * t * (1 - t) }
const springStep = (x: number, v: number, target: number, dt: number, k = 70): [number, number] => { const c = 2 * Math.sqrt(k); const nv = v + (k * (target - x) - c * v) * dt; return [x + nv * dt, nv] }
const swingStep = (a: number, w: number, lineVel: number, dt: number, gain: number): [number, number] => { const nw = w + (-38 * a - 4.2 * w + lineVel * 0.0034 * gain) * dt; return [clamp(a + nw * dt, -0.6, 0.6), nw] }

export default function LinePicker({ prints, running, initial = 0 }: { prints: Print[]; running: boolean; initial?: number }) {
  const n = prints.length
  const [active, setActive] = useState(initial)
  const [size, setSize] = useState({ w: 1200, h: 700, cw: 300 })
  const root = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const sim = useRef({ off: 0, vel: 0, target: 0, a: [0, 0], w: [0, 0], kick: 0 })
  const drag = useRef<null | { x: number; off: number; lx: number; lt: number; v: number; moved: boolean }>(null)
  const activeRef = useRef(initial)
  const spacing = size.cw * (size.w < 640 ? 1.02 : 1.25)
  const select = (i: number) => { sim.current.target = clamp(i, 0, n - 1) * spacing; sim.current.kick = (i - activeRef.current) * 2.2 }

  useEffect(() => {
    const el = root.current; if (!el) return
    const ro = new ResizeObserver(() => { const r = el.getBoundingClientRect(); setSize({ w: r.width, h: r.height, cw: Math.round(Math.max(140, Math.min(320, r.width * (r.width < 640 ? 0.44 : 0.4), r.height * 0.46))) }) })
    ro.observe(el); return () => ro.disconnect()
  }, [])
  useEffect(() => { sim.current.target = activeRef.current * spacing; sim.current.off = activeRef.current * spacing }, [spacing])

  useEffect(() => {
    const el = root.current; if (!el || !running) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0, prev = performance.now(), visible = true
    const S = sim.current
    const frame = (now: number) => {
      raf = 0; if (!visible) return
      const dt = Math.min(0.033, (now - prev) / 1000); prev = now
      const { w, h, cw } = size
      const y0 = Math.max(70, h * 0.16), sag = Math.min(60, h * 0.07)
      // the line's centre follows the selected print, so both prints stay on screen
      const centre = w / 2 - ((n - 1) * spacing) / 2
      const d = drag.current
      let lineVel: number
      if (d && d.moved) lineVel = d.v * 1000
      else { const before = S.off; [S.off, S.vel] = springStep(S.off, S.vel, S.target, dt); lineVel = -(S.off - before) / Math.max(dt, 1e-3) }
      const g = reduce ? 0 : 1
      if (S.kick) { lineVel += S.kick * -600; S.kick *= 0.82; if (Math.abs(S.kick) < 0.01) S.kick = 0 }
      const shift = (S.off - ((n - 1) * spacing) / 2) * (w < 640 ? 0.2 : 0.35)
      const near = clamp(Math.round(S.off / spacing), 0, n - 1)
      for (let i = 0; i < n; i++) {
        const c = cards.current[i]; if (!c) continue
        const x = centre + i * spacing - shift
        let a = S.a[i] || 0, av = S.w[i] || 0
        ;[a, av] = swingStep(a, av, lineVel, dt, g)
        if (g) a += Math.sin(now / 1300 + i * 1.7) * 0.0009
        S.a[i] = a; S.w[i] = av
        const y = stringY(x, w, y0, sag) - 6
        c.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${a.toFixed(4)}rad)`
        c.style.zIndex = String(i === near ? n + 1 : 1)
      }
      path.current?.setAttribute('d', `M0 ${y0} Q${w / 2} ${y0 + 2 * sag} ${w} ${y0}`)
      if (near !== activeRef.current) { activeRef.current = near; setActive(near) }
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { prev = performance.now(); raf = requestAnimationFrame(frame) } })
    io.observe(el); raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [size, spacing, n, running])

  const onDown = (e: React.PointerEvent) => { if ((e.target as HTMLElement).closest('[data-bar]')) return; drag.current = { x: e.clientX, off: sim.current.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false } }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) > 6) { d.moved = true; root.current?.setPointerCapture(e.pointerId) }
    if (!d.moved) return
    const dt = Math.max(1, e.timeStamp - d.lt); d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v; d.lx = e.clientX; d.lt = e.timeStamp
    const max = (n - 1) * spacing; let off = d.off - dx * 1.4
    if (off < 0) off *= 0.35; if (off > max) off = max + (off - max) * 0.35
    sim.current.off = off
  }
  const onUp = () => {
    const d = drag.current; drag.current = null; if (!d || !d.moved) return
    sim.current.vel = -d.v * 1000
    select(clamp(Math.round((sim.current.off - d.v * 180) / spacing), 0, n - 1))
  }
  const tap = (i: number) => { if (drag.current?.moved) return; if (i === activeRef.current) prints[i].go(); else select(i) }
  const p = prints[active]

  return (
    <div ref={root} className="relative h-full w-full touch-pan-y select-none overflow-hidden outline-none" tabIndex={0} role="radiogroup" aria-label="Πού πας"
      onKeyDown={(e) => { if (e.key === 'ArrowRight') select(activeRef.current + 1); else if (e.key === 'ArrowLeft') select(activeRef.current - 1); else if (e.key === 'Enter') prints[activeRef.current].go(); else return; e.preventDefault() }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden><path ref={path} fill="none" stroke="#C8262D" strokeWidth="1.6" strokeLinecap="round" /></svg>
      {prints.map((pr, i) => (
        <button key={pr.title} ref={(el) => { cards.current[i] = el }} type="button" role="radio" aria-checked={i === active} aria-label={`${pr.title}. ${pr.caption}`} onClick={() => tap(i)}
          className="absolute left-0 top-0 origin-top text-left will-change-transform focus-visible:outline-none" style={{ width: size.cw }}>
          <div className={cn('mt-[10px] bg-[#FBF8F2] p-[10px] pb-0 shadow-[0_1px_2px_rgba(14,12,13,.25),0_22px_40px_-18px_rgba(0,0,0,.7)] transition-[transform,filter] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]', i === active ? 'scale-100' : 'scale-[.88] brightness-[.8] saturate-[.75]')}>
            <div className="relative aspect-square overflow-hidden bg-[#2A2326]"><img src={pr.image} alt={pr.alt} draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover" /></div>
            <p className="flex h-12 items-center justify-center font-body text-[17px] italic text-ink/80 md:h-14 md:text-[19px]">{pr.note}</p>
          </div>
          <span aria-hidden className="absolute left-1/2 top-0 h-[26px] w-[10px] -translate-x-1/2 bg-[linear-gradient(90deg,#B98E5C,#E0C49A_45%,#A7804F)] shadow-[0_2px_3px_rgba(0,0,0,.35)]" />
        </button>
      ))}
      <div data-bar className="absolute inset-x-5 bottom-6 flex flex-wrap items-end justify-between gap-4 md:inset-x-8 md:bottom-10">
        <div key={active} className="min-w-0 animate-[plIn_.55s_cubic-bezier(.2,.8,.2,1)_both]">
          <p className="font-display text-[clamp(2.2rem,5vw,4.4rem)] uppercase leading-[.9] text-ivory">{p.title}</p>
          <p className="mt-1 max-w-[42ch] font-mono text-[12px] text-ivory/70 md:text-[13px]">{p.caption}</p>
        </div>
        <button type="button" onClick={p.go} className="group inline-flex items-center gap-3 bg-red px-5 py-3.5 font-display text-[1.35rem] uppercase leading-none tracking-wide text-ivory transition-colors hover:bg-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory">
          {p.cta}<ArrowRight size={20} weight="bold" className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{p.title}</p>
    </div>
  )
}
