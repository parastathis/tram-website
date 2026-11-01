/**
 * Η Κοπή. The hero is the generated cleaver film (Veo 3.1, Google Flow), played once, not scrubbed.
 * Entry: twelve ink strips wipe off the film (strip mechanics from 21st.dev "Parallax Strip Slider"
 * by hyperiux, https://21st.dev/@hyperiux/components/parallax-strip-slider). When the blade lands
 * (the film ends) the last frame is cut on the cleaver's diagonal, the two halves slide away, and
 * out of the cut comes the shop's own tram, riding its rail across the ivory ground; then the ink
 * title lands and the page scrolls on. Reduced motion: the still, the title, no film.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Btn from '@/components/Btn'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'

const STRIPS = 12
const LAST = '/media/frames/f_0095.webp'
const CUT = 14
const tcut = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - tcut + 0.4}%, 0 ${50 + tcut + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + tcut}%, 100% ${50 - tcut}%, 100% 100%, 0 100%)`

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const strips = useRef<(HTMLDivElement | null)[]>([])
  const title = useRef<HTMLHeadingElement>(null)
  const sub = useRef<HTMLParagraphElement>(null)
  const cta = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)
  const halfA = useRef<HTMLDivElement>(null)
  const halfB = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const tram = useRef<HTMLImageElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const [cut, setCut] = useState(false)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  // entry: strips off the film, ivory title on the dark film
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const s = strips.current.filter(Boolean)
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true })
      tl.to(s, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: { each: 0.05, from: 'random' } }, 0.1)
      tl.fromTo(title.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 0.5)
      tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.9)
      tl.fromTo([sub.current, cta.current], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1)
      const start = () => { tl.play(); video.current?.play().catch(() => {}) }
      if (sessionStorage.getItem('tram-seen')) start()
      else window.addEventListener('tram:enter', start, { once: true })
      return () => window.removeEventListener('tram:enter', start)
    }, section)
    return () => ctx.revert()
  }, [reduced])

  // the cut: when the blade lands, split, slide, and the tram rides out of the gap
  const onEnded = () => {
    if (reduced || cut) return
    setCut(true)
    const ctx = gsap.context(() => {
      const W = stage.current?.offsetWidth ?? 1440
      const tw = tram.current?.offsetWidth ?? 200
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      tl.set([halfA.current, halfB.current], { autoAlpha: 1 })
      tl.set(video.current, { autoAlpha: 0 })
      tl.to([title.current, sub.current, cta.current, line.current], { opacity: 0, duration: 0.3, ease: 'none' }, 0)
      tl.to(shade.current, { opacity: 0, duration: 0.4, ease: 'none' }, 0)
      tl.to(stage.current, { backgroundColor: '#EFEAE0', duration: 0.9, ease: 'none' }, 0.1)
      tl.to(halfA.current, { xPercent: -18, yPercent: -62, duration: 1.3 }, 0.1)
      tl.to(halfB.current, { xPercent: 18, yPercent: 62, duration: 1.3 }, 0.1)
      tl.fromTo(rail.current, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.4)
      tl.fromTo(tram.current, { x: -tw - 60, autoAlpha: 1 }, { x: W * 0.72 - tw * 0.5, duration: 2.6, ease: 'power2.out' }, 0.55)
      tl.to(tram.current, { y: '+=2', yoyo: true, repeat: 7, duration: 0.18, ease: 'sine.inOut' }, 0.55)
      tl.to(rail.current, { scaleX: 0.46, transformOrigin: '100% 50%', duration: 1.2, ease: 'expo.inOut' }, 2.2)
      tl.set([title.current, sub.current, cta.current, line.current], { color: '#0E0C0D' }, 1.4)
      tl.fromTo(title.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, 1.5)
      tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 1.8)
      tl.fromTo([sub.current, cta.current], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'expo.out' }, 1.9)
      tl.fromTo(hint.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.6)
      tl.add(() => { if (section.current) { section.current.dataset.theme = 'light'; window.dispatchEvent(new CustomEvent('tram:theme', { detail: { dark: false } })) } }, 1.2)
    }, section)
    return () => ctx.revert()
  }

  const go = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('paraggelia')
    const l = getLenis()
    if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  const w = 100 / STRIPS
  const light = cut || reduced

  return (
    <section ref={section} id="hero" data-theme={reduced ? 'light' : 'dark'} className="relative h-[100svh] w-full" aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div ref={stage} className={`relative h-full w-full overflow-hidden ${reduced ? 'bg-ivory text-ink' : 'bg-ink text-ivory'}`}>
        {reduced ? (
          <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        ) : (
          <video ref={video} className="absolute inset-0 h-full w-full object-cover" src="/media/cleaver.mp4" poster="/media/cleaver-poster.jpg" muted playsInline preload="auto" onEnded={onEnded} />
        )}
        {!reduced && (
          <>
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
            {/* the rail along the cut and the tram that rides it */}
            <div className="pointer-events-none absolute inset-0" style={{ transform: `rotate(-${CUT}deg)`, transformOrigin: '50% 50%' }}>
              <div className="absolute left-[-20%] right-[-20%] top-1/2">
                <div ref={rail} className="h-[2px] w-full origin-left bg-ink" style={{ transform: 'scaleX(0)' }} />
                <img ref={tram} src="/media/tram-mark.png" alt="" className="absolute bottom-[1px] left-[20%] h-[15vh] w-auto max-h-[140px] opacity-0 md:h-[20vh] md:max-h-[190px]" />
              </div>
            </div>
            <div ref={shade} aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
          </>
        )}

        <div className="absolute inset-x-5 bottom-8 z-10 md:inset-x-8 md:bottom-10">
          <h1 ref={title} className="font-display text-[26vw] uppercase leading-[.82] md:text-[17vw]">Το Τραμ</h1>
          <div ref={line} className="mt-2 h-[3px] w-full origin-left bg-red" />
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p ref={sub} className="max-w-[34ch] text-lg leading-snug opacity-90 md:text-xl">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1980. Κόβουμε μπροστά σου, την ώρα που το ζητάς.</p>
            <div ref={cta} className="flex flex-col gap-3 sm:flex-row">
              <Btn href="#paraggelia" onClick={go}>Παραγγελία</Btn>
              <Btn href={SHOP.phoneHref} variant={light ? 'ghost' : 'ivory'}>{SHOP.phone}</Btn>
            </div>
          </div>
        </div>
        <div ref={hint} className="pointer-events-none absolute right-5 top-24 z-10 font-mono text-[11px] uppercase tracking-[.2em] opacity-0 md:right-8" style={{ color: '#0E0C0D' }}>Κύλησε</div>
      </div>
    </section>
  )
}
