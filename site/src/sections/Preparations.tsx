/**
 * Ported from 21st.dev "Hover Image List" by educalvolpz
 * https://21st.dev/@educalvolpz/components/hover-image-list
 * Kept: hairline rows, preview image that follows the cursor with spring + velocity skew,
 * fixed preview under reduced motion / touch / keyboard focus.
 * Changed: rows are the shop's own preparations, preview is square-cornered, tap on phones
 * opens the row's photo inline instead of a floating preview.
 */
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type PointerEvent } from 'react'
import { ArrowUpRight } from '@phosphor-icons/react'
import { PREPARATIONS } from '@/lib/data'
import { cn } from '@/lib/cn'

const SIZE = 300
const SPRING = { damping: 26, stiffness: 260 }
const SKEW_SPRING = { damping: 18, stiffness: 220 }
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)

export default function Preparations() {
  const reduced = useReducedMotion()
  const [hoverDevice, setHoverDevice] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [source, setSource] = useState<'focus' | 'pointer' | null>(null)
  const [openRow, setOpenRow] = useState<number | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const lastPtr = useRef<{ t: number; x: number; y: number } | null>(null)
  const pending = useRef<{ x: number; y: number } | null>(null)
  const raf = useRef<number | null>(null)
  const x = useMotionValue(0), y = useMotionValue(0), skew = useMotionValue(0)
  const sx = useSpring(x, SPRING), sy = useSpring(y, SPRING), sk = useSpring(skew, SKEW_SPRING)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setHoverDevice(mq.matches)
    const h = (e: MediaQueryListEvent) => setHoverDevice(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  useEffect(() => () => { if (raf.current !== null) cancelAnimationFrame(raf.current) }, [])

  const fixed = reduced || !hoverDevice || source === 'focus'

  const onMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (fixed) return
    pending.current = { x: e.clientX, y: e.clientY }
    if (raf.current !== null) return
    raf.current = requestAnimationFrame((now) => {
      raf.current = null
      const p = pending.current, c = container.current
      if (!p || !c) return
      const r = c.getBoundingClientRect()
      const lx = p.x - r.left, ly = p.y - r.top
      let vx = 0
      if (lastPtr.current) { const dt = Math.min(now - lastPtr.current.t, 50); if (dt > 0) vx = (lx - lastPtr.current.x) / dt }
      lastPtr.current = { t: now, x: lx, y: ly }
      skew.set(clamp(vx * 0.12, -8, 8))
      x.set(lx - SIZE / 2); y.set(ly - SIZE / 2)
    })
  }, [fixed, skew, x, y])

  const onBlur = (e: FocusEvent<HTMLDivElement>) => { if (source === 'focus' && !e.currentTarget.contains(e.relatedTarget)) { setActive(null); setSource(null) } }
  const item = active === null ? null : PREPARATIONS[active]

  return (
    <section id="paraskeves" className="bg-tile-2 text-ink">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-24 md:grid-cols-[1fr_1.4fr] md:gap-20 md:px-8 md:py-32">
        <div>
          <h2 className="font-display text-[clamp(2rem,4.2vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight">Φτιάχνονται εδώ, στο εργαστήριο.</h2>
          <p className="mt-4 max-w-[40ch] text-lg text-ink-2">Οι συνταγές του μαγαζιού από το 1980. Παραγγελίες για γιορτές και τραπέζια με ένα τηλέφωνο.</p>
          <img src="/media/still-sausages-hanging.webp" alt="Χειροποίητα λουκάνικα κρεμασμένα στο εργαστήριο" className="mt-10 hidden aspect-[4/5] w-full max-w-sm object-cover md:block" loading="lazy" />
        </div>

        <div ref={container} className="relative" onBlur={onBlur} onPointerMove={onMove} onPointerLeave={() => { setActive(null); setSource(null); lastPtr.current = null }}>
          <ul className="flex flex-col border-t border-ink/15">
            {PREPARATIONS.map((p, i) => (
              <li key={p.id} className="border-b border-ink/15">
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4 py-5 text-left md:py-6"
                  onFocus={() => { setActive(i); setSource('focus') }}
                  onMouseEnter={() => { if (hoverDevice) { setActive(i); setSource('pointer') } }}
                  onClick={() => { if (!hoverDevice) setOpenRow((o) => (o === i ? null : i)) }}
                  aria-expanded={!hoverDevice ? openRow === i : undefined}
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-2xl font-bold leading-tight transition-colors duration-200 group-hover:text-red md:text-3xl">{p.title}</span>
                    <span className="text-sm text-ink-2">{p.meta}</span>
                  </span>
                  <ArrowUpRight size={22} weight="bold" className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />
                </button>
                {!hoverDevice && (
                  <div className={cn('grid transition-[grid-template-rows] duration-500 ease-[var(--ease-expo)]', openRow === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden"><img src={p.image} alt={p.title} className="mb-5 aspect-[4/3] w-full object-cover" loading="lazy" /></div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {hoverDevice && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
              <motion.div
                animate={reduced ? { opacity: item ? 1 : 0 } : { opacity: item ? 1 : 0, scale: item ? 1 : 0.94 }}
                className={cn('absolute overflow-hidden shadow-[0_30px_60px_-20px_rgba(27,20,22,.45)]', fixed && 'right-6 top-1/2 -translate-y-1/2')}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
                style={fixed ? { width: SIZE, height: SIZE } : { width: SIZE, height: SIZE, left: 0, top: 0, x: sx, y: sy, skewX: reduced ? 0 : sk }}
                transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0.1, duration: 0.25 }}
              >
                <AnimatePresence initial={false}>
                  {item && (
                    <motion.img key={item.id} src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: 'spring', bounce: 0.1, duration: 0.25 }} />
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
