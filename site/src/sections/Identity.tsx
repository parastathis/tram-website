/**
 * Ταυτότητα: the shop's real traceability label, set as a typographic document. Each line reveals
 * with a block wipe (21st.dev "Text Animation" by ajith66310, block-wipe line reveal, simplified
 * to CSS clip-path so it needs no SplitText here).
 */
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

const ROWS = [
  ['Είδος ζώου', 'Βόειο, νεαρό ζώο'],
  ['Χώρα γέννησης', 'Ελλάδα'],
  ['Χώρα εκτροφής', 'Ελλάδα'],
  ['Χώρα σφαγής', 'Ελλάδα'],
  ['Εκτροφή', 'Φάρμα Ελασσόνας'],
  ['Ταξινόμηση', 'AU2+'],
  ['Κοπή', 'Σαλαμίνος 124, Πειραιάς'],
]

export default function Identity() {
  const ref = useRef<HTMLDivElement>(null)
  const show = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  return (
    <section id="taftotita" className="bg-ivory-2 text-ink">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
        <div className="md:col-span-5">
          <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Κρέας με ονοματεπώνυμο</h2>
          <p className="mt-5 max-w-[42ch] text-lg text-ink-2">Κάθε μοσχάρι μπαίνει στο μαγαζί με την ετικέτα του: πού γεννήθηκε, πού μεγάλωσε, πού σφάχτηκε, τι κατηγορία είναι. Η ετικέτα μένει πάνω στο κρέας μέχρι να κοπεί.</p>
          <p className="mt-4 max-w-[42ch] text-base text-ink-2">Το AU2+ σημαίνει καλοσχηματισμένο σφάγιο με λίγο λίπος. Το κρέας που θέλεις για μπριζόλα.</p>
        </div>
        <div ref={ref} className="md:col-span-6 md:col-start-7">
          <div className="border-[3px] border-label bg-ivory p-6 md:p-8">
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
            <motion.div className="mt-5 inline-block border-2 border-green px-3 py-1 font-display text-xl uppercase text-green" initial={{ opacity: 0, rotate: -6, scale: 1.3 }} animate={show ? { opacity: 1, rotate: -3, scale: 1 } : {}} transition={{ delay: 1.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>Κόπηκε σήμερα</motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
