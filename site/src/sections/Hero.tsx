/**
 * Η Κοπή. The hero is the generated cleaver film (Veo 3.1, Google Flow) cut into twelve vertical
 * strips. The strip mechanics come from 21st.dev "Parallax Strip Slider" by hyperiux
 * (https://21st.dev/@hyperiux/components/parallax-strip-slider): each strip is an overflow-hidden
 * column holding the full-width picture pulled back by its offset. Changed: the picture is a frame
 * sequence scrubbed by scroll (the cleaver lifts and lands as you scroll), and when the blade lands
 * the strips fall away at staggered speeds, like cuts sliding off the block, to reveal the page.
 * Phones: the film plays as a loop, strips wipe in on load, normal scroll.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Btn from '@/components/Btn'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'

gsap.registerPlugin(ScrollTrigger)

const STRIPS = 12
const FRAMES = 95
const frame = (i: number) => `/media/frames/f_${String(i + 1).padStart(4, '0')}.webp`
const LAND = 0.62
const CUT = 14
const tcut = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - tcut + 0.4}%, 0 ${50 + tcut + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + tcut}%, 100% ${50 - tcut}%, 100% 100%, 0 100%)`

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const strips = useRef<(HTMLDivElement | null)[]>([])
  const imgs = useRef<(HTMLImageElement | null)[]>([])
  const title = useRef<HTMLHeadingElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const cta = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const halfA = useRef<HTMLDivElement>(null)
  const halfB = useRef<HTMLDivElement>(null)
  const halfImgs = useRef<(HTMLImageElement | null)[]>([])
  const stripsWrap = useRef<HTMLDivElement>(null)
  const [phone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (phone) return
    let i = 0
    const load = () => {
      for (let k = 0; k < 10 && i < FRAMES; k++, i++) { const im = new Image(); im.src = frame(i) }
      if (i < FRAMES) setTimeout(load, 80)
    }
    load()
  }, [phone])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const s = strips.current.filter(Boolean)
      if (reduced) { gsap.set(s, { clipPath: 'inset(0 0 0 0)' }); return }
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      if (s.length) tl.fromTo(s, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, stagger: { each: 0.05, from: 'random' } }, 0.1)
      tl.fromTo(title.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 0.5)
      tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.9)
      tl.fromTo([sub.current, cta.current], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1)
    }, section)
    return () => ctx.revert()
  }, [reduced])

  useEffect(() => {
    if (phone || reduced) return
    const ctx = gsap.context(() => {
      let last = -1
      const draw = (p: number) => {
        const idx = Math.min(FRAMES - 1, Math.floor(gsap.utils.clamp(0, 1, p / LAND) * (FRAMES - 1)))
        if (idx === last) return
        last = idx
        const src = frame(idx)
        for (const im of imgs.current) if (im) im.src = src
        for (const im of halfImgs.current) if (im) im.src = src
      }
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.4, onUpdate: (st) => draw(st.progress) } })
      tl.to(title.current, { yPercent: -30, opacity: 0, ease: 'none', duration: 0.25 }, 0.05)
      tl.to([sub.current, cta.current, line.current], { opacity: 0, ease: 'none', duration: 0.12 }, 0.02)
      tl.set(stripsWrap.current, { autoAlpha: 0 }, LAND)
      tl.set([halfA.current, halfB.current], { autoAlpha: 1 }, LAND)
      tl.to(halfA.current, { xPercent: -16, yPercent: -40, ease: 'power3.in', duration: 1 - LAND }, LAND)
      tl.to(halfB.current, { xPercent: 16, yPercent: 40, ease: 'power3.in', duration: 1 - LAND }, LAND)
      tl.to(stage.current, { backgroundColor: '#EFEAE0', ease: 'none', duration: 1 - LAND }, LAND)
    }, section)
    return () => ctx.revert()
  }, [phone, reduced])

  const go = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('paraggelia')
    const l = getLenis()
    if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  const w = 100 / STRIPS

  return (
    <section ref={section} id="hero" data-theme="dark" className="relative w-full" style={{ height: phone ? '100svh' : '300vh' }} aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink text-ivory">
        {phone ? (
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/cleaver.mp4" poster="/media/cleaver-poster.jpg" autoPlay muted loop playsInline preload="auto" />
        ) : (
          <div ref={stripsWrap} className="absolute inset-0">
            {Array.from({ length: STRIPS }, (_, i) => (
              <div key={i} ref={(el) => { strips.current[i] = el }} className="absolute inset-y-0 overflow-hidden will-change-transform" style={{ left: `${i * w}%`, width: `${w}%`, marginLeft: i ? '-0.5px' : 0, paddingLeft: i ? '0.5px' : 0 }}>
                <div className="absolute inset-y-0" style={{ left: `-${i * 100}%`, width: `${STRIPS * 100}%` }}>
                  <img ref={(el) => { imgs.current[i] = el }} src={frame(0)} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!phone && (
          <>
            <div ref={halfA} className="absolute inset-0 overflow-hidden will-change-transform" style={{ clipPath: CLIP_A, visibility: 'hidden' }}>
              <img ref={(el) => { halfImgs.current[0] = el }} src={frame(0)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div ref={halfB} className="absolute inset-0 overflow-hidden will-change-transform" style={{ clipPath: CLIP_B, visibility: 'hidden' }}>
              <img ref={(el) => { halfImgs.current[1] = el }} src={frame(0)} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </>
        )}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

        <div className="absolute inset-x-5 bottom-8 z-10 md:inset-x-8 md:bottom-10">
          <h1 ref={title} className="font-display text-[26vw] uppercase leading-[.82] md:text-[17vw]">Το Τραμ</h1>
          <div ref={line} className="mt-2 h-[3px] w-full origin-left bg-red" />
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p ref={sub} className="max-w-[34ch] text-lg leading-snug text-ivory/90 md:text-xl">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1980. Κόβουμε μπροστά σου, την ώρα που το ζητάς.</p>
            <div ref={cta} className="flex flex-col gap-3 sm:flex-row">
              <Btn href="#paraggelia" onClick={go}>Παραγγελία</Btn>
              <Btn href={SHOP.phoneHref} variant="ivory">{SHOP.phone}</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
