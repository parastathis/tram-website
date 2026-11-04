/**
 * Ελληνικό κρέας, με χαρτιά. The real traceability label from the shop's Drive (IMG_5822: «ΕΛΛΗΝΙΚΟ
 * ΒΟΕΙΟ, ΝΕΑΡΟ ΖΩΟ με ονοματεπώνυμο», born, raised and slaughtered in Greece, Φάρμα Ελασσόνας) next
 * to the same facts set as a typographic document. Motion: the photo leans in with the scroll, the
 * document's lines wipe in block by block (21st.dev "Text Animation" by ajith66310, simplified to a
 * scaleX block), three stamps land one after the other.
 */
import { useRef } from 'react'
import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import { link, ORDER_PATH } from '@/lib/route'

const ROWS = [
  ['Είδος ζώου', 'Βόειο, νεαρό ζώο'],
  ['Χώρα γέννησης', 'Ελλάδα'],
  ['Χώρα εκτροφής', 'Ελλάδα'],
  ['Χώρα σφαγής', 'Ελλάδα'],
  ['Προμηθευτής', 'Φάρμα Ελασσόνας'],
  ['Ταξινόμηση', 'AU2+'],
]
const STAMPS = ['Γεννήθηκε στην Ελλάδα', 'Μεγάλωσε στην Ελλάδα', 'Κόβεται στον Πειραιά']

export default function Greek() {
  const reduced = useReducedMotion()
  const photo = useRef<HTMLDivElement>(null)
  const doc = useRef<HTMLDivElement>(null)
  const show = useInView(doc, { once: true, margin: '-15% 0px -15% 0px' })
  const { scrollYProgress } = useScroll({ target: photo, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1])
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 1])

  return (
    <section id="elliniko" className="bg-ivory-2 text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[.84] md:col-span-8">Ελληνικό.<br /><span className="text-label">Με χαρτιά.</span></h2>
          <p className="max-w-[40ch] text-lg text-ink-2 md:col-span-4">Κάθε μοσχάρι έρχεται στο μαγαζί με την ετικέτα του: πού γεννήθηκε, πού μεγάλωσε, πού σφάχτηκε. Η ετικέτα μένει πάνω στο κρέας μέχρι να το κόψουμε, για να τη δεις κι εσύ.</p>
        </div>

        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12 md:gap-10">
          <div ref={photo} className="relative aspect-[4/5] overflow-hidden bg-ink md:col-span-6">
            <motion.img src="/media/real/label-sm.webp" srcSet="/media/real/label-sm.webp 820w, /media/real/label.webp 1800w" sizes="(min-width: 768px) 50vw, 100vw" loading="lazy"
              alt="Η ετικέτα πάνω στο μοσχάρι: Ελληνικό βόειο, νεαρό ζώο, με ονοματεπώνυμο. Χώρα γέννησης, εκτροφής και σφαγής Ελλάδα, Φάρμα Ελασσόνας"
              className="absolute inset-0 h-full w-full object-cover" style={reduced ? undefined : { scale, rotate }} />
            <span className="absolute bottom-3 left-3 bg-ivory px-3 py-1 font-mono text-[12px]">Η πραγματική ετικέτα, πάνω στο κρέας</span>
          </div>

          <div ref={doc} className="flex flex-col justify-between gap-8 md:col-span-6">
            <div className="border-[3px] border-label bg-ivory p-5 md:p-8">
              <div className="flex items-center justify-between border-b-2 border-label pb-3 font-mono text-[12px] font-semibold text-label">
                <span>Ελληνικό βόειο · νεαρό ζώο · με ονοματεπώνυμο</span><span>GR</span>
              </div>
              <dl className="mt-3">
                {ROWS.map(([k, v], i) => (
                  <div key={k} className="relative grid grid-cols-[1fr_1.3fr] gap-4 border-b border-ink/15 py-3 font-mono text-[14px] md:text-[15px]">
                    <motion.div aria-hidden className="absolute inset-0 bg-label" initial={{ scaleX: 0 }} animate={show && !reduced ? { scaleX: [0, 1, 1, 0] } : { scaleX: 0 }} transition={{ duration: 1.2, times: [0, 0.4, 0.55, 1], delay: i * 0.09, ease: [0.76, 0, 0.24, 1] }} style={{ transformOrigin: 'left' }} />
                    <motion.dt className="relative" initial={reduced ? false : { opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: i * 0.09 + 0.5, duration: 0.01 }}>{k}</motion.dt>
                    <motion.dd className={i >= 1 && i <= 3 ? 'relative font-semibold text-label' : 'relative font-semibold'} initial={reduced ? false : { opacity: 0 }} animate={show ? { opacity: 1 } : {}} transition={{ delay: i * 0.09 + 0.5, duration: 0.01 }}>{v}</motion.dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-wrap gap-3">
              {STAMPS.map((s, i) => (
                <motion.span key={s} className="inline-block border-2 border-green px-3 py-1.5 font-display text-[1.35rem] uppercase leading-none text-green"
                  initial={reduced ? false : { opacity: 0, rotate: -8, scale: 1.35 }} animate={show ? { opacity: 1, rotate: i % 2 ? 2 : -2.5, scale: 1 } : {}} transition={{ delay: 1 + i * 0.22, type: 'spring', stiffness: 420, damping: 16 }}>{s}</motion.span>
              ))}
            </div>
            <ul className="grid gap-px bg-ink/15 sm:grid-cols-2">
              <li className="bg-ivory-2 py-4 pr-4"><p className="font-display text-2xl uppercase leading-none">Μοσχάρι & χοιρινό</p><p className="mt-1 text-[15px] text-ink-2">Από τη Φάρμα Ελασσόνας</p></li>
              <li className="bg-ivory-2 py-4 sm:pl-4"><p className="font-display text-2xl uppercase leading-none">Κοτόπουλο</p><p className="mt-1 text-[15px] text-ink-2">Από την Πίνδο</p></li>
            </ul>
            <a href={ORDER_PATH} onClick={link('order')} className="group inline-flex items-center gap-3 self-start bg-red px-6 py-4 font-display text-[1.45rem] uppercase leading-none tracking-wide text-ivory no-underline transition-colors hover:bg-red-deep">
              Διάλεξε ελληνικό κρέας <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
