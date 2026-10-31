/**
 * Ported from 21st.dev "Scroll 01" by felipemenezes098
 * https://21st.dev/@felipemenezes098/components/scroll-01
 * Kept: sticky media on one side that swaps as the reader scrolls the text items,
 * per-item opacity and y travel, stacked fallback on phones.
 * Changed: the items are the fields of the shop's real traceability label (AU2+), set in mono
 * like the label itself, and the sticky media are the shop's own photos.
 */
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import { useRef, useState, type Dispatch, type SetStateAction } from 'react'

const ITEMS = [
  { k: 'Είδος ζώου', v: 'Βόειο, νεαρό ζώο', text: 'Κάθε μοσχάρι μπαίνει στο μαγαζί με την ετικέτα του. Δεν είναι διακόσμηση, είναι η ταυτότητά του.', media: '/media/label.webp', alt: 'Η ετικέτα ιχνηλασιμότητας πάνω στο κρέας' },
  { k: 'Χώρα γέννησης · εκτροφής · σφαγής', v: 'Ελλάδα · Ελλάδα · Ελλάδα', text: 'Φάρμα Ελασσόνας. Γεννήθηκε, μεγάλωσε και σφάχτηκε στην Ελλάδα, με αριθμό έγκρισης σφαγείου στην ετικέτα.', media: '/media/farm-box.webp', alt: 'Κιβώτιο από τη Φάρμα Ελασσόνας' },
  { k: 'Ταξινόμηση', v: 'AU2+', text: 'Κατηγορία διάπλασης και πάχους. Το AU2+ σημαίνει καλοσχηματισμένο σφάγιο με λίγο λίπος: το κρέας που θέλεις για μπριζόλα.', media: '/media/beef-label.webp', alt: 'Μοσχάρι με την ετικέτα AU2+' },
  { k: 'Κοπή', v: 'Σαλαμίνος 124, την ώρα που το ζητάς', text: 'Από το ψυγείο στον πάγκο και από τον πάγκο στη σακούλα σου. Τίποτα δεν κόβεται από πριν.', media: '/media/beef-block.webp', alt: 'Κομμάτι μοσχάρι πάνω στον ξύλινο πάγκο' },
]

function Item({ item, index, setActive }: { item: (typeof ITEMS)[number]; index: number; setActive: Dispatch<SetStateAction<number>> }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'end 15%'] })
  const y = useTransform(scrollYProgress, [0, 1], [18, -18])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], index === 0 ? [1, 0.75, 1, 0] : [0, 0.75, 1, 0])
  const isActive = useTransform(scrollYProgress, (v) => v > 0.4 && v < 0.6)
  useMotionValueEvent(isActive, 'change', (v) => { if (v) setActive((p) => (p === index ? p : index)) })
  return (
    <motion.article ref={ref} style={{ opacity, y }} className="label-row">
      <p className="font-mono text-[12px] text-ink-2">{item.k}</p>
      <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight md:text-4xl">{item.v}</h3>
      <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{item.text}</p>
    </motion.article>
  )
}

export default function Identity() {
  const [active, setActive] = useState(0)
  return (
    <section id="taftotita" className="bg-tile text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-2xl">
          <h2 className="font-display text-[clamp(2rem,4.2vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight">Κρέας με ονοματεπώνυμο.</h2>
          <p className="mt-4 text-lg text-ink-2">Η ετικέτα που βλέπεις στη βιτρίνα, γραμμή γραμμή.</p>
        </div>

        {/* phones */}
        <div className="mt-12 space-y-12 md:hidden">
          {ITEMS.map((it) => (
            <article key={it.k} className="label-row">
              <div className="aspect-[4/5] w-full overflow-hidden"><img src={it.media} alt={it.alt} className="h-full w-full object-cover" loading="lazy" /></div>
              <p className="mt-5 font-mono text-[12px] text-ink-2">{it.k}</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold leading-tight">{it.v}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{it.text}</p>
            </article>
          ))}
        </div>

        {/* desktop */}
        <div className="mt-16 hidden gap-16 md:grid md:grid-cols-[1fr_1fr]">
          <div className="sticky top-24 h-[72vh] overflow-hidden border-[3px] border-label">
            {ITEMS.map((it, i) => (
              <motion.img key={it.k} src={it.media} alt={it.alt} className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: i === 0 ? 1 : 0 }} animate={{ opacity: active === i ? 1 : 0 }} transition={{ duration: 0.2, ease: 'linear' }} />
            ))}
            <div className="absolute left-4 top-4 bg-label px-3 py-1 font-mono text-[12px] font-semibold text-tile">Ελληνικό βόειο · νεαρό ζώο</div>
          </div>
          <div className="py-[30vh]">
            <div className="space-y-[28vh]">
              {ITEMS.map((it, i) => <Item key={it.k} item={it} index={i} setActive={setActive} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
