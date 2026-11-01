/**
 * Η Κοπή. The hero is the generated cleaver film (Veo 3.1, Google Flow), played through once on
 * entry and held on the landed blade. Entry: twelve ink strips wipe off the film (strip mechanics
 * from 21st.dev "Parallax Strip Slider" by hyperiux,
 * https://21st.dev/@hyperiux/components/parallax-strip-slider). Then scroll drives the rest: the
 * last frame is cut on the cleaver's diagonal and the halves slide away; out of the gap comes the
 * shop's tram (generated film, Veo 3.1 from the head-on Nano Banana picture, scrubbed frame by
 * frame so it follows the hand), it drives straight at you until its headlamp fills the screen,
 * crashes into the glass (shake and flash), and behind the flash stands the hub: four doors into
 * the site, the way a chain lets you pick a store. Reduced motion: the still, the title, the hub.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Btn from '@/components/Btn'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'
import { cn } from '@/lib/cn'

gsap.registerPlugin(ScrollTrigger)

const STRIPS = 12
const LAST = '/media/frames/f_0095.webp'
const TFRAMES = 95
const tframe = (i: number) => `/media/tram-frames/t_${String(i + 1).padStart(4, '0')}.webp`
const CUT = 14
const tcut = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - tcut + 0.4}%, 0 ${50 + tcut + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + tcut}%, 100% ${50 - tcut}%, 100% 100%, 0 100%)`

const DOORS = [
  { n: '01', label: 'Τα κρέατα', sub: 'Μοσχάρι, αρνί, χοιρινό, λουκάνικα', href: '#kreata', src: '/media/gen/ribs.webp' },
  { n: '02', label: 'Το μαγαζί', sub: 'Σπάρτης & Σαλαμίνος, από το 1980', href: '#magazi', src: '/media/gen/shop-front.webp' },
  { n: '03', label: 'Ο Ιπποκράτης', sub: 'Κόβει μπροστά σου', href: '#ippokratis', src: '/media/gen/ippokratis-studio-wide.webp' },
  { n: '04', label: 'Παραγγελία', sub: 'Τηλέφωνο ή WhatsApp, έτοιμο στην ώρα του', href: '#paraggelia', src: '/media/gen/case.webp' },
]

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
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
  const tram = useRef<HTMLCanvasElement>(null)
  const frames = useRef<(ImageBitmap | HTMLImageElement | null)[]>([])
  const flash = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const doors = useRef<(HTMLAnchorElement | null)[]>([])
  const hubHead = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [phone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)
  const tramV = useRef<HTMLVideoElement>(null)
  const played = useRef(false)

  // decode the tram frames up front (bitmaps, so a scrub is a blit, not a decode); desktop only
  useEffect(() => {
    if (reduced || phone) return
    let alive = true
    const one = async (i: number) => {
      try {
        const r = await fetch(tframe(i))
        const b = await r.blob()
        const bm = 'createImageBitmap' in window ? await createImageBitmap(b) : await new Promise<HTMLImageElement>((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(b) })
        if (alive) frames.current[i] = bm
      } catch { /* a missing frame falls back to the nearest one */ }
    }
    const run = async () => {
      // first and last frames first, then the rest in order, three at a time
      await Promise.all([one(0), one(TFRAMES - 1)])
      for (let i = 1; i < TFRAMES - 1 && alive; i += 3) await Promise.all([one(i), one(i + 1), one(i + 2)].filter(Boolean))
    }
    // wait for the film to be playing before pulling 2 MB of frames, so the film never starves
    let t = 0
    const start = () => { t = window.setTimeout(run, 1200) }
    if (sessionStorage.getItem('tram-seen')) start()
    else window.addEventListener('tram:enter', start, { once: true })
    return () => { alive = false; window.clearTimeout(t); window.removeEventListener('tram:enter', start) }
  }, [reduced, phone])

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
      const start = () => { tl.play(); if (video.current) { video.current.playbackRate = phone ? 1.35 : 1; video.current.play().catch(() => {}) } }
      if (sessionStorage.getItem('tram-seen')) start()
      else window.addEventListener('tram:enter', start, { once: true })
      return () => window.removeEventListener('tram:enter', start)
    }, section)
    return () => ctx.revert()
  }, [reduced, phone])

  // phone: the sequence plays itself, a tap skips ahead. Film ends, cut, the tram film at double
  // speed, crash, hub. No scrub: touch scroll stays native and the page continues below.
  const playCut = () => {
    if (played.current || reduced || !phone) return
    played.current = true
    const v = video.current, t = tramV.current
    v?.pause()
    const tl = gsap.timeline()
    tl.to([copy.current, hint.current], { opacity: 0, duration: 0.25, ease: 'none' }, 0)
    tl.set([halfA.current, halfB.current], { autoAlpha: 1 }, 0)
    tl.set(v, { autoAlpha: 0 }, 0)
    tl.set(t, { autoAlpha: 1, onComplete: () => { if (t) { t.currentTime = 0; t.playbackRate = 2; t.play().catch(() => {}) } } }, 0.05)
    tl.to(shade.current, { opacity: 0, duration: 0.4, ease: 'none' }, 0)
    tl.to(halfA.current, { xPercent: -24, yPercent: -80, duration: 1.1, ease: 'power2.in' }, 0.05)
    tl.to(halfB.current, { xPercent: 24, yPercent: 80, duration: 1.1, ease: 'power2.in' }, 0.05)
    // the crash lands when the lamp fills the frame (8 s film at 2x, minus a beat)
    tl.to(stage.current, { x: 0, y: 0, duration: 0.5, ease: 'none', onUpdate() { const k = 1 - Math.abs(this.progress() - 0.5) * 2; gsap.set(stage.current, { x: (Math.random() - 0.5) * 18 * k, y: (Math.random() - 0.5) * 14 * k }) }, onComplete: () => gsap.set(stage.current, { x: 0, y: 0 }) }, 3.5)
    tl.fromTo(flash.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power3.in' }, 3.45)
    tl.set(hub.current, { autoAlpha: 1 }, 3.8)
    tl.set(t, { autoAlpha: 0, onComplete: () => t?.pause() }, 3.85)
    tl.fromTo(doors.current.filter(Boolean), { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 3.85)
    tl.to(flash.current, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 3.95)
    tl.fromTo(hubHead.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 4.5)
  }

  // scroll: the cut, the tram ride, the crash, the hub (desktop; the phone plays it)
  useEffect(() => {
    if (reduced || phone) return
    const ctx = gsap.context(() => {
      let last = -1
      const fit = () => {
        const c = tram.current; if (!c) return
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr)
        last = -1
      }
      const draw = (p: number) => {
        const c = tram.current; if (!c) return
        let idx = Math.min(TFRAMES - 1, Math.max(0, Math.round(p * (TFRAMES - 1))))
        while (idx > 0 && !frames.current[idx]) idx--
        const f = frames.current[idx]
        if (!f || idx === last) return
        last = idx
        const ctx2 = c.getContext('2d'); if (!ctx2) return
        const fw = 'width' in f ? f.width : 1280, fh = 'height' in f ? f.height : 720
        const s = Math.max(c.width / fw, c.height / fh)
        const dw = fw * s, dh = fh * s
        ctx2.drawImage(f, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh)
      }
      fit()
      window.addEventListener('resize', fit)
      const ride = { p: 0 }
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.9, invalidateOnRefresh: true, onRefresh: fit } })
      tl.to(copy.current, { opacity: 0, ease: 'none', duration: 0.08 }, 0)
      tl.to(hint.current, { opacity: 0, ease: 'none', duration: 0.04 }, 0)
      tl.set([halfA.current, halfB.current], { autoAlpha: 1 }, 0.04)
      tl.set(video.current, { autoAlpha: 0 }, 0.04)
      tl.to(shade.current, { opacity: 0, ease: 'none', duration: 0.1 }, 0.04)
      tl.to(halfA.current, { xPercent: -24, yPercent: -80, ease: 'power2.in', duration: 0.3 }, 0.04)
      tl.to(halfB.current, { xPercent: 24, yPercent: 80, ease: 'power2.in', duration: 0.3 }, 0.04)
      // the ride: frame by frame, with the hand
      tl.to(ride, { p: 1, ease: 'none', duration: 0.56, onUpdate: () => draw(ride.p) }, 0.06)
      tl.set(tram.current, { autoAlpha: 1, onComplete: () => draw(0) }, 0.04)
      // the crash: shake and flash
      tl.to(stage.current, { x: 0, y: 0, duration: 0.08, ease: 'none', onUpdate() { const k = 1 - Math.abs(this.progress() - 0.5) * 2; gsap.set(stage.current, { x: (Math.random() - 0.5) * 22 * k, y: (Math.random() - 0.5) * 16 * k }) }, onComplete: () => gsap.set(stage.current, { x: 0, y: 0 }) }, 0.6)
      tl.fromTo(flash.current, { opacity: 0 }, { opacity: 1, ease: 'power3.in', duration: 0.06 }, 0.58)
      tl.set(tram.current, { autoAlpha: 0 }, 0.64)
      // the hub rises behind the flash
      tl.set(hub.current, { autoAlpha: 1 }, 0.62)
      tl.fromTo(doors.current.filter(Boolean), { yPercent: 100 }, { yPercent: 0, ease: 'power3.out', duration: 0.22, stagger: 0.035 }, 0.64)
      tl.to(flash.current, { opacity: 0, ease: 'power2.out', duration: 0.18 }, 0.66)
      tl.fromTo(hubHead.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.14 }, 0.78)
      return () => window.removeEventListener('resize', fit)
    }, section)
    return () => ctx.revert()
  }, [reduced, phone])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.querySelector<HTMLElement>(href)
    const l = getLenis()
    if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
  }
  const w = 100 / STRIPS

  return (
    <section ref={section} id="hero" data-theme="dark" className="relative w-full" style={{ height: reduced || phone ? 'auto' : '340vh' }} aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div ref={stage} onClick={phone ? playCut : undefined} className={cn('top-0 w-full overflow-hidden bg-ink text-ivory', reduced ? 'relative' : phone ? 'relative h-[100svh]' : 'sticky h-[100svh]')}>
        {reduced ? (
          <div className="relative h-[70svh]">
            <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-x-5 bottom-8 md:inset-x-8">
              <h1 className="font-display text-[22vw] uppercase leading-[.82] md:text-[13vw]">Το Τραμ</h1>
            </div>
          </div>
        ) : (
          <>
            <video ref={video} className="absolute inset-0 h-full w-full object-cover" src="/media/cleaver.mp4" poster="/media/cleaver-poster.jpg" muted playsInline preload="auto" onEnded={phone ? playCut : undefined} />
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: STRIPS }, (_, i) => (
                <div key={i} ref={(el) => { strips.current[i] = el }} className="absolute inset-y-0 bg-ink" style={{ left: `${i * w}%`, width: `${w + 0.1}%`, clipPath: 'inset(0 0 0 0)' }} />
              ))}
            </div>
            {/* the tram ride, under the halves */}
            {phone ? (
              <video ref={tramV} className="absolute inset-0 h-full w-full object-cover opacity-0" src="/media/tram-approach.mp4" muted playsInline preload="auto" aria-label="Το τραμ της γραμμής 41 έρχεται καταπάνω σου" />
            ) : (
              <canvas ref={tram} aria-label="Το τραμ της γραμμής 41 έρχεται καταπάνω σου" role="img" className="absolute inset-0 h-full w-full opacity-0" />
            )}
            <div ref={halfA} className="absolute inset-0 will-change-transform" style={{ clipPath: CLIP_A, visibility: 'hidden' }}>
              <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div ref={halfB} className="absolute inset-0 will-change-transform" style={{ clipPath: CLIP_B, visibility: 'hidden' }}>
              <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div ref={shade} aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />

            <div ref={copy} className="absolute inset-x-5 bottom-8 z-10 md:inset-x-8 md:bottom-10">
              <h1 ref={title} className="font-display text-[26vw] uppercase leading-[.82] md:text-[17vw]">Το Τραμ</h1>
              <div ref={line} className="mt-2 h-[3px] w-full origin-left bg-red" />
              <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <p ref={sub} className="max-w-[34ch] text-lg leading-snug text-ivory/90 md:text-xl">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1980. Κόβουμε μπροστά σου, την ώρα που το ζητάς.</p>
                <div ref={cta} className="flex flex-col gap-3 sm:flex-row">
                  <Btn href="#paraggelia" onClick={go('#paraggelia')}>Παραγγελία</Btn>
                  <Btn href={SHOP.phoneHref} variant="ivory">{SHOP.phone}</Btn>
                </div>
              </div>
            </div>
            <div ref={hint} className="pointer-events-none absolute right-5 top-24 z-10 font-mono text-[11px] uppercase tracking-[.2em] text-ivory/70 opacity-0 md:right-8">{phone ? 'Πάτα για την κοπή' : 'Κύλησε για την κοπή'}</div>
          </>
        )}

        {/* the hub: four doors into the site */}
        <div ref={hub} className={cn('absolute inset-0 z-20 flex flex-col bg-ink', !reduced && 'invisible')}>
          <div ref={hubHead} className="flex items-end justify-between px-5 pb-3 pt-20 md:px-8 md:pt-24">
            <p className="font-mono text-[12px] text-ivory/70">Τέρμα. Διάλεξε πού πας.</p>
            <p className="hidden font-mono text-[12px] text-ivory/70 md:block">{SHOP.address} · Πειραιάς</p>
          </div>
          <nav aria-label="Είσοδοι" className="grid flex-1 grid-cols-2 gap-[2px] overflow-hidden px-[2px] pb-[2px] md:grid-cols-4">
            {DOORS.map((d, i) => (
              <a key={d.href} ref={(el) => { doors.current[i] = el }} href={d.href} onClick={go(d.href)} className="group relative block overflow-hidden bg-ink-2/20 no-underline">
                <img src={d.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute left-4 top-4 font-mono text-[12px] text-ivory/80">{d.n}</span>
                <span className="absolute right-4 top-4 h-2 w-2 bg-red opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-6">
                  <span className="block font-display text-[clamp(1.9rem,5.2vw,4.4rem)] uppercase leading-[.9] text-ivory">{d.label}</span>
                  <span className="mt-2 block max-w-[26ch] font-mono text-[11px] text-ivory/70 opacity-0 transition duration-500 group-hover:opacity-100">{d.sub}</span>
                </div>
              </a>
            ))}
          </nav>
        </div>
        {/* the flash of the crash, above everything */}
        {!reduced && <div ref={flash} className="pointer-events-none absolute inset-0 z-30 opacity-0" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF3D6 0%, #F2D9A6 45%, #EFEAE0 100%)' }} />}
      </div>
    </section>
  )
}
