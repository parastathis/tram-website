/**
 * Uses 21st.dev "Mask Reveal" by balick (clip-path mask that slides across, zoom settle)
 * https://21st.dev/@balick/components/mask-reveal
 * Changed: the in-view trigger sits on the visible section, not on the clipped element
 * (a fully clipped element never reports itself in view).
 */
import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { SHOP } from '@/lib/data'

const EASE = [0.76, 0, 0.24, 1] as const
const HIDDEN = { left: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)', up: 'inset(0% 0% 100% 0%)', down: 'inset(100% 0% 0% 0%)' }

function MaskReveal({ children, show, direction = 'left', delay = 0, className = '' }: { children: ReactNode; show: boolean; direction?: keyof typeof HIDDEN; delay?: number; className?: string }) {
  return (
    <motion.div initial={false} animate={{ clipPath: show ? 'inset(0% 0% 0% 0%)' : HIDDEN[direction] }} transition={{ duration: 1, delay, ease: EASE }} className={`overflow-hidden motion-reduce:[clip-path:none]! ${className}`}>
      <motion.div initial={false} animate={{ scale: show ? 1 : 1.15 }} transition={{ duration: 1.2, delay, ease: EASE }} className="size-full motion-reduce:[transform:none]!">
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function Shop() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' })
  const gridRef = useRef<HTMLDivElement>(null)
  const gridIn = useInView(gridRef, { once: true, margin: '-10% 0px -10% 0px' })
  return (
    <section id="ippokratis" className="bg-tile text-ink">
      <div ref={ref} className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <MaskReveal show={inView} direction="left" className="aspect-[3/4] w-full">
              <img src="/media/ippokratis.webp" alt="Ο Ιπποκράτης Πεπονάς με τον μπαλτά στο εργαστήριο του κρεοπωλείου" className="h-full w-full object-cover" loading="lazy" />
            </MaskReveal>
          </div>
          <div className="flex flex-col justify-end md:col-span-6 md:col-start-7">
            <h2 className="font-display text-[clamp(2rem,4.2vw,3.8rem)] font-extrabold leading-[1.05] tracking-tight">Ο Ιπποκράτης, το εργαστήριο και η γειτονιά.</h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-2">
              Το Τραμ είναι στη γωνία Σπάρτης και Σαλαμίνος από το 1980. Ο {SHOP.owner.split(' ')[0]} κόβει ο ίδιος, στον ξύλινο πάγκο, μπροστά σου. Το κρέας έρχεται με ετικέτα, τα λουκάνικα και το κοκορέτσι γίνονται εδώ, και οι παραγγελίες των γιορτών γράφονται με το χέρι.
            </p>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
              Το όνομα θυμίζει το τραμ Πειραιά και Περάματος που περνούσε από τη γειτονιά μέχρι το 1977. Στη σακούλα του μαγαζιού είναι ακόμα το βαγόνι 41.
            </p>
            <div ref={gridRef} className="mt-10 grid grid-cols-2 gap-4">
              <MaskReveal show={gridIn} direction="up" delay={0.1} className="aspect-[4/5]">
                <img src="/media/bag.webp" alt="Η σακούλα του μαγαζιού με το κόκκινο τραμ" className="h-full w-full object-cover" loading="lazy" />
              </MaskReveal>
              <MaskReveal show={gridIn} direction="up" delay={0.25} className="aspect-[4/5]">
                <img src="/media/shopfront.webp" alt="Η πρόσοψη του κρεοπωλείου Το Τραμ στη Σαλαμίνος" className="h-full w-full object-cover" loading="lazy" />
              </MaskReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
