/**
 * Ο Ιπποκράτης. Two generated scenes of the butcher himself (Nano Banana from his own photo as
 * identity reference), with the 21st.dev "Mask Reveal" by balick (clip-path slide + zoom settle),
 * in-view driven from the section. The portrait is the biggest picture on the page after the hero.
 */
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import { SHOP } from '@/lib/data'

const EASE = [0.76, 0, 0.24, 1] as const
function Mask({ children, show, dir = 'left', delay = 0, className = '' }: { children: ReactNode; show: boolean; dir?: 'left' | 'up'; delay?: number; className?: string }) {
  const hidden = dir === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 100% 0%)'
  return (
    <motion.div initial={false} animate={{ clipPath: show ? 'inset(0% 0% 0% 0%)' : hidden }} transition={{ duration: 1.1, delay, ease: EASE }} className={`overflow-hidden ${className}`}>
      <motion.div initial={false} animate={{ scale: show ? 1 : 1.15 }} transition={{ duration: 1.3, delay, ease: EASE }} className="h-full w-full">{children}</motion.div>
    </motion.div>
  )
}

export default function Shop() {
  const ref = useRef<HTMLElement>(null)
  const show = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  return (
    <section ref={ref} id="ergastirio" className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <Mask show={show} dir="left" className="aspect-[3/4] w-full">
              <motion.img style={{ y }} src="/media/gen/ippokratis-portrait.webp" alt="Ο Ιπποκράτης Πεπονάς στον ξύλινο πάγκο του κρεοπωλείου, με τον μπαλτά" className="h-[112%] w-full -translate-y-[6%] object-cover" loading="lazy" />
            </Mask>
          </div>
          <div className="flex flex-col justify-end md:col-span-5 md:col-start-8">
            <h2 className="font-display text-[clamp(3.4rem,7.5vw,6.8rem)] uppercase leading-[.88]">Ο Ιπποκράτης κόβει μπροστά σου</h2>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink-2">Από το 1980 στη γωνία Σπάρτης και Σαλαμίνος. Ο {SHOP.owner.split(' ')[0]} Πεπονάς κόβει ο ίδιος, στον ξύλινο πάγκο, και σου λέει ποιο κομμάτι θέλει η κάθε δουλειά. Τα λουκάνικα και το κοκορέτσι γίνονται στο εργαστήριο πίσω από τη βιτρίνα.</p>
            <p className="mt-4 max-w-[44ch] text-base text-ink-2">Ό,τι βλέπεις στη βιτρίνα κόπηκε το ίδιο πρωί. Ό,τι δεν βλέπεις, το φέρνουμε με παραγγελία.</p>
            <Mask show={show} dir="up" delay={0.25} className="mt-10 aspect-video w-full">
              <img src="/media/gen/ippokratis-wide.webp" alt="Ο Ιπποκράτης κόβει πλευρές μοσχαριού στον πάγκο" className="h-full w-full object-cover" loading="lazy" />
            </Mask>
          </div>
        </div>
      </div>
    </section>
  )
}
