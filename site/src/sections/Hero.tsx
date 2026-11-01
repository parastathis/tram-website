/**
 * Η Κοπή. The hero is the generated cleaver film (Veo 3.1, Google Flow), played through once on
 * entry and held on the landed blade. Entry: twelve ink strips wipe off the film (strip mechanics
 * from 21st.dev "Parallax Strip Slider" by hyperiux,
 * https://21st.dev/@hyperiux/components/parallax-strip-slider). Then scroll drives the rest: the
 * last frame is cut on the cleaver's diagonal and the halves slide away; out of the gap the shop's
 * tram (generated head-on, Nano Banana) grows towards you until it fills the screen; its headlamp
 * burns through and the page opens out of the lamp onto the first chapter. Reduced motion: the
 * still and the title, no film and no ride.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Btn from '@/components/Btn'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'

gsap.registerPlugin(ScrollTrigger)

const STRIPS = 12
const LAST = '/media/frames/f_0095.webp'
const TRAM = '/media/gen/tram-front.webp'
const TRAM_W = 896, TRAM_H = 1200
const LAMP = { x: 0.501, y: 0.602 } // the headlamp inside the tram picture
const CUT = 14
const tcut = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - tcut + 0.4}%, 0 ${50 + tcut + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + tcut}%, 100% ${50 - tcut}%, 100% 100%, 0 100%)`

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const cover = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const strips = useRef<(HTMLDivElement | null)[]>([])
  const title = useRef<HTMLHeadingElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const cta = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const halfA = useRef<HTMLDivElement>(null)
  const halfB = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const tram = useRef<HTMLImageElement>(null)
  const glow = useRef<HTMLDivElement>(null)
  const peek = useRef<HTMLDivElement>(null)
  const peekImg = useRef<HTMLImageElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // entry: strips off the film, the film plays through once and holds the landed blade
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const s = strips.current.filter(Boolean)
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true })
      tl.to(s, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: { each: 0.05, from: 'random' } }, 0.1)
      tl.fromTo(title.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 0.5)
      tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.9)
      tl.fromTo([sub.current, cta.current], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1)
      tl.fromTo(hint.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.2)
      const start = () => { tl.play(); video.current?.play().catch(() => {}) }
      if (sessionStorage.getItem('tram-seen')) start()
      else window.addEventListener('tram:enter', start, { once: true })
      return () => window.removeEventListener('tram:enter', start)
    }, section)
    return () => ctx.revert()
  }, [reduced])

  // scroll: the cut, the tram rising out of it, the page opening out of the headlamp
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const vw = () => stage.current?.offsetWidth ?? 1440
      const vh = () => stage.current?.offsetHeight ?? 900
      // tram picture box is 100svh tall; it is shifted so the lamp sits at the stage centre
      const boxW = () => (vh() * TRAM_W) / TRAM_H
      const full = () => Math.max(vw() / boxW(), 1) * 1.12 // covers the width, bumper to roof off-screen
      const setHole = (r: number) => { cover.current?.style.setProperty('--hole', `${r}px`) }
      setHole(0)
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true } })
      tl.to(copy.current, { opacity: 0, ease: 'none', duration: 0.1 }, 0)
      tl.to(hint.current, { opacity: 0, ease: 'none', duration: 0.05 }, 0)
      tl.set([halfA.current, halfB.current], { autoAlpha: 1 }, 0.06)
      tl.set(video.current, { autoAlpha: 0 }, 0.06)
      tl.to(shade.current, { opacity: 0, ease: 'none', duration: 0.1 }, 0.06)
      tl.to(halfA.current, { xPercent: -22, yPercent: -75, ease: 'power2.in', duration: 0.34 }, 0.06)
      tl.to(halfB.current, { xPercent: 22, yPercent: 75, ease: 'power2.in', duration: 0.34 }, 0.06)
      tl.fromTo(tram.current, { xPercent: -50, scale: 0.04, autoAlpha: 0 }, { xPercent: -50, autoAlpha: 1, ease: 'none', duration: 0.06 }, 0.1)
      tl.fromTo(tram.current, { xPercent: -50, scale: 0.04 }, { xPercent: -50, scale: () => full(), ease: 'power2.in', duration: 0.5 }, 0.1)
      tl.to(tram.current, { scale: () => full() * 2.4, ease: 'power2.in', duration: 0.3 }, 0.6)
      tl.fromTo(glow.current, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1.6, ease: 'power2.in', duration: 0.3 }, 0.58)
      tl.fromTo({ r: 0 }, { r: 0 }, { r: () => Math.hypot(vw(), vh()) * 0.62, ease: 'power2.in', duration: 0.26, onUpdate() { setHole(this.targets()[0].r) } }, 0.68)
      tl.fromTo(peekImg.current, { scale: 1.25 }, { scale: 1, ease: 'none', duration: 0.4 }, 0.6)
      tl.to(peek.current, { autoAlpha: 1, ease: 'none', duration: 0.01 }, 0.6)
      tl.to(cover.current, { autoAlpha: 0, ease: 'none', duration: 0.04 }, 0.95)
    }, section)
    return () => ctx.revert()
  }, [reduced])

  const go = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('paraggelia')
    const l = getLenis()
    if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  const w = 100 / STRIPS

  return (
    <section ref={section} id="hero" data-theme="dark" className="relative w-full" style={{ height: reduced ? '100svh' : '420vh' }} aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div ref={stage} className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink text-ivory">
        {/* what the headlamp opens onto: the first chapter */}
        {!reduced && (
          <div ref={peek} className="absolute inset-0 invisible">
            <img ref={peekImg} src="/media/gen/ribs.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
            <div className="absolute inset-x-5 bottom-10 md:inset-x-8">
              <p className="font-mono text-[12px] text-ivory/80">01 · Τα κρέατα</p>
              <p className="mt-2 font-display text-[clamp(3rem,9vw,8rem)] uppercase leading-[.85]">Μοσχάρι</p>
            </div>
          </div>
        )}

        {/* the cover: film, cut, tram; a hole opens in it from the headlamp */}
        <div ref={cover} className="absolute inset-0 bg-ink" style={{ ['--hole' as string]: '0px', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))', maskImage: 'radial-gradient(circle at 50% 50%, transparent var(--hole), #000 calc(var(--hole) + 1px))' }}>
          {reduced ? (
            <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <video ref={video} className="absolute inset-0 h-full w-full object-cover" src="/media/cleaver.mp4" poster="/media/cleaver-poster.jpg" muted playsInline preload="auto" />
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: STRIPS }, (_, i) => (
                  <div key={i} ref={(el) => { strips.current[i] = el }} className="absolute inset-y-0 bg-ink" style={{ left: `${i * w}%`, width: `${w + 0.1}%`, clipPath: 'inset(0 0 0 0)' }} />
                ))}
              </div>
              <div ref={halfA} className="absolute inset-0 will-change-transform" style={{ clipPath: CLIP_A, visibility: 'hidden' }}>
                <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div ref={halfB} className="absolute inset-0 will-change-transform" style={{ clipPath: CLIP_B, visibility: 'hidden' }}>
                <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
              {/* the tram: box 100svh tall, lamp pinned to the stage centre, grows from the cut */}
              <img ref={tram} src={TRAM} alt="Το τραμ της γραμμής 41 έρχεται καταπάνω σου" className="pointer-events-none absolute left-1/2 h-[100svh] w-auto max-w-none opacity-0 will-change-transform" style={{ WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 52%, #000 70%, transparent 100%)', maskImage: 'radial-gradient(ellipse 50% 50% at 50% 52%, #000 70%, transparent 100%)', top: `${(0.5 - LAMP.y) * 100}svh`, transformOrigin: `${LAMP.x * 100}% ${LAMP.y * 100}%`, marginLeft: `calc(-100svh * ${TRAM_W / TRAM_H} * ${LAMP.x - 0.5})` }} />
              <div ref={glow} className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0" style={{ background: 'radial-gradient(circle, rgba(255,232,190,.95) 0%, rgba(255,214,150,.55) 22%, rgba(122,31,39,0) 62%)' }} />
              <div ref={shade} aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
            </>
          )}

          <div ref={copy} className="absolute inset-x-5 bottom-8 z-10 md:inset-x-8 md:bottom-10">
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
          <div ref={hint} className="pointer-events-none absolute right-5 top-24 z-10 font-mono text-[11px] uppercase tracking-[.2em] text-ivory/70 opacity-0 md:right-8">Κύλησε για την κοπή</div>
        </div>
      </div>
    </section>
  )
}
