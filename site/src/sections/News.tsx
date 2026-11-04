/**
 * Νέα από το μαγαζί. What is new at the counter, and what the shop has posted.
 * Rows: ported from 21st.dev "Interactive List Preview" by hyperiux
 * (https://21st.dev/@hyperiux/components/interactive-list-preview).
 * Kept: a highlight bar that slides to the hovered row with GSAP (power3.out), the row text
 * re-coloured on the bar, the bar fading out when the pointer leaves the list, reduced motion.
 * Changed: no preview photos at all (he asked for them gone); the bar is a tram-red block that
 * wipes in from the left like a cut, rows are dated notices in the condensed face.
 * Cursor: ported from 21st.dev "Cursor" by unlumen (https://21st.dev/@unlumen/components/cursor).
 * Kept: a spring-followed pointer tilted by its own velocity, a label that follows with squash
 * and skew. Changed: the pointer is a butcher's cleaver that chops on click, the label is the
 * row's action. Fine pointers only; touch keeps the system behaviour.
 * Every item is real: the online shop and its products come from the shop's Orderoo menu, the
 * dated posts from the shop's Facebook page.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from 'motion/react'
import { ArrowUpRight, FacebookLogo } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { cn } from '@/lib/cn'
import { link } from '@/lib/route'

type N = { id: string; when: string; title: string; meta: string; href: string; ext?: boolean; act: string }
const ITEMS: N[] = [
  { id: 'online', when: 'Νέο', title: 'Παραγγέλνεις πια από εδώ', meta: 'Όλος ο πάγκος με τιμές, στο καλάθι σου. Μας λες πώς να το κόψουμε και πότε περνάς, ή σου το φέρνουμε.', href: '/paraggelia', act: 'Στο καλάθι' },
  { id: 'giortes', when: 'Χριστούγεννα', title: 'Το γιορτινό τραπέζι κλείνεται νωρίς', meta: 'Γαλοπούλα, γουρουνάκι γάλακτος, αρνί και κατσίκι γάλακτος ολόκληρα ή μισά, κοκορέτσι και γαρδούμπα παραγωγής μας.', href: '#paraggelia', act: 'Κλείσε το' },
  { id: 'spania', when: 'Στον πάγκο', title: 'Αγριογούρουνο, πετεινός Κρήτης, κουνέλι Ρεθύμνου', meta: 'Τα σπάνια του πάγκου, μαζί με γραβιέρα Κρήτης και φέτα Αμφιλοχίας.', href: '/paraggelia', act: 'Δες τα' },
  { id: 'ergastirio', when: 'Εργαστήριο', title: '18 παρασκευές, φτιαγμένες εδώ', meta: 'Λουκάνικο χωριάτικο, κοντοσούβλι, ρολά γεμιστά, σουβλάκια, μπιφτέκια, και το μοσχαρίσιο σουτζούκι πικάντικο.', href: '/paraggelia', act: 'Δες τα' },
  { id: 'pasxa', when: '8 Απρ 2025', title: 'Σας περιμένουμε να οργανώσουμε το πασχαλινό σας τραπέζι', meta: 'Από τη σελίδα μας στο Facebook.', href: SHOP.facebook, ext: true, act: 'Στο Facebook' },
  { id: 'kalokairi', when: 'Κάθε Αύγουστο', title: 'Κλειστά για λίγες μέρες καλοκαιρινών διακοπών', meta: 'Οι ημερομηνίες βγαίνουν πρώτα στο Facebook.', href: SHOP.facebook, ext: true, act: 'Στο Facebook' },
]

const SMOOTH = 0.35
const FOLLOW = { damping: 25, stiffness: 300 }

/** The cleaver: steel blade with its hole, a dark wooden handle. Hotspot = front of the edge. */
function Cleaver() {
  return (
    <svg viewBox="0 0 64 44" width="88" height="61" aria-hidden>
      <path d="M40 11.5h19.5a3.5 3.5 0 0 1 0 7H40z" fill="#9A6440" stroke="#0E0C0D" strokeWidth="1" />
      <path d="M44 13.2h14" stroke="#C08A5E" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="47" cy="15" r="1.1" fill="#C9C2B6" /><circle cx="54" cy="15" r="1.1" fill="#C9C2B6" />
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H40v28.5c0 1.4-1 2.5-2.4 2.6L3.8 36.8A2 2 0 0 1 1.6 34.8z" fill="#D9D5CE" stroke="#0E0C0D" strokeWidth="1" />
      <path d="M1.6 30.4 38.6 26.6 40 30.5c0 1.4-1 2.5-2.4 2.6L3.8 36.8A2 2 0 0 1 1.6 34.8z" fill="#F4F1EA" />
      <path d="M4 3.8h34" stroke="#A9A39A" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="33" cy="10" r="3.1" fill="#0E0C0D" />
    </svg>
  )
}

