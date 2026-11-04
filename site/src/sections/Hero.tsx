/**
 * Η Κοπή. The hero is the generated cleaver film (Veo 3.1, Google Flow), played through once on
 * entry and held on the landed blade. Entry: twelve ink strips wipe off the film (strip mechanics
 * from 21st.dev "Parallax Strip Slider" by hyperiux,
 * https://21st.dev/@hyperiux/components/parallax-strip-slider). Then scroll drives the rest: the
 * last frame is cut on the cleaver's diagonal and the halves slide away; out of the gap comes the
 * shop's tram (generated film, Veo 3.1 from the head-on Nano Banana picture, scrubbed frame by
 * frame so it follows the hand), it drives straight at you until its headlamp fills the screen,
 * crashes into the glass (shake and flash), and behind the flash hang two prints on a string: two
 * lines leave from here, Παράγγειλε τώρα and Το μαγαζί (tap selects, tap again goes). The tram
 * frames stay compressed and only the dozen around the playhead are decoded. Reduced motion: the still,
 * the title, the prints.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion } from 'motion/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Btn from '@/components/Btn'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'
import { link, ORDER_PATH } from '@/lib/route'
import LinePicker, { type Print } from '@/components/LinePicker'
import { goTo } from '@/lib/route'
import { cn } from '@/lib/cn'

gsap.registerPlugin(ScrollTrigger)

const STRIPS = 12
const LAST = '/media/frames/f_0095.webp'
const TFRAMES = 94
const tframe = (i: number) => `/media/tram-frames-hd/t_${String(i + 1).padStart(4, '0')}.webp`
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
  const copy = useRef<HTMLDivElement>(null)
  const halfA = useRef<HTMLDivElement>(null)
  const halfB = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const tram = useRef<HTMLCanvasElement>(null)
  // the tram film as compressed frames (~5 MB); only the few around the playhead are decoded
  const blobs = useRef<(Blob | null)[]>([])
  const frames = useRef<Map<number, ImageBitmap | HTMLImageElement>>(new Map())
  const decoding = useRef<Set<number>>(new Set())
  const flash = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const doors = useRef<(HTMLAnchorElement | null)[]>([])
  const [board, setBoard] = useState(false)
  const hubHead = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [phone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches)

  // fetch the tram frames once as compressed blobs; decoding happens on demand (see want())
  useEffect(() => {
    if (reduced || phone) return
    let alive = true
    const one = async (i: number) => {
      try { const r = await fetch(tframe(i)); const bl = await r.blob(); if (alive) { blobs.current[i] = bl; if (i < 26) want(i, () => {}) } } catch { /* the nearest frame stands in */ }
    }
    const run = async () => {
      await Promise.all([one(0), one(TFRAMES - 1)])
      for (let i = 1; i < TFRAMES - 1 && alive; i += 4) await Promise.all([one(i), one(i + 1), one(i + 2), one(i + 3)])
    }
    // wait for the film to be playing before pulling the frames, so the film never starves
    let t = 0
    const start = () => { t = window.setTimeout(run, 1200) }
    if (sessionStorage.getItem('tram-seen')) start()
    else window.addEventListener('tram:enter', start, { once: true })
    const cache = frames.current
    return () => { alive = false; window.clearTimeout(t); window.removeEventListener('tram:enter', start); cache.forEach((f) => { if ('close' in f) f.close() }); cache.clear() }
  }, [reduced, phone])

  /** decode frame i (scaled to the canvas) and keep at most 44 decoded, the rest stay compressed */
  const want = (i: number, redraw: () => void) => {
    const bl = blobs.current[i]
    if (!bl || frames.current.has(i) || decoding.current.has(i)) return
    decoding.current.add(i)
    const done = (f: ImageBitmap | HTMLImageElement) => {
      decoding.current.delete(i)
      const m = frames.current
      m.set(i, f)
      if (m.size > 44) { let far = -1, d = -1; m.forEach((_, k) => { const dd = Math.abs(k - i); if (dd > d) { d = dd; far = k } }); const f2 = m.get(far); if (f2 && 'close' in f2) f2.close(); m.delete(far) }
      redraw()
    }
    if ('createImageBitmap' in window) createImageBitmap(bl).then(done, () => decoding.current.delete(i))
    else { const im = new Image(); im.onload = () => done(im); im.onerror = () => decoding.current.delete(i); im.src = URL.createObjectURL(bl) }
  }

  // entry: strips off the film, the film plays through once and holds the landed blade
  useEffect(() => {
    if (reduced || phone) return
    const ctx = gsap.context(() => {
      const s = strips.current.filter(Boolean)
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, paused: true })
      tl.to(s, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: { each: 0.05, from: 'random' } }, 0.1)
      tl.fromTo(title.current, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2 }, 0.5)
      tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.9)
      tl.fromTo([sub.current, cta.current], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, 1)
      tl.fromTo(hint.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.2)
      const start = () => { tl.play(); if (video.current) { video.current.play().catch(() => {}) } }
      if (sessionStorage.getItem('tram-seen')) start()
      else window.addEventListener('tram:enter', start, { once: true })
      return () => window.removeEventListener('tram:enter', start)
    }, section)
    return () => ctx.revert()
  }, [reduced, phone])

  // scroll: the cut, the tram ride, the crash, the hub (desktop and phone alike)
  useEffect(() => {
    if (reduced || phone) return
    ScrollTrigger.config({ ignoreMobileResize: true })
    const ctx = gsap.context(() => {
      let last = -1, lastWant = 0
      const fit = () => {
        const c = tram.current; if (!c) return
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
        c.width = Math.round(c.clientWidth * dpr); c.height = Math.round(c.clientHeight * dpr)
        last = -1
      }
      const draw = (p: number) => {
        const c = tram.current; if (!c) return
        const want_ = Math.min(TFRAMES - 1, Math.max(0, Math.round(p * (TFRAMES - 1))))
        const redraw = () => { last = -1; draw(ride.p) }
        // decode ahead in the direction of travel, a little behind
        const dir = want_ >= lastWant ? 1 : -1; lastWant = want_
        for (let k = -4; k <= 22; k++) want(Math.min(TFRAMES - 1, Math.max(0, want_ + k * dir)), redraw)
        let idx = want_, best: ImageBitmap | HTMLImageElement | undefined
        for (let k = 0; k < TFRAMES && !best; k++) { best = frames.current.get(want_ - k) ?? frames.current.get(want_ + k); if (best) idx = frames.current.has(want_ - k) ? want_ - k : want_ + k }
        const f = best
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
      const tl = gsap.timeline({ scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom bottom', scrub: 0.45, invalidateOnRefresh: true, onRefresh: fit, onLeaveBack: () => { const v = video.current; if (v) { v.currentTime = 0; v.play().catch(() => {}) } } } })
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
      tl.eventCallback('onUpdate', () => setBoard(tl.progress() > 0.6))
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
  const prints = [
    { image: '/media/gen/counter-sm.webp', note: 'παράγγειλε τώρα', title: 'Παράγγειλε τώρα', caption: 'Όλος ο πάγκος με τιμές, σε δύο βήματα. Πληρώνεις όταν παραλάβεις.', cta: 'Στον πάγκο', alt: 'Ο πάγκος του καταστήματος γεμάτος κρέατα', go: () => goTo('order') },
    { image: '/media/gen/front-m.webp', note: 'το μαγαζί', title: 'Το μαγαζί', caption: 'Τα κρέατα, ο Ιπποκράτης, από το 1983 στη Σπάρτης & Σαλαμίνος.', cta: 'Μπες μέσα', alt: 'Η πρόσοψη του Τραμ', go: () => { const el = document.getElementById('kreata'); const l = getLenis(); if (el) l ? l.scrollTo(el, { duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' }) } },
  ]

  // phones: a still hero (no film, no tram) and the first scroll down lands on the two prints
  if (phone && !reduced) return <PhoneHero prints={prints} />

  const w = 100 / STRIPS

  return (
    <section ref={section} id="hero" data-theme="dark" className="relative w-full" style={{ height: reduced ? 'auto' : phone ? '300vh' : '340vh' }} aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div ref={stage} className={cn('top-0 w-full overflow-hidden bg-ink text-ivory', reduced ? 'relative' : 'sticky h-[100svh]')}>
        {reduced ? (
          <div className="relative h-[70svh]">
            <img src={LAST} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-x-5 bottom-8 md:inset-x-8">
              <h1 className="font-display text-[22vw] uppercase leading-[.82] md:text-[13vw]">Το Τραμ</h1>
            </div>
          </div>
        ) : (
          <>
            <video ref={video} className="absolute inset-0 h-full w-full object-cover" poster="/media/cleaver-poster.jpg" muted playsInline preload="auto">
              <source src="/media/cleaver-720.mp4" media="(max-width: 767px)" type="video/mp4" />
              <source src="/media/cleaver.mp4" type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length: STRIPS }, (_, i) => (
                <div key={i} ref={(el) => { strips.current[i] = el }} className="absolute inset-y-0 bg-ink" style={{ left: `${i * w}%`, width: `${w + 0.1}%`, clipPath: 'inset(0 0 0 0)' }} />
              ))}
            </div>
            {/* the tram ride, under the halves */}
            <canvas ref={tram} aria-label="Το τραμ της γραμμής 41 έρχεται καταπάνω σου" role="img" className="absolute inset-0 h-full w-full opacity-0" />
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
                <p ref={sub} className="max-w-[34ch] text-lg leading-snug text-ivory/90 md:text-xl">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1983. Κόβουμε μπροστά σου, την ώρα που το ζητάς.</p>
                <div ref={cta} className="flex flex-col gap-3 sm:flex-row">
                  <Btn href={ORDER_PATH} onClick={link('order')}>Παράγγειλε τώρα</Btn>
                  <Btn href={SHOP.phoneHref} variant="ivory">{SHOP.phone}</Btn>
                </div>
              </div>
            </div>
            <div ref={hint} className="pointer-events-none absolute right-5 top-24 z-10 font-mono text-[11px] uppercase tracking-[.2em] text-ivory/70 opacity-0 md:right-8">Κύλησε για την κοπή</div>
          </>
        )}

        {/* two prints on a string: pick a line */}
        <div ref={hub} className={cn('absolute inset-0 z-20 flex flex-col bg-ink', !reduced && 'invisible')}>
          <div ref={hubHead} className="flex items-end justify-between px-5 pt-20 md:px-8 md:pt-24">
            <p className="font-display text-2xl uppercase tracking-wide text-ivory md:text-3xl">Τέρμα. <span className="text-ivory/55">Πού πας;</span></p>
            <p className="hidden font-mono text-[12px] text-ivory/60 md:block">{SHOP.address} · Κοπή, Πειραιάς</p>
          </div>
          <div ref={(el) => { doors.current[0] = el as unknown as HTMLAnchorElement }} className="relative min-h-0 flex-1">
            <LinePicker running={board || reduced} prints={prints} />
          </div>
        </div>
        {/* the flash of the crash, above everything */}
        {!reduced && <div ref={flash} className="pointer-events-none absolute inset-0 z-30 opacity-0" style={{ background: 'radial-gradient(circle at 50% 50%, #FFF3D6 0%, #F2D9A6 45%, #EFEAE0 100%)' }} />}
      </div>
    </section>
  )
}

function PhoneHero({ prints }: { prints: Print[] }) {
  const cards = useRef<HTMLDivElement>(null)
  const film = useRef<HTMLVideoElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    // iOS only autoplays a video that is muted as a property, not just as an attribute
    const v = film.current; if (v) { v.muted = true; v.play().catch(() => { /* the poster stands */ }) }
    // between the hero and the prints the page never rests half way: once the finger is up and the
    // scroll has stopped, it settles on the prints going down, or on the hero going up. Waiting for
    // the scroll to stop means the page never fights the finger.
    let t = 0, touching = false, last = window.scrollY, dir = 1
    const top = () => (cards.current ? cards.current.getBoundingClientRect().top + window.scrollY : 0)
    const settle = () => {
      if (touching) return
      const y = window.scrollY, c = top()
      if (y <= 2 || y >= c - 2) return
      const to = dir > 0 ? c : 0
      const l = getLenis(); if (l) l.scrollTo(to, { duration: 0.6 }); else window.scrollTo({ top: to, behavior: 'smooth' })
    }
    const onScroll = () => { const y = window.scrollY; if (y !== last) dir = y > last ? 1 : -1; last = y; clearTimeout(t); t = window.setTimeout(settle, 140) }
    const down = () => { touching = true; clearTimeout(t) }
    const up = () => { touching = false; clearTimeout(t); t = window.setTimeout(settle, 140) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', down, { passive: true })
    window.addEventListener('touchend', up, { passive: true })
    window.addEventListener('touchcancel', up, { passive: true })
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setSeen(true) }, { threshold: 0.3 })
    if (cards.current) io.observe(cards.current)
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); window.removeEventListener('touchstart', down); window.removeEventListener('touchend', up); window.removeEventListener('touchcancel', up); io.disconnect() }
  }, [])
  return (
    <section id="hero" data-theme="dark" className="relative bg-ink text-ivory" aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ, Πειραιάς">
      <div className="relative h-[100svh] overflow-hidden">
        <motion.video ref={film} className="absolute inset-x-0 top-0 h-[64%] w-full object-cover object-[56%_50%]" poster="/media/cleaver-poster.jpg" src="/media/cleaver-720.mp4" autoPlay muted loop playsInline preload="auto" aria-label="Ο μπαλτάς κόβει τα παϊδάκια στον ξύλινο κορμό" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink from-36% via-ink/40 via-52% to-transparent to-75%" />
        <div className="absolute inset-x-5 bottom-8">
          <motion.h1 className="font-display text-[26vw] uppercase leading-[.82]" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>Το Τραμ</motion.h1>
          <motion.div className="mt-2 h-[3px] w-full origin-left bg-red" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.55, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.8 }}>
            <p className="mt-5 max-w-[34ch] text-lg leading-snug text-ivory/90">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1983. Κόβουμε μπροστά σου, την ώρα που το ζητάς.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Btn href={ORDER_PATH} onClick={link('order')}>Παράγγειλε τώρα</Btn>
              <Btn href={SHOP.phoneHref} variant="ivory">{SHOP.phone}</Btn>
            </div>
          </motion.div>
        </div>
      </div>
      <div ref={cards} className="relative flex h-[100svh] flex-col bg-ink">
        <p className="px-5 pt-24 font-display text-3xl uppercase tracking-wide text-ivory">Τέρμα. <span className="text-ivory/55">Πού πας;</span></p>
        <div className="relative min-h-0 flex-1"><LinePicker running={seen} prints={prints} /></div>
      </div>
    </section>
  )
}
