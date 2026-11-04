/**
 * Το μαγαζί, in its own photos. Every picture here is a real photo of the corner shop (the owner's
 * Drive), all passed through one grade (scripts/grade.py: white balance, levels, a soft curve, a
 * little warmth) and one set of crops, so they read as one shoot. Nothing painted in or removed.
 * Motion: the walk-in opens with a slit (clip-path, like a tram door), then the photos rise in a
 * staggered grid (the traceability label now has its own section, Greek.tsx)
 * (21st.dev "Text Animation" by ajith66310, simplified to clip-path).
 */
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { SHOP } from '@/lib/data'


type Tile = { src: string; alt: string; cap: string; span: string; ratio: string; pos?: string }
const R = (n: string) => `/media/real/${n}.webp`
/** editorial photos made from the shop's own Drive photos (scripts/gen.py) */
const G = (n: string) => `/media/gen/${n}.webp`
const TILES: Tile[] = [
  { src: G('interior'), alt: 'Το εσωτερικό του καταστήματος με την κυρτή βιτρίνα', cap: 'Η βιτρίνα, κάθε πρωί από τις 7', span: 'md:col-span-7', ratio: 'aspect-[4/5] md:aspect-auto md:min-h-full', pos: 'object-[68%_50%] md:object-center' },
  { src: G('bag'), alt: 'Η σακούλα του καταστήματος με το κόκκινο τραμ', cap: 'Η σακούλα με το βαγόνι', span: 'md:col-span-5', ratio: 'aspect-[4/5]' },
  { src: G('clock'), alt: 'Το ρολόι του καταστήματος με το τραμ', cap: 'Το ρολόι του μαγαζιού', span: 'md:col-span-4', ratio: 'aspect-[4/5]' },
  { src: R('boats'), alt: 'Καΐκι στο ράφι πάνω από τη βιτρίνα', cap: 'Τα καΐκια στο ράφι', span: 'md:col-span-4', ratio: 'aspect-[4/5]' },
  { src: G('workshop'), alt: 'Το εργαστήριο με τον κορμό, τη μηχανή του κιμά και τα λουκάνικα', cap: 'Το εργαστήριο, εδώ γίνονται τα λουκάνικα', span: 'md:col-span-4', ratio: 'aspect-[4/5]' },
]

function Frame({ t, i }: { t: Tile; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const show = useInView(ref, { once: true, margin: '-12% 0px' })
  return (
    <motion.figure ref={ref} className={`relative overflow-hidden bg-ivory-2 ${t.span} ${t.ratio}`} initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={show ? { clipPath: 'inset(0% 0 0 0)' } : {}} transition={{ duration: 1.1, delay: (i % 3) * 0.08, ease: [0.76, 0, 0.24, 1] }}>
      <div className="absolute inset-0">
        <img src={t.src.replace('.webp', '-sm.webp')} srcSet={`${t.src.replace('.webp', '-sm.webp')} 820w, ${t.src} 1600w`} sizes="(min-width: 768px) 50vw, 100vw" alt={t.alt} className={`absolute inset-0 h-full w-full object-cover ${t.pos ?? ''}`} loading="lazy" />
      </div>
    </motion.figure>
  )
}

export default function Shop() {
  const film = useRef<HTMLDivElement>(null)
  const open = useInView(film, { once: true, margin: '-20% 0px' })
  const { scrollYProgress } = useScroll({ target: film, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1])

  return (
    <section id="magazi" className="bg-ivory text-ink">
      {/* the walk-in */}
      <div ref={film} className="relative h-[100svh] overflow-hidden bg-ink text-ivory">
        <motion.div className="absolute inset-0" initial={{ clipPath: 'inset(49.5% 0 49.5% 0)' }} animate={open ? { clipPath: 'inset(0% 0 0% 0)' } : {}} transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}>
          <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={{ y, scale }}>
            <picture>
              <source media="(max-width: 767px)" srcSet="/media/gen/interior-m.webp" />
              <img src="/media/gen/counter.webp" alt="Ο πάγκος και το εργαστήριο του καταστήματος" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            </picture>
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/20" />
        </motion.div>
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-14 md:px-8 md:pb-20">
          <p className="font-mono text-[12px] text-ivory/80">{SHOP.address} · Κοπή, Πειραιάς</p>
          <h2 className="mt-3 font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[.85]">Μπες στο<br />μαγαζί</h2>
          <p className="mt-6 max-w-[46ch] text-lg text-ivory/85 md:text-xl">Ανοιχτό από τον Σεπτέμβριο του 1983, δεύτερη γενιά. Το όνομα το έδωσε το τραμ που τη δεκαετία του '70 περνούσε μπροστά από τη γειτονιά. Εξυπηρετούμε όλο τον Πειραιά.</p>
        </div>
      </div>

      {/* the shop in photos and films */}
      <div className="mx-auto grid max-w-[1440px] gap-4 px-5 pt-20 md:grid-cols-12 md:gap-6 md:px-8 md:pt-28">
        {TILES.map((t, i) => <Frame key={t.src} t={t} i={i} />)}
      </div>

    </section>
  )
}
