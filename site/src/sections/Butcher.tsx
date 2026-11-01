/**
 * Ο Ιπποκράτης. His own chapter, the way a studio would shoot a name: a black stage, his dramatic
 * portrait centre-stage with his name in giant type behind him (the name sits BEHIND the figure:
 * the portrait is cut out so the letters pass behind his shoulders), then his film on the block.
 * Motion: the name letters rise from under the floor line (SplitText, GSAP), the portrait reveals
 * through a vertical slit, the wide studio shot sits in a frame below. Pictures generated from his
 * own photo as reference (Nano Banana).
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { motion, useScroll, useTransform } from 'motion/react'
import { SHOP } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function Butcher() {
  const section = useRef<HTMLElement>(null)
  const name = useRef<HTMLHeadingElement>(null)
  const figure = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const yName = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  const yFig = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) return
      const split = new SplitText(name.current, { type: 'chars', mask: 'chars' })
      gsap.from(split.chars, { yPercent: 110, stagger: 0.035, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 60%', toggleActions: 'play none none none' } })
      gsap.fromTo(figure.current, { clipPath: 'inset(0 49.5% 0 49.5%)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: section.current, start: 'top 55%', toggleActions: 'play none none none' } })
      gsap.from(line.current, { y: 20, opacity: 0, duration: 0.8, delay: 0.9, scrollTrigger: { trigger: section.current, start: 'top 55%', toggleActions: 'play none none none' } })
    }, section)
    return () => ctx.revert()
  }, [])

  const first = SHOP.owner.split(' ')[0]
  const last = SHOP.owner.split(' ')[1]

  return (
    <section ref={section} id="ippokratis" data-theme="dark" className="relative overflow-hidden bg-ink text-ivory">
      {/* stage */}
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1600px] items-end justify-center px-5 pb-0 pt-28 md:px-8">
        <motion.h2 ref={name} style={{ y: yName }} className="pointer-events-none absolute left-1/2 top-[18%] z-0 w-[120vw] -translate-x-1/2 text-center font-display text-[17.5vw] uppercase leading-[.8] text-ivory/90 md:top-[12%] md:text-[22vw]">
          {first}
        </motion.h2>
        <motion.div ref={figure} style={{ y: yFig }} className="relative z-10 w-[88vw] max-w-[640px] md:w-[46vw]">
          <img src="/media/gen/ippokratis-studio.webp" alt={`${SHOP.owner}, ο κρεοπώλης του Τραμ, με τον μπαλτά`} className="block w-full" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/media/gen/ippokratis-portrait.webp' }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        </motion.div>
        <p ref={line} className="absolute bottom-10 left-5 z-20 max-w-[30ch] font-mono text-[12px] text-ivory/80 md:left-8">{last} · κρεοπώλης · Σπάρτης & Σαλαμίνος, από το 1980</p>
        <p className="absolute bottom-10 right-5 z-20 hidden font-display text-2xl uppercase text-ivory md:right-8 md:block">Κόβει μπροστά σου</p>
      </div>

      {/* the block */}
      <div className="relative mx-auto grid max-w-[1600px] gap-6 px-5 pb-24 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pb-32">
        <figure className="relative aspect-[16/10] overflow-hidden md:col-span-8">
          <img src="/media/gen/ippokratis-studio-wide.webp" alt="Ο Ιπποκράτης δίπλα στον πάγκο με τις πλευρές, στο σκοτάδι" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </figure>
        <div className="flex flex-col justify-end md:col-span-4">
          <h3 className="font-display text-[clamp(2.6rem,4.6vw,4.4rem)] uppercase leading-[.9]">Ο πάγκος είναι δικός του</h3>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ivory/80">Από το 1980 κόβει ο ίδιος, στον ξύλινο πάγκο, και σου λέει ποιο κομμάτι θέλει η κάθε δουλειά. Τα λουκάνικα και το κοκορέτσι γίνονται στο εργαστήριο πίσω από τη βιτρίνα. Οι παραγγελίες των γιορτών γράφονται με το χέρι.</p>
        </div>
      </div>
    </section>
  )
}
