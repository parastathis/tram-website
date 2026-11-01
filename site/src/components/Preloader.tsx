/**
 * Είσοδος. The logo tram drives in from the left, lays the rail behind it and uncovers the name
 * as it passes over the letters; then "Μπες στο μαγαζί". Pressing it cuts the screen on the
 * cleaver's diagonal and the two halves slide apart to reveal the hero. Once per session;
 * reduced motion skips straight in.
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
  const track = useRef<HTMLDivElement>(null)
  const tram = useRef<HTMLImageElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const sub = useRef<HTMLDivElement>(null)
  const enter = useRef<HTMLButtonElement>(null)
  const [gone, setGone] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('tram-seen') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setGone(true); onDone(); return }
    const ctx = gsap.context(() => {
      const W = () => track.current?.offsetWidth ?? 600
      const tw = () => tram.current?.offsetWidth ?? 80
      const prog = { v: 0 }
      const tl = gsap.timeline({ onComplete: () => setReady(true) })
      tl.set(tram.current, { x: -tw() - 40, opacity: 1 })
      tl.set(word.current, { clipPath: 'inset(0 100% 0 0)' })
      tl.to(prog, {
        v: 1, duration: 2.1, ease: 'power2.inOut',
        onUpdate: () => {
          const x = -tw() + (W() + tw()) * prog.v
          gsap.set(tram.current, { x, y: Math.sin(prog.v * 40) * 1.2 })
          gsap.set(rail.current, { scaleX: Math.max(0, Math.min(1, (x + tw() * 0.5) / W())) })
          gsap.set(word.current, { clipPath: `inset(0 ${Math.max(0, 100 - ((x + tw() * 0.5) / W()) * 100)}% 0 0)` })
        },
      }, 0.2)
      tl.fromTo(sub.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 }, 1.6)
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
    tl.to([word.current, sub.current, enter.current, rail.current, tram.current], { opacity: 0, duration: 0.25 }, 0)
    tl.to(a.current, { xPercent: -18, yPercent: -110, ease: 'power4.in', duration: 0.9 }, 0.15)
    tl.to(b.current, { xPercent: 18, yPercent: 110, ease: 'power4.in', duration: 0.9 }, 0.15)
  }

  if (gone) return null
  return (
    <div ref={root} className="fixed inset-0 z-[90] text-ivory" aria-label="Είσοδος">
      <div ref={a} className="absolute inset-0 bg-ink" style={{ clipPath: CLIP_A }} />
      <div ref={b} className="absolute inset-0 bg-ink" style={{ clipPath: CLIP_B }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <div ref={track} className="relative w-[76vw] max-w-4xl">
          <div ref={word} className="font-display text-[14vw] uppercase leading-[.85] md:text-[9vw]" style={{ clipPath: 'inset(0 100% 0 0)' }}>Το Τραμ</div>
          <div className="relative mt-3 h-[2px] w-full">
            <div ref={rail} className="h-full w-full origin-left bg-ivory" style={{ transform: 'scaleX(0)' }} />
            <img ref={tram} src="/media/tram-mark.png" alt="" className="absolute bottom-[1px] left-0 h-10 w-auto invert opacity-0 md:h-14" />
          </div>
        </div>
        <div ref={sub} className="mt-8 font-mono text-[12px] text-ivory/70">Παραδοσιακό κρεοπωλείο · Πειραιάς · από το 1980</div>
        <button ref={enter} type="button" onClick={open} disabled={!ready} className="btn btn-ivory mt-8 opacity-0 disabled:pointer-events-none">
          <span className="sr-only">Μπες στο μαγαζί</span><Roll text="Μπες στο μαγαζί" />
        </button>
      </div>
    </div>
  )
}
