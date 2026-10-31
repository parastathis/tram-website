/**
 * Είσοδος. The site opens like the shop: a loading screen where the logo tram rolls along a rail
 * while the counter fills, then an "enter" moment. Pressing it cuts the screen on the cleaver's
 * diagonal and the two halves slide apart to reveal the hero. Once per session, under 2.5s to
 * the button; reduced motion skips straight in.
 */
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Roll } from '@/components/Btn'

const CUT = 14
const t = Math.tan((CUT * Math.PI) / 180) * 50
const CLIP_A = `polygon(0 0, 100% 0, 100% ${50 - t + 0.4}%, 0 ${50 + t + 0.4}%)`
const CLIP_B = `polygon(0 ${50 + t}%, 100% ${50 - t}%, 100% 100%, 0 100%)`

export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)
  const tram = useRef<HTMLImageElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const enter = useRef<HTMLButtonElement>(null)
  const [gone, setGone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('tram-seen') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setGone(true); onDone(); return }
    const ctx = gsap.context(() => {
      const counter = { v: 0 }
      const tl = gsap.timeline({ onComplete: () => setReady(true) })
      tl.fromTo(rail.current, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 0)
      tl.fromTo(tram.current, { xPercent: -140, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.2)
      tl.to(tram.current, { x: () => (rail.current?.offsetWidth ?? 600) - (tram.current?.offsetWidth ?? 60), duration: 1.5, ease: 'power1.inOut' }, 0.6)
      tl.to(counter, { v: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: () => { if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0') } }, 0.6)
      tl.fromTo(word.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 0.7)
    }, root)
    return () => ctx.revert()
  }, [onDone])

  useEffect(() => {
    if (!ready) return
    gsap.fromTo(enter.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' })
  }, [ready])

  const open = () => {
    sessionStorage.setItem('tram-seen', '1')
    onDone()
    const tl = gsap.timeline({ onComplete: () => setGone(true) })
    tl.to([word.current, enter.current, rail.current, tram.current, num.current], { opacity: 0, duration: 0.25 }, 0)
    tl.to(a.current, { xPercent: -18, yPercent: -110, ease: 'power4.in', duration: 0.9 }, 0.15)
    tl.to(b.current, { xPercent: 18, yPercent: 110, ease: 'power4.in', duration: 0.9 }, 0.15)
  }

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[90] text-ivory" aria-label="Είσοδος">
      <div ref={a} className="absolute inset-0 bg-ink" style={{ clipPath: CLIP_A }} />
      <div ref={b} className="absolute inset-0 bg-ink" style={{ clipPath: CLIP_B }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div className="relative w-[70vw] max-w-3xl">
          <img ref={tram} src="/media/tram-mark.png" alt="" className="absolute bottom-[2px] left-0 h-10 w-auto invert md:h-14" />
          <div ref={rail} className="h-[2px] w-full origin-left bg-ivory" />
          <span ref={num} className="absolute -top-6 right-0 font-mono text-[12px] text-ivory/70">000</span>
        </div>
        <div ref={word} className="mt-6 font-display text-3xl uppercase tracking-wide md:text-4xl">Το Τραμ · Πειραιάς</div>
        <button ref={enter} type="button" onClick={open} disabled={!ready} className="btn btn-ivory mt-10 opacity-0 disabled:pointer-events-none">
          <span className="sr-only">Μπες στο μαγαζί</span><Roll text="Μπες στο μαγαζί" />
        </button>
      </div>
    </div>
  )
}
