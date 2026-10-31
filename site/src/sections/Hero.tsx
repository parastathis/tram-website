/**
 * Ported from 21st.dev "Hero Scrub" by jean.duthil13
 * https://21st.dev/@jean.duthil13/components/hero-scrub
 * Kept: two giant title lines with the card between them, sticky choreography,
 * canvas image sequence scrubbed by scroll, card scaling from thumbnail to full bleed.
 * Changed: brand (slab type, oxblood ground), real frames, and the ending is a diagonal
 * cleaver cut that splits the frame in two instead of shrinking back.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Phone } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'

gsap.registerPlugin(ScrollTrigger)

const PIN_VH = 2.6
const FRAME_COUNT = Number(import.meta.env.VITE_FRAME_COUNT ?? 1)
const frameUrl = (i: number) =>
  FRAME_COUNT > 1 ? `/media/frames/f_${String(i + 1).padStart(4, '0')}.webp` : '/media/still-cleaver-ribs-16x9.webp'
const CUT = 14 // blade angle in degrees
const t = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - t + 0.4}%, 0 ${50 + t + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + t}%, 100% ${50 - t}%, 100% 100%, 0 100%)`

function useReduced() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const u = () => setR(mq.matches)
    u()
    mq.addEventListener('change', u)
    return () => mq.removeEventListener('change', u)
  }, [])
  return r
}

export default function Hero() {
  const section = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const canvasA = useRef<HTMLCanvasElement>(null)
  const canvasB = useRef<HTMLCanvasElement>(null)
  const halfA = useRef<HTMLDivElement>(null)
  const halfB = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLHeadingElement>(null)
  const bottom = useRef<HTMLHeadingElement>(null)
  const cta = useRef<HTMLDivElement>(null)
  const images = useRef<HTMLImageElement[]>([])
  const last = useRef(-1)
  const [ready, setReady] = useState(false)
  const [aspect, setAspect] = useState(16 / 9)
  const reduced = useReduced()
  const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

  // frames
  useEffect(() => {
    let cancelled = false
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT)
    images.current = imgs
    const draw = (img: HTMLImageElement) => {
      for (const c of [canvasA.current, canvasB.current]) {
        if (!c) continue
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        c.getContext('2d')?.drawImage(img, 0, 0)
      }
      last.current = 0
      setAspect(img.naturalWidth / img.naturalHeight)
      setReady(true)
    }
    const load = (i: number) => {
      const img = new Image()
      img.decoding = 'async'
      if (i === 0) img.onload = () => !cancelled && draw(img)
      img.src = frameUrl(i)
      imgs[i] = img
    }
    const first = Math.min(16, FRAME_COUNT)
    for (let i = 0; i < first; i++) load(i)
    let cursor = first
    const next = () => {
      if (cancelled) return
      const end = Math.min(FRAME_COUNT, cursor + 16)
      for (let i = cursor; i < end; i++) load(i)
      cursor = end
      if (cursor < FRAME_COUNT) setTimeout(next, 60)
    }
    setTimeout(next, 150)
    return () => {
      cancelled = true
    }
  }, [])

  // entry
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'expo.out' } })
      tl.from(card.current, { opacity: 0, scale: phone ? 1.06 : 0.5, duration: 1.3 }, 0)
      tl.from(top.current, { yPercent: 55, opacity: 0, duration: 1.1 }, 0.25)
      tl.from(bottom.current, { yPercent: -55, opacity: 0, duration: 1.1 }, 0.35)
      tl.from(cta.current, { y: 24, opacity: 0, duration: 0.9 }, 0.7)
    }, section)
    return () => ctx.revert()
  }, [phone])

  // scroll choreography (desktop only: phones get a load reveal + normal scroll)
  useEffect(() => {
    if (reduced || !ready || phone) return
    const el = section.current!
    const ctx = gsap.context(() => {
      const loaded = (i: number) => {
        const im = images.current[i]
        return !!im && im.complete && im.naturalWidth > 0
      }
      const drawFrame = (index: number) => {
        let i = index
        if (!loaded(i)) {
          let f = -1
          for (let d = 1; d < FRAME_COUNT; d++) {
            if (i - d >= 0 && loaded(i - d)) { f = i - d; break }
            if (i + d < FRAME_COUNT && loaded(i + d)) { f = i + d; break }
          }
          if (f === -1) return
          i = f
        }
        if (last.current === i) return
        const img = images.current[i]
        for (const c of [canvasA.current, canvasB.current]) c?.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height)
        last.current = i
      }
      const immerse = () => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const bw = Math.min(vw * 0.84, vh * 0.5 * aspect)
        const bh = Math.min(vh * 0.5, (vw * 0.84) / aspect)
        return Math.max(vw / bw, vh / bh) * 1.04
      }
      gsap.set(card.current, { scale: 0.62, transformOrigin: '50% 50%' })
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            const p = gsap.utils.clamp(0, 1, (s.progress - 0.12) / 0.56)
            drawFrame(Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT)))
          },
        },
      })
      tl.to(card.current, { scale: 1, ease: 'power2.out', duration: 0.12 }, 0)
      tl.to(top.current, { xPercent: -60, ease: 'power2.inOut', duration: 0.12 }, 0)
      tl.to(bottom.current, { xPercent: 60, ease: 'power2.inOut', duration: 0.12 }, 0)
      tl.to(cta.current, { opacity: 0, y: 20, duration: 0.08 }, 0)
      tl.to(card.current, { scale: immerse, ease: 'power2.in', duration: 0.56 }, 0.12)
      tl.to([top.current, bottom.current], { opacity: 0, duration: 0.2 }, 0.12)
      tl.to(halfA.current, { xPercent: -16, yPercent: -36, ease: 'power3.in', duration: 0.28 }, 0.72)
      tl.to(halfB.current, { xPercent: 16, yPercent: 36, ease: 'power3.in', duration: 0.28 }, 0.72)
      ScrollTrigger.refresh()
    }, section)
    return () => ctx.revert()
  }, [ready, reduced, aspect, phone])

  const go = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById('paraggelia')
    const l = getLenis()
    if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' })
  }

  const cardStyle = phone
    ? { width: '100%', height: '100%' }
    : { width: `min(84vw, calc(50svh * ${aspect}))`, height: `min(50svh, calc(84vw / ${aspect}))` }
  const titleStyle = phone ? undefined : { fontSize: 'clamp(2.6rem, 8.2vw, 7.6rem)' }

  return (
    <section
      ref={section}
      id="hero"
      data-theme="dark"
      className="relative w-full overflow-clip bg-oxblood-2 text-tile"
      style={{ height: phone ? '100svh' : `${PIN_VH * 100}vh` }}
      aria-label="Παραδοσιακό Κρεοπωλείο Το Τραμ"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(200,38,45,.22) 0%, rgba(0,0,0,0) 60%)' }} />

        <div className={phone ? 'absolute inset-0' : 'relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 pt-24 pb-28 md:gap-4'}>
          <h1
            ref={top}
            className={phone ? 'absolute left-5 top-24 z-20 font-display text-[18vw] font-extrabold leading-[.9] tracking-tight' : 'font-display font-extrabold uppercase leading-[.85] tracking-[-0.03em]'}
            style={titleStyle}
          >
            Το Τραμ
          </h1>

          <div ref={card} className={phone ? 'absolute inset-0' : 'relative overflow-visible will-change-transform'} style={cardStyle}>
            <div ref={halfA} className="absolute inset-0 overflow-hidden will-change-transform" style={{ clipPath: CLIP_A }}>
              <canvas ref={canvasA} aria-hidden className="h-full w-full object-cover" />
            </div>
            <div ref={halfB} className="absolute inset-0 overflow-hidden will-change-transform" style={{ clipPath: CLIP_B }}>
              <canvas ref={canvasB} aria-hidden className="h-full w-full object-cover" />
            </div>
            {phone && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-oxblood-2/90 via-oxblood-2/20 to-oxblood-2/40" />}
          </div>

          <h2
            ref={bottom}
            className={phone ? 'absolute left-5 right-5 top-[calc(6rem+18vw)] z-20 font-display text-[7.5vw] font-semibold leading-tight' : 'font-display font-extrabold uppercase leading-[.85] tracking-[-0.03em]'}
            style={titleStyle}
          >
            {phone ? 'Παραδοσιακό κρεοπωλείο στον Πειραιά, από το 1980' : 'Κρεοπωλείο'}
          </h2>
        </div>

        <div ref={cta} className="absolute inset-x-5 bottom-8 z-20 flex flex-col gap-3 md:inset-x-8 md:bottom-10 md:flex-row md:items-end md:justify-between">
          <p className="hidden max-w-sm text-[15px] leading-snug text-tile/80 md:block">
            Σπάρτης & Σαλαμίνος 124, Κοπή. Ελληνικό κρέας με ταυτότητα, κομμένο την ώρα που το ζητάς, από το 1980.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#paraggelia" onClick={go} className="btn btn-solid justify-center">Παραγγελία για παραλαβή</a>
            <a href={SHOP.phoneHref} className="btn justify-center [--btn-fill:#F2EFE9] [--btn-fill-text:#1B1416]">
              <Phone size={18} weight="bold" /> {SHOP.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
