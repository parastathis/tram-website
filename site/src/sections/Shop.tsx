/**
 * Το εργαστήριο. Two generated scenes of the shop (display case, hanging sausages) with the
 * 21st.dev "Mask Reveal" by balick (clip-path slide + zoom settle), in-view driven from the section.
 */
import { motion, useInView } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { SHOP } from '@/lib/data'

const EASE = [0.76, 0, 0.24, 1] as const
function Mask({ children, show, dir = 'left', delay = 0, className = '' }: { children: ReactNode; show: boolean; dir?: 'left' | 'up'; delay?: number; className?: string }) {
  const hidden = dir === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)'
  return (
    <motion.div initial={false} animate={{ clipPath: show ? 'inset(0% 0% 0% 0%)' : hidden }} transition={{ duration: 1, delay, ease: EASE }} className={`overflow-hidden ${className}`}>
      <motion.div initial={false} animate={{ scale: show ? 1 : 1.15 }} transition={{ duration: 1.2, delay, ease: EASE }} className="h-full w-full">{children}</motion.div>
    </motion.div>
  )
}

export default function Shop() {
  const ref = useRef<HTMLDivElement>(null)
  const show = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' })
  return (
    <section id="ergastirio" className="bg-ivory text-ink">
      <div ref={ref} className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <Mask show={show} dir="left" className="aspect-[16/10] w-full">
              <img src="/media/gen/case.webp" alt="Η βιτρίνα με τα κρέατα της ημέρας" className="h-full w-full object-cover" loading="lazy" />
            </Mask>
          </div>
          <div className="flex flex-col justify-end md:col-span-5">
            <h2 className="font-display text-[clamp(3rem,6.5vw,5.6rem)] uppercase leading-[.9]">Ο Ιπποκράτης κόβει μπροστά σου</h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-2">Από το 1980 στη γωνία Σπάρτης και Σαλαμίνος. Ο {SHOP.owner.split(' ')[0]} Πεπονάς κόβει ο ίδιος στον ξύλινο πάγκο. Τα λουκάνικα και το κοκορέτσι γίνονται στο εργαστήριο πίσω από τη βιτρίνα, και οι παραγγελίες των γιορτών γράφονται με το χέρι.</p>
          </div>
          <div className="md:col-span-5 md:col-start-2">
            <Mask show={show} dir="up" delay={0.2} className="aspect-[4/3] w-full">
              <img src="/media/gen/sausages.webp" alt="Χειροποίητα λουκάνικα κρεμασμένα στο εργαστήριο" className="h-full w-full object-cover" loading="lazy" />
            </Mask>
          </div>
          <div className="flex items-end md:col-span-5 md:col-start-8">
            <p className="max-w-[40ch] text-base text-ink-2">Ό,τι βλέπεις στη βιτρίνα κόπηκε το ίδιο πρωί. Ό,τι δεν βλέπεις, το φέρνουμε με παραγγελία.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