export default function News() {
  const reduced = useReducedMotion()
  const [fine, setFine] = useState(false)
  const [inside, setInside] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const chop = useAnimationControls()

  useEffect(() => { const mq = window.matchMedia('(hover: hover) and (pointer: fine)'); setFine(mq.matches); const f = (e: MediaQueryListEvent) => setFine(e.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  useEffect(() => { if (bar.current) gsap.set(bar.current, { opacity: 0, y: 0, height: 0, clipPath: 'inset(0 100% 0 0)' }) }, [])

  // Cursor (unlumen): springs on the pointer, tilt from velocity, a little squash when fast.
  const mx = useMotionValue(-200), my = useMotionValue(-200)
  const sx = useSpring(mx, FOLLOW), sy = useSpring(my, FOLLOW)
  const vx = useVelocity(sx), vy = useVelocity(sy)
  const tilt = useSpring(useTransform([vx, vy], ([a, b]) => Math.max(-35, Math.min(35, ((a as number) / 1000) * 24 + ((b as number) / 1000) * 18))), { damping: 15, stiffness: 200 })
  const squash = useTransform([vx, vy], ([a, b]) => 1 - Math.min(Math.hypot(a as number, b as number) / 2000, 0.1))
  const lsx = useTransform(vx, [-1000, 0, 1000], [0.9, 1, 1.15]), lsy = useTransform(vy, [-1000, 0, 1000], [1.15, 1, 0.9])
  const lkx = useTransform(vx, [-1000, 0, 1000], [-3, 0, 3])
  const custom = fine && !reduced

  const onMove = (e: React.PointerEvent) => {
    if (!custom) return
    const r = list.current?.getBoundingClientRect(); if (!r) return
    mx.set(e.clientX - r.left); my.set(e.clientY - r.top)
    if (!inside) { sx.jump(e.clientX - r.left); sy.jump(e.clientY - r.top); setInside(true) }
  }
  // The row under the pointer, read on every move (more reliable than mouseenter across overlays).
  const track = (e: React.PointerEvent) => {
    if (!fine) return
    const a = (e.target as Element).closest<HTMLElement>('a[data-i]')
    if (a) { const i = Number(a.dataset.i); if (i !== active) enter(a, i) }
  }

  const enter = (el: HTMLElement, i: number) => {
    if (!fine) return
    const l = list.current, b = bar.current; if (!l || !b) return
    const lr = l.getBoundingClientRect(), rr = el.getBoundingClientRect()
    const first = active === null
    setActive(i)
    if (reduced) { gsap.set(b, { y: rr.top - lr.top, height: rr.height, opacity: 1, clipPath: 'inset(0 0% 0 0)' }); return }
    if (first) gsap.set(b, { y: rr.top - lr.top, height: rr.height, opacity: 1 })
    gsap.to(b, { y: rr.top - lr.top, height: rr.height, opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: first ? 0.45 : SMOOTH, ease: first ? 'expo.out' : 'power3.out', overwrite: 'auto' })
  }
  const leave = () => {
    setActive(null); setInside(false)
    if (bar.current) gsap.to(bar.current, { opacity: 0, clipPath: 'inset(0 0 0 100%)', duration: reduced ? 0 : SMOOTH, ease: 'power2.out', overwrite: 'auto', onComplete: () => { if (bar.current) gsap.set(bar.current, { clipPath: 'inset(0 100% 0 0)' }) } })
  }

  const item = active === null ? null : ITEMS[active]

  return (
    <section id="nea" className="bg-ink text-ivory" data-theme="dark">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(3.4rem,9vw,8.4rem)] uppercase leading-[.86]">Νέα από<br />το μαγαζί</h2>
          <a href={SHOP.facebook} target="_blank" rel="noopener" className="cut-link inline-flex items-center gap-2 text-ivory"><FacebookLogo size={22} weight="bold" /> Όλα στο Facebook</a>
        </div>

        <div className="relative mt-14">
          <ul ref={list} className="relative border-t border-ivory/15" style={{ cursor: custom ? 'none' : undefined }}
            onPointerMove={(e) => { onMove(e); track(e) }} onPointerLeave={leave} onPointerDown={() => { if (custom) chop.start({ rotate: [0, 38, -6, 0], y: [0, 10, 0, 0], transition: { duration: 0.32, times: [0, 0.35, 0.7, 1], ease: 'easeOut' } }) }}>
            <div ref={bar} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-red max-md:hidden" />
            {ITEMS.map((n, i) => {
              const on = active === i
              return (
                <li key={n.id} className="relative z-10 border-b border-ivory/15">
                  <a href={n.href} onClick={n.href.startsWith('/') ? link('order') : undefined} target={n.ext ? '_blank' : undefined} rel={n.ext ? 'noopener' : undefined}
                    data-i={i} onFocus={(e) => enter(e.currentTarget, i)}
                    style={{ cursor: custom ? 'none' : undefined }}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-5 outline-none md:grid-cols-[180px_minmax(0,1fr)_auto] md:gap-8 md:px-6 md:py-7">
                    <span className={cn('font-mono text-[11.5px] uppercase transition-colors duration-300 max-md:hidden', on ? 'text-ivory' : 'text-ivory/60')}>{n.when}</span>
                    <span className="min-w-0">
                      <span className="font-mono text-[11px] uppercase text-ivory/60 md:hidden">{n.when}</span>
                      <span className={cn('block font-display text-[clamp(1.6rem,3.6vw,3.2rem)] uppercase leading-[.95] transition-transform duration-300 ease-[var(--ease-expo)]', on && 'md:translate-x-3')}>{n.title}</span>
                      <span className={cn('mt-2 block max-w-[62ch] text-[15px] transition-colors duration-300 md:text-base', on ? 'text-ivory/90' : 'text-ivory/70')}>{n.meta}</span>
                    </span>
                    <ArrowUpRight aria-hidden size={22} className={cn('transition-all duration-300', on ? '-translate-y-1 translate-x-1 text-ivory' : 'text-ivory/50')} />
                  </a>
                </li>
              )
            })}

            {custom && (
              <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-visible">
                <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }} animate={{ opacity: inside ? 1 : 0 }} transition={{ duration: 0.15 }}>
                  <motion.div style={{ rotate: tilt, scale: squash, transformOrigin: '4px 47px', x: -4, y: -47 }}>
                    <motion.div animate={chop} style={{ transformOrigin: '77px 19px' }}><Cleaver /></motion.div>
                  </motion.div>
                  <AnimatePresence>
                    {item && (
                      <motion.span key={item.act} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className="absolute left-6 top-6 whitespace-nowrap bg-ivory px-2.5 py-1.5 font-mono text-[11px] uppercase text-ink" style={{ scaleX: lsx, scaleY: lsy, skewX: lkx }}>
                        {item.act}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
