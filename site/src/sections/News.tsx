/**
 * Νέα από το μαγαζί. What is new at the counter, and what the shop has posted.
 * Rows: ported from 21st.dev "Interactive List Preview" by hyperiux
 * (https://21st.dev/@hyperiux/components/interactive-list-preview).
 * Kept: a highlight bar that slides to the hovered row with GSAP (power3.out), the row text
 * re-coloured on the bar, the bar fading out when the pointer leaves the list, reduced motion.
 * Changed: no preview photos at all (he asked for them gone); the bar is a tram-red block that
 * wipes in from the left like a cut, rows are dated notices in the condensed face.
 * The cleaver pointer is site-wide (components/CleaverCursor.tsx); each row gives it its action.
 * Every item is real: the online shop and its products come from the shop's Orderoo menu, the
 * dated posts from the shop's Facebook page.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useReducedMotion } from 'motion/react'
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

export default function News() {
  const reduced = useReducedMotion()
  const [fine, setFine] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => { const mq = window.matchMedia('(hover: hover) and (pointer: fine)'); setFine(mq.matches); const f = (e: MediaQueryListEvent) => setFine(e.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  useEffect(() => { if (bar.current) gsap.set(bar.current, { opacity: 0, y: 0, height: 0, clipPath: 'inset(0 100% 0 0)' }) }, [])


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
    setActive(null)
    if (bar.current) gsap.to(bar.current, { opacity: 0, clipPath: 'inset(0 0 0 100%)', duration: reduced ? 0 : SMOOTH, ease: 'power2.out', overwrite: 'auto', onComplete: () => { if (bar.current) gsap.set(bar.current, { clipPath: 'inset(0 100% 0 0)' }) } })
  }

  return (
    <section id="nea" className="bg-ink text-ivory" data-theme="dark">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(3.4rem,9vw,8.4rem)] uppercase leading-[.86]">Νέα από<br />το μαγαζί</h2>
          <a href={SHOP.facebook} target="_blank" rel="noopener" className="cut-link inline-flex items-center gap-2 text-ivory"><FacebookLogo size={22} weight="bold" /> Όλα στο Facebook</a>
        </div>

        <div className="relative mt-14">
          <ul ref={list} className="relative border-t border-ivory/15"
            onPointerMove={track} onPointerLeave={leave}>
            <div ref={bar} aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-red max-md:hidden" />
            {ITEMS.map((n, i) => {
              const on = active === i
              return (
                <li key={n.id} className="relative z-10 border-b border-ivory/15">
                  <a href={n.href} onClick={n.href.startsWith('/') ? link('order') : undefined} target={n.ext ? '_blank' : undefined} rel={n.ext ? 'noopener' : undefined}
                    data-i={i} data-cursor={n.act} onFocus={(e) => enter(e.currentTarget, i)}
                   
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

          </ul>
        </div>
      </div>
    </section>
  )
}
