/**
 * Το μαγαζί. Every picture generated in Google Flow (Nano Banana) with the owner's own Drive photos
 * of the corner shop as references (sign, bags, the tram clock, the boats on the shelf, the labels,
 * the machines), plus the films (Veo 3.1): the case and the sausages; the walk-in film comes when the Veo quota resets. Motion: the walk-in opens with a slit (clip-path, like a tram door), then the
 * photos rise in a staggered grid; the traceability label is set as a typographic document with
 * block-wipe lines (21st.dev "Text Animation" by ajith66310, simplified to clip-path).
 */
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { SHOP } from '@/lib/data'

const ROWS = [
  ['Είδος ζώου', 'Βόειο, νεαρό ζώο'],
  ['Χώρα γέννησης', 'Ελλάδα'],
  ['Εκτροφή', 'Φάρμα Ελασσόνας'],
  ['Ταξινόμηση', 'AU2+'],
  ['Κοπή', 'Σαλαμίνος 124, Πειραιάς'],
]

type Tile = { src: string; video?: string; alt: string; cap: string; span: string; ratio: string }
const TILES: Tile[] = [
  { src: '/media/gen/case.webp', video: '/media/case.mp4', alt: 'Η φωτισμένη βιτρίνα με τα κρέατα', cap: 'Η βιτρίνα, κάθε πρωί στις 7', span: 'md:col-span-7', ratio: 'aspect-[4/5] md:aspect-auto md:min-h-full' },
  { src: '/media/gen/shop-bag.webp', alt: 'Η σακούλα με το τραμ στο χέρι', cap: 'Η σακούλα με το βαγόνι', span: 'md:col-span-5', ratio: 'aspect-[3/4]' },
  { src: '/media/gen/shop-clock.webp', alt: 'Το ρολόι του μαγαζιού με το τραμ', cap: 'Παράδοση από το 1980', span: 'md:col-span-4', ratio: 'aspect-[3/4]' },
  { src: '/media/gen/shop-boats.webp', alt: 'Τα καΐκια στο ράφι πάνω από τη βιτρίνα', cap: 'Τα καΐκια του Ιπποκράτη', span: 'md:col-span-4', ratio: 'aspect-[3/4]' },
  { src: '/media/gen/shop-label.webp', alt: 'Χέρι με γάντι πάνω στο μοσχάρι με την ετικέτα', cap: 'Κάθε κομμάτι με την ετικέτα του', span: 'md:col-span-4', ratio: 'aspect-[3/4]' },
  { src: '/media/gen/shop-workshop.webp', alt: 'Το εργαστήριο με την κρεατομηχανή και τον πάγκο', cap: 'Το εργαστήριο', span: 'md:col-span-7', ratio: 'aspect-[4/5] md:aspect-auto md:min-h-full' },
  { src: '/media/gen/sausages.webp', video: '/media/sausages.mp4', alt: 'Λουκάνικα κρεμασμένα στο εργαστήριο', cap: 'Λουκάνικα του εργαστηρίου', span: 'md:col-span-5', ratio: 'aspect-[3/4]' },
]

