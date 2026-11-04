/**
 * Νέα από το μαγαζί. What is new at the counter, and what the shop has posted.
 * Ported from 21st.dev "Hover Image List" by educalvolpz
 * (https://21st.dev/@educalvolpz/components/hover-image-list).
 * Kept: rows that reveal a preview next to the cursor with a spring follow and a skew from the
 * pointer's speed, a fixed preview on focus, rAF-throttled pointer tracking, reduced motion.
 * Changed: rows are dated notices in the condensed face, the preview is a square photo with no
 * radius, and on touch screens each row shows its own photo (there is no hover there).
 * Every item is real: the online shop and its products come from the shop's Orderoo menu, the
 * dated posts from the shop's Facebook page.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { ArrowUpRight, FacebookLogo } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { cn } from '@/lib/cn'

type N = { id: string; when: string; title: string; meta: string; href: string; image: string; alt: string; ext?: boolean }
const ITEMS: N[] = [
  { id: 'online', when: 'Νέο', title: 'Παραγγέλνεις πια από εδώ', meta: 'Όλος ο πάγκος με τιμές, στο καλάθι σου. Μας λες πώς να το κόψουμε και πότε περνάς, ή σου το φέρνουμε.', href: '#pagkos', image: '/media/gen/counter-sm.webp', alt: 'Ο πάγκος του καταστήματος' },
  { id: 'giortes', when: 'Χριστούγεννα', title: 'Το γιορτινό τραπέζι κλείνεται νωρίς', meta: 'Γαλοπούλα, γουρουνάκι γάλακτος, αρνί και κατσίκι γάλακτος ολόκληρα ή μισά, κοκορέτσι και γαρδούμπα παραγωγής μας.', href: '#paraggelia', image: '/media/real/fb-arnia-sm.webp', alt: 'Αρνιά κρεμασμένα στο ψυγείο του καταστήματος' },
  { id: 'spania', when: 'Στον πάγκο', title: 'Αγριογούρουνο, πετεινός Κρήτης, κουνέλι Ρεθύμνου', meta: 'Τα σπάνια του πάγκου, μαζί με γραβιέρα Κρήτης και φέτα Αμφιλοχίας.', href: '#pagkos', image: '/media/p/cmvtxm2th003n08l2af3z4mra-sm.webp', alt: 'Πετεινός Κρήτης' },
  { id: 'ergastirio', when: 'Εργαστήριο', title: '18 παρασκευές, φτιαγμένες εδώ', meta: 'Λουκάνικο χωριάτικο, κοντοσούβλι, ρολά γεμιστά, σουβλάκια, μπιφτέκια, και το μοσχαρίσιο σουτζούκι πικάντικο.', href: '#pagkos', image: '/media/real/fb-loukaniko-2-sm.webp', alt: 'Χειροποίητα λουκάνικα του εργαστηρίου' },
  { id: 'pasxa', when: '8 Απρ 2025', title: 'Σας περιμένουμε να οργανώσουμε το πασχαλινό σας τραπέζι', meta: 'Από τη σελίδα μας στο Facebook.', href: SHOP.facebook, ext: true, image: '/media/real/fb-kokoretsi-sm.webp', alt: 'Κοκορέτσι παραγωγής μας, 11,50 €' },
  { id: 'kalokairi', when: 'Κάθε Αύγουστο', title: 'Κλειστά για λίγες μέρες καλοκαιρινών διακοπών', meta: 'Οι ημερομηνίες βγαίνουν πρώτα στο Facebook.', href: SHOP.facebook, ext: true, image: '/media/real/fb-kalokairi-sm.webp', alt: 'Ανακοίνωση καλοκαιρινών διακοπών του καταστήματος' },
]

const SIZE = 300
const SPRING = { damping: 26, stiffness: 260 }
const SKEW = { damping: 18, stiffness: 220 }
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b)

export default function News() {
  const reduced = useReducedMotion()
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [source, setSource] = useState<'focus' | 'pointer' | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const last = useRef<{ t: number; x: number } | null>(null)
  const pending = useRef<{ x: number; y: number } | null>(null)
  const ticking = useRef(false)
  const x = useMotionValue(0), y = useMotionValue(0), skew = useMotionValue(0)
  const sx = useSpring(x, SPRING), sy = useSpring(y, SPRING), sk = useSpring(skew, SKEW)

  useEffect(() => { const mq = window.matchMedia('(hover: hover) and (pointer: fine)'); setHover(mq.matches); const f = (e: MediaQueryListEvent) => setHover(e.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  const fixed = Boolean(reduced) || !hover || source === 'focus'

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (fixed) return
    pending.current = { x: e.clientX, y: e.clientY }
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame((now) => {
      ticking.current = false
      const p = pending.current, el = box.current
      if (!p || !el) return
      const r = el.getBoundingClientRect(), lx = p.x - r.left, ly = p.y - r.top
      let vx = 0
      if (last.current) { const dt = Math.min(now - last.current.t, 50); if (dt > 0) vx = (lx - last.current.x) / dt }
      last.current = { t: now, x: lx }
      skew.set(clamp(vx * 0.12, -8, 8)); x.set(lx - SIZE / 2); y.set(ly - SIZE / 2)
    })
  }, [fixed, skew, x, y])

  const item = active === null ? null : ITEMS[active]

  return (
    <section id="nea" className="bg-ink text-ivory" data-theme="dark">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(3.4rem,9vw,8.4rem)] uppercase leading-[.86]">Νέα από<br />το μαγαζί</h2>
          <a href={SHOP.facebook} target="_blank" rel="noopener" className="cut-link inline-flex items-center gap-2 text-ivory"><FacebookLogo size={22} weight="bold" /> Όλα στο Facebook</a>
        </div>

        <div ref={box} className="relative mt-14" onPointerMove={onMove} onPointerLeave={() => { setActive(null); setSource(null); last.current = null }} onBlur={(e) => { if (source === 'focus' && !e.currentTarget.contains(e.relatedTarget)) { setActive(null); setSource(null) } }}>
          <ul className="border-t border-ivory/15">
            {ITEMS.map((n, i) => (
              <li key={n.id} className="border-b border-ivory/15">
                <a href={n.href} target={n.ext ? '_blank' : undefined} rel={n.ext ? 'noopener' : undefined}
                  onMouseEnter={() => { if (hover) { setActive(i); setSource('pointer') } }} onFocus={() => { setActive(i); setSource('focus') }}
                  className={cn('group grid grid-cols-[84px_1fr_auto] items-center gap-4 py-5 outline-none transition-opacity duration-300 md:grid-cols-[180px_1fr_auto] md:gap-8 md:py-7', active !== null && active !== i && 'md:opacity-40')}>
                  <span className="font-mono text-[11.5px] uppercase text-ivory/60 max-md:hidden">{n.when}</span>
                  <img src={n.image} alt={n.alt} loading="lazy" className="aspect-square w-[84px] object-cover md:hidden" />
                  <span className="min-w-0">
                    <span className="font-mono text-[11px] uppercase text-ivory/60 md:hidden">{n.when}</span>
                    <span className="block font-display text-[clamp(1.6rem,3.6vw,3.2rem)] uppercase leading-[.95] transition-colors duration-200 group-hover:text-[#E8A0A6] group-focus-visible:text-[#E8A0A6]">{n.title}</span>
                    <span className="mt-2 block max-w-[62ch] text-[15px] text-ivory/70 md:text-base">{n.meta}</span>
                  </span>
                  <ArrowUpRight aria-hidden size={22} className="text-ivory/50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ivory" />
                </a>
              </li>
            ))}
          </ul>

          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden max-md:hidden">
            <motion.div className={cn('absolute overflow-hidden', fixed && 'right-8 top-1/2 -translate-y-1/2')}
              style={{ width: SIZE, height: SIZE, ...(fixed ? {} : { left: 0, top: 0, x: sx, y: sy, skewX: sk }) }}
              initial={{ opacity: 0, scale: 0.94 }} animate={reduced ? { opacity: item ? 1 : 0 } : { opacity: item ? 1 : 0, scale: item ? 1 : 0.94 }} transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0.1, duration: 0.25 }}>
              <AnimatePresence initial={false}>
                {item && <motion.img key={item.id} src={item.image} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={reduced ? { duration: 0 } : { type: 'spring', bounce: 0.1, duration: 0.25 }} />}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
