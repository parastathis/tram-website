/**
 * Ο Ιπποκράτης, the way a customer sees him: behind his own counter, in daylight, working, with
 * the tram mural on the wall behind him. His name comes on a strip of wrapping paper, the label
 * that goes on every parcel. Below, his story as three stops on the line, ported from 21st.dev
 * "Scroll animated timeline" by ibrandify (https://21st.dev/@ibrandify/components/scroll-timeline):
 * kept the progress line that draws itself with the scroll and the stops that light up and reveal
 * as the line reaches them; changed: the line is the tram rail with the shop's tram mark riding it,
 * the stops are square, the cards are plain type on the tile ground.
 * Picture generated in Google Flow from his own photos and the real counter as references.
 */
import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { link, ORDER_PATH } from '@/lib/route'
import { cn } from '@/lib/cn'

const STOPS = [
  { year: '1983', title: 'Ο πατέρας του ανοίγει τον πάγκο', text: 'Σεπτέμβρης του 1983, Σπάρτης & Σαλαμίνος στην Κοπή. Το όνομα το έδωσε το τραμ που περνούσε μπροστά από το μαγαζί τη δεκαετία του \'70.' },
  { year: '2017', title: 'Ο Ιπποκράτης παίρνει τα μαχαίρια', text: 'Δεύτερη γενιά στον ίδιο πάγκο. Ίδιες συνταγές στο εργαστήριο, ίδιο κόψιμο μπροστά σου, και η γειτονιά που ξέρει τι θέλει.' },
  { year: 'Σήμερα', title: 'Από τη φάρμα στον Πειραιά', text: 'Μοσχάρι και χοιρινό από τη Φάρμα Ελασσόνας, κοτόπουλο από την Πίνδο. Για όλο τον Πειραιά, και πλέον με παραγγελία από το κινητό.' },
]

function Stop({ s, i }: { s: (typeof STOPS)[number]; i: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const on = useInView(ref, { margin: '-45% 0px -45% 0px' })
  const seen = useInView(ref, { once: true, margin: '-20% 0px' })
  const reduced = useReducedMotion()
  return (
    <li ref={ref} className="relative pl-12 md:pl-0">
      <span aria-hidden className={cn('absolute left-[7px] top-2 h-4 w-4 border-2 transition-colors duration-500 md:left-1/2 md:-translate-x-1/2', on || seen ? 'border-red bg-red' : 'border-ink/35 bg-ivory')} />
      <motion.div initial={reduced ? false : { opacity: 0, y: 28 }} animate={seen ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn('md:w-[calc(50%-3rem)]', i % 2 ? 'md:ml-auto' : 'md:text-right')}>
        <p className="font-display text-[clamp(3.4rem,7vw,6rem)] uppercase leading-[.82] text-red">{s.year}</p>
        <h3 className="mt-2 font-display text-[clamp(1.7rem,2.6vw,2.4rem)] uppercase leading-[.95]">{s.title}</h3>
        <p className={cn('mt-3 max-w-[42ch] text-[16.5px] leading-relaxed text-ink-2', i % 2 ? '' : 'md:ml-auto')}>{s.text}</p>
      </motion.div>
    </li>
  )
}

export default function Butcher() {
  const reduced = useReducedMotion()
  const photo = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLOListElement>(null)
  const labelIn = useInView(photo, { once: true, margin: '-25% 0px' })
  const { scrollYProgress: ph } = useScroll({ target: photo, offset: ['start end', 'end start'] })
  const imgY = useTransform(ph, [0, 1], ['-5%', '5%'])
  const { scrollYProgress } = useScroll({ target: rail, offset: ['start 60%', 'end 55%'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })
  const fill = useTransform(p, [0, 1], ['0%', '100%'])

  return (
    <section id="ippokratis" className="relative overflow-hidden bg-ivory-2 text-ink">
      {/* at the counter */}
      <div ref={photo} className="relative h-[82svh] min-h-[520px] overflow-hidden md:h-[92svh]">
        <motion.picture className="absolute inset-x-0 -inset-y-[6%] block" style={reduced ? undefined : { y: imgY }}>
          <source media="(max-width: 767px)" srcSet="/media/gen/ippokratis-counter-m.webp" />
          <img src="/media/gen/ippokratis-counter.webp" srcSet="/media/gen/ippokratis-counter-sm.webp 820w, /media/gen/ippokratis-counter.webp 1376w" sizes="100vw" alt={`${SHOP.owner} κόβει μπριζόλα πίσω από τον πάγκο του, με τη ζωγραφιά του τραμ στον τοίχο`} className="h-full w-full object-cover" loading="lazy" />
        </motion.picture>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/55 to-transparent" />
        {/* the wrapping-paper label */}
        <motion.div initial={reduced ? false : { opacity: 0, scale: 1.18, rotate: -6 }} animate={labelIn ? { opacity: 1, scale: 1, rotate: -2.5 } : {}} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
          className="absolute bottom-8 left-5 max-w-[calc(100%-2.5rem)] origin-bottom-left bg-[#D9C3A0] px-5 py-4 text-ink shadow-[0_10px_30px_-12px_rgba(14,12,13,.55)] md:bottom-12 md:left-10 md:px-7 md:py-5"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, rgba(14,12,13,.035) 0 2px, transparent 2px 7px)' }}>
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-ink/70">Κρεοπωλείο Το Τραμ · δεύτερη γενιά</p>
          <h2 className="mt-1 font-display text-[clamp(2.8rem,8vw,6.4rem)] uppercase leading-[.84]">Ιπποκράτης<br />Πεπονάς</h2>
          <p className="mt-2 font-mono text-[12px] text-ink/75">Κόβει μπροστά σου, από το 2017</p>
        </motion.div>
      </div>

      {/* three stops */}
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-8 md:py-32">
        <h2 className="max-w-[18ch] font-display text-[clamp(2.6rem,6vw,5.4rem)] uppercase leading-[.88] md:mx-auto md:text-center">Τρεις στάσεις, ένας πάγκος</h2>
        <ol ref={rail} className="relative mt-16 space-y-20 md:mt-24 md:space-y-28">
          <span aria-hidden className="absolute bottom-0 left-[14px] top-2 w-[2px] bg-ink/15 md:left-1/2 md:-translate-x-1/2" />
          <motion.span aria-hidden className="absolute left-[14px] top-2 w-[2px] origin-top bg-red md:left-1/2 md:-translate-x-1/2" style={{ height: reduced ? '100%' : fill }} />
          {!reduced && (
            <motion.img aria-hidden src="/media/tram-mark.png" alt="" className="absolute left-[15px] z-10 h-6 w-auto -translate-x-1/2 md:left-1/2" style={{ top: fill }} />
          )}
          {STOPS.map((s, i) => <Stop key={s.year} s={s} i={i} />)}
        </ol>
        <div className="mt-20 flex flex-col items-start gap-4 md:items-center">
          <a href={ORDER_PATH} onClick={link('order')} className="group inline-flex items-center gap-3 bg-red px-6 py-4 font-display text-[1.45rem] uppercase leading-none tracking-wide text-ivory no-underline transition-colors hover:bg-red-deep">
            Παράγγειλε από τον πάγκο του <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a href={SHOP.phoneHref} className="cut-link font-mono text-[13px] text-ink-2">ή πάρε τον τηλέφωνο, {SHOP.phone}</a>
        </div>
      </div>
    </section>
  )
}