function Frame({ t, i }: { t: Tile; i: number }) {
  const ref = useRef<HTMLElement>(null)
  const show = useInView(ref, { once: true, margin: '-12% 0px' })
  return (
    <motion.figure ref={ref} className={`relative overflow-hidden bg-ivory-2 ${t.span} ${t.ratio}`} initial={{ clipPath: 'inset(100% 0 0 0)' }} animate={show ? { clipPath: 'inset(0% 0 0 0)' } : {}} transition={{ duration: 1.1, delay: (i % 3) * 0.08, ease: [0.76, 0, 0.24, 1] }}>
      <div className="absolute inset-0">
        <img src={t.src} alt={t.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        {t.video && <video className="absolute inset-0 h-full w-full object-cover" src={t.video} poster={t.src} autoPlay muted loop playsInline preload="metadata" onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none' }} />}
      </div>
      <figcaption className="absolute bottom-3 left-3 bg-ivory px-3 py-1 font-mono text-[12px] text-ink">{t.cap}</figcaption>
    </motion.figure>
  )
}

export default function Shop() {
  const film = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLDivElement>(null)
  const open = useInView(film, { once: true, margin: '-20% 0px' })
  const show = useInView(label, { once: true, margin: '-20% 0px -20% 0px' })
  const { scrollYProgress } = useScroll({ target: film, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1])

  return (
    <section id="magazi" className="bg-ivory text-ink">
      {/* the walk-in */}
      <div ref={film} className="relative h-[100svh] overflow-hidden bg-ink text-ivory">
        <motion.div className="absolute inset-0" initial={{ clipPath: 'inset(49.5% 0 49.5% 0)' }} animate={open ? { clipPath: 'inset(0% 0 0% 0)' } : {}} transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}>
          <motion.div className="absolute inset-x-0 -inset-y-[8%]" style={{ y, scale }}>
            <img src="/media/gen/shop-front.webp" alt="Η γωνία Σπάρτης και Σαλαμίνος με την ταμπέλα Το Τραμ" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-ink/20" />
        </motion.div>
        <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-14 md:px-8 md:pb-20">
          <p className="font-mono text-[12px] text-ivory/80">{SHOP.address} · Κοπή, Πειραιάς</p>
          <h2 className="mt-3 font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[.85]">Μπες στο<br />μαγαζί</h2>
          <p className="mt-6 max-w-[46ch] text-lg text-ivory/85 md:text-xl">Γωνιακό, με την ταμπέλα του 1980 και το βαγόνι στη σακούλα. Η βιτρίνα στρώνεται κάθε πρωί, το εργαστήριο είναι πίσω της και ο πάγκος μπροστά σου.</p>
        </div>
      </div>

      {/* the shop in photos and films */}
      <div className="mx-auto grid max-w-[1440px] gap-4 px-5 pt-20 md:grid-cols-12 md:gap-6 md:px-8 md:pt-28">
        {TILES.map((t, i) => <Frame key={t.src} t={t} i={i} />)}
      </div>

      {/* the label */}
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
        <div className="md:col-span-5">
          <h3 className="font-display text-[clamp(2.8rem,6.5vw,5.6rem)] uppercase leading-[.9]">Κρέας με ονοματεπώνυμο</h3>
          <p className="mt-5 max-w-[42ch] text-lg text-ink-2">Κάθε μοσχάρι μπαίνει στο μαγαζί με την ετικέτα του: πού γεννήθηκε, πού μεγάλωσε, τι κατηγορία είναι. Η ετικέτα μένει πάνω στο κρέας μέχρι να κοπεί. Το AU2+ είναι το κρέας που θέλεις για μπριζόλα.</p>
        </div>
        <div ref={label} className="md:col-span-6 md:col-start-7">
          <div className="border-[3px] border-label bg-ivory-2 p-6 md:p-8">
            <div className="flex items-center justify-between border-b-2 border-label pb-3 font-mono text-[12px] font-semibold text-label">
              <span>Ελληνικό βόειο · νεαρό ζώο</span><span>GR</span>
            </div>
            <dl className="mt-4">
              {ROWS.map(([k, v], i) => (
                <div key={k} className="relative grid grid-cols-[1fr_1.4fr] gap-4 border-b border-ink/15 py-3 font-mono text-[14px]">
                  <motion.div aria-hidden className="absolute inset-0 bg-label" initial={{ scaleX: 0 }} animate={show ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0 }} transition={{ duration: 1.2, times: [0, 0.4, 0.55, 1], delay: i * 0.09, ease: [0.76, 0, 0.24, 1] }} style={{ transformOrigin: show ? 'left' : 'right' }} />
                  <motion.dt className="relative" initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: i * 0.09 + 0.5, duration: 0.01 }}>{k}</motion.dt>
                  <motion.dd className="relative font-semibold" initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: i * 0.09 + 0.5, duration: 0.01 }}>{v}</motion.dd>
                </div>
              ))}
            </dl>
            <motion.div className="mt-5 inline-block border-2 border-green px-3 py-1 font-display text-xl uppercase text-green" initial={{ opacity: 0, rotate: -6, scale: 1.3 }} animate={show ? { opacity: 1, rotate: -3, scale: 1 } : {}} transition={{ delay: 1.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>Κόπηκε σήμερα</motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
