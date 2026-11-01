/**
 * Ο Ιπποκράτης. His own chapter, built from his real photos (the Drive set, IMG_5826 to 5829: him
 * with the cleaver and the knife, and IMG_5825 at the block). A black stage, his name in giant type
 * behind him (the figure is cut out so the letters pass behind his shoulders), and the four knife
 * shots run as a stop-motion loop: the blades and his stance shift frame to frame, the way a
 * flip-book moves. Motion: name letters rise (SplitText), the figure reveals through a vertical
 * slit, the block photo below opens on scroll and slowly pushes in.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { SHOP } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger, SplitText)

const FRAMES = ['/media/ippo-5827.webp', '/media/ippo-5828.webp', '/media/ippo-5829.webp']
const ORDER = [2, 1, 0, 1]

export default function Butcher() {
  const section = useRef<HTMLElement>(null)
  const name = useRef<HTMLHeadingElement>(null)
  const figure = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLParagraphElement>(null)
  const block = useRef<HTMLDivElement>(null)
  const blockImg = useRef<HTMLImageElement>(null)
  const [frame, setFrame] = useState(2)
  const inView = useInView(section, { amount: 0.3 })
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const yName = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])
  const yFig = useTransform(scrollYProgress, [0, 1], ['3%', '-3%'])

  // stop-motion: step through the four knife shots while the chapter is on screen
  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let i = 0
    const id = window.setInterval(() => { i = (i + 1) % ORDER.length; setFrame(ORDER[i]) }, 520)
    return () => window.clearInterval(id)
  }, [inView])

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      if (reduced) return
      const split = new SplitText(name.current, { type: 'chars', mask: 'chars' })
      gsap.from(split.chars, { yPercent: 110, stagger: 0.035, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: section.current, start: 'top 60%', toggleActions: 'play none none none' } })
      gsap.fromTo(figure.current, { clipPath: 'inset(0 49.5% 0 49.5%)' }, { clipPath: 'inset(0 0% 0 0%)', duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: section.current, start: 'top 55%', toggleActions: 'play none none none' } })
      gsap.from(line.current, { y: 20, opacity: 0, duration: 0.8, delay: 0.9, scrollTrigger: { trigger: section.current, start: 'top 55%', toggleActions: 'play none none none' } })
      gsap.fromTo(block.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: block.current, start: 'top 80%', toggleActions: 'play none none none' } })
      gsap.fromTo(blockImg.current, { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: block.current, start: 'top bottom', end: 'bottom top', scrub: true } })
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
        <motion.div ref={figure} style={{ y: yFig }} className="relative z-10">
          <div className="relative aspect-[701/1415] h-[66svh] md:h-[78svh]">
            {FRAMES.map((src, i) => (
              <img key={src} src={src} alt={i === 2 ?`${SHOP.owner}, ο κρεοπώλης του Τραμ, με τον μπαλτά και το μαχαίρι` : ''} className="absolute inset-0 h-full w-full object-contain object-bottom" style={{ opacity: frame === i ? 1 : 0 }} loading="lazy" draggable={false} />
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink to-transparent" />
        </motion.div>
        <p ref={line} className="absolute bottom-10 left-5 z-20 max-w-[30ch] font-mono text-[12px] text-ivory/80 md:left-8">{last} · κρεοπώλης · Σπάρτης & Σαλαμίνος, από το 1980</p>
        <p className="absolute bottom-10 right-5 z-20 hidden font-display text-2xl uppercase text-ivory md:right-8 md:block">Κόβει μπροστά σου</p>
      </div>

      {/* the block */}
      <div className="relative mx-auto grid max-w-[1600px] gap-6 px-5 pb-24 pt-10 md:grid-cols-12 md:gap-8 md:px-8 md:pb-32">
        <div ref={block} className="relative aspect-[3/4] overflow-hidden md:col-span-7 md:aspect-[4/5]">
          <img ref={blockImg} src="/media/ippokratis-block.webp" alt="Ο Ιπποκράτης στον ξύλινο πάγκο με το μπούτι" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="flex flex-col justify-end md:col-span-5">
          <h3 className="font-display text-[clamp(2.6rem,4.6vw,4.4rem)] uppercase leading-[.9]">Ο πάγκος είναι δικός του</h3>
          <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ivory/80">Από το 1980 κόβει ο ίδιος, στον ξύλινο πάγκο, και σου λέει ποιο κομμάτι θέλει η κάθε δουλειά. Τα λουκάνικα και το κοκορέτσι γίνονται στο εργαστήριο πίσω από τη βιτρίνα. Οι παραγγελίες των γιορτών γράφονται με το χέρι.</p>
          <p className="mt-8 font-mono text-[12px] text-ivory/60">Σπάρτης & Σαλαμίνος 124-126, Κοπή · {SHOP.phone}</p>
        </div>
      </div>
    </section>
  )
}
