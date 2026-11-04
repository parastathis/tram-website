/**
 * Ported from 21st.dev "Parallax Strip Slider" by hyperiux
 * https://21st.dev/@hyperiux/components/parallax-strip-slider
 * Kept: fullscreen slides, each incoming slide revealed through staggered vertical strips with a
 * Ken-Burns zoom, SplitText title char reveal, progress bar, counter, click-to-navigate halves with
 * a circular follow cursor, stacked layout on touch. Changed: slides are the product
 * families of this shop, on the uniform marble photos of its Orderoo menu, the display face is the condensed brand face, the cursor is tram red.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import Btn from '@/components/Btn'
import { getLenis } from '@/lib/smooth'

gsap.registerPlugin(SplitText)

const P = (id: string) => `/media/p/${id}.webp`
const SLIDES = [
  { src: P('cmvtxlxlk000808l2epj2d90r'), title: 'Μοσχάρι', chapter: 'Νεαρό ζώο, από τη Φάρμα Ελασσόνας', text: 'Κόντρα, κιλότο, σπάλα, ελιά, φιλέτο, κιμάς της ώρας. Κάθε κομμάτι έρχεται με την ετικέτα του: γέννηση, εκτροφή και σφαγή στην Ελλάδα.' },
  { src: P('cmvtxm5ib004508l2y09w6m9r'), title: 'Αρνί & κατσίκι', chapter: 'Γάλακτος, ολόκληρα ή σε μερίδες', text: 'Ολόκληρο, μισό με ή χωρίς κεφάλι και συκωταριά, χεράκι, μπούτι και παϊδάκια. Για τη σούβλα του Πάσχα, με παραγγελία.' },
  { src: P('cmvtxm04l002a08l2h8etklu3'), title: 'Χοιρινό', chapter: 'Από τη Φάρμα Ελασσόνας', text: 'Πανσέτα, μπριζόλα, μπούτι, ελιά, κότσι. Κόβεται στο πάχος που θέλεις, την ώρα που το ζητάς.' },
  { src: P('cmvtxm2dn002v08l24ph8467h'), title: 'Κοτόπουλο', chapter: 'Ελληνικό, από την Πίνδο', text: 'Ολόκληρο ή σε μερίδες: φιλέτο, μπούτι, κοπανάκια, φτερούγες. Και μαριναρισμένο από εμάς, έτοιμο για τον φούρνο.' },
  { src: P('cmvtxm8qb005a08l2xrnnjkoe'), title: 'Λουκάνικα', chapter: 'Παραγωγής μας', text: 'Χωριάτικο λουκάνικο από ελληνικό χοιρινό της Φάρμας Ελασσόνας. Και το μοσχαρίσιο σουτζούκι πικάντικο που ζητάνε με το όνομά του.' },
  { src: P('cmvtxm8io004w08l280oylojw'), title: 'Παρασκευές', chapter: 'Φτιαγμένες στο εργαστήριο', text: 'Κοντοσούβλι, ρολά γεμιστά, σουβλάκια, μπιφτέκια, κοκορέτσι και γαρδούμπα. Δεκαοκτώ παρασκευές, έτοιμες για σχάρα και φούρνο.' },
]
const STRIPS = 10, REVEAL = 0.5, STAGGER = 0.04, ZOOM_FROM = 1.2, ZOOM = 0.9, AUTOPLAY = 5000
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

export default function Chapters() {
  const [current, setCurrent] = useState(0)
  const [incoming, setIncoming] = useState<number | null>(null)
  const [caption, setCaption] = useState(0)
  const [dir, setDir] = useState<'next' | 'prev'>('next')
  const [coarse, setCoarse] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const chapterRef = useRef<HTMLSpanElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const stripsRef = useRef<HTMLDivElement[]>([])
  const zoomRef = useRef<HTMLDivElement[]>([])
  const animating = useRef(false)
  const first = useRef(true)
  const split = useRef<SplitText | null>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const l1 = useRef<HTMLSpanElement>(null), l2 = useRef<HTMLSpanElement>(null)
  const inside = useRef(false), mouse = useRef({ x: 0, y: 0 }), pos = useRef({ x: 0, y: 0 })
  const total = SLIDES.length

  useEffect(() => { const mq = window.matchMedia('(pointer: coarse)'); const u = () => setCoarse(mq.matches); u(); mq.addEventListener('change', u); return () => mq.removeEventListener('change', u) }, [])

  const goTo = useCallback((n: number, d: 'next' | 'prev') => { if (animating.current || n === current) return; animating.current = true; setDir(d); setIncoming(n) }, [current])
  const next = useCallback(() => goTo((current + 1) % total, 'next'), [current, goTo, total])
  const prev = useCallback(() => goTo((current - 1 + total) % total, 'prev'), [current, goTo, total])

  useEffect(() => { if (reduced()) return; const id = setInterval(() => { if (!animating.current && inViewRef.current) next() }, AUTOPLAY); return () => clearInterval(id) }, [next])
  const inViewRef = useRef(false)
  useEffect(() => { const io = new IntersectionObserver((e) => { inViewRef.current = e[0].isIntersecting }, { threshold: 0.4 }); if (root.current) io.observe(root.current); return () => io.disconnect() }, [])

  // wipe + zoom + progress
  useLayoutEffect(() => {
    if (incoming === null) return
    const strips = stripsRef.current.slice(0, STRIPS).filter(Boolean)
    const zooms = zoomRef.current.slice(0, STRIPS).filter(Boolean)
    const settle = () => { setCaption(incoming); setCurrent(incoming); setIncoming(null); animating.current = false }
    if (reduced() || !strips.length) { settle(); return }
    const isPrev = dir === 'prev'
    const ordered = isPrev ? [...strips].reverse() : strips
    const tl = gsap.timeline({ onComplete: settle })
    tl.fromTo(ordered, { clipPath: isPrev ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: isPrev ? 'inset(0 0 0 0%)' : 'inset(0 0% 0 0)', duration: REVEAL, ease: 'power3.out', stagger: STAGGER }, 0)
    tl.fromTo(zooms, { scale: ZOOM_FROM }, { scale: 1, duration: ZOOM, ease: 'power3.out' }, 0)
    if (progressRef.current) tl.to(progressRef.current, { scaleX: (incoming + 1) / total, duration: 0.9, ease: 'power3.inOut' }, 0)
    const out = [chapterRef.current, titleRef.current, textRef.current, counterRef.current].filter(Boolean)
    tl.to(out, { autoAlpha: 0, y: -2, duration: 0.35, ease: 'power2.in' }, 0.15)
    tl.add(() => setCaption(incoming), 0.5)
    return () => { tl.kill() }
  }, [incoming, dir, total])

  useLayoutEffect(() => { split.current?.revert(); split.current = null }, [caption])

  // caption reveal
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    const els = [chapterRef.current, titleRef.current, textRef.current, counterRef.current].filter(Boolean)
    gsap.set(els, { autoAlpha: 1, y: 0 })
    if (reduced() || !titleRef.current) return
    const s = new SplitText(titleRef.current, { type: 'chars' })
    split.current = s
    const tl = gsap.timeline({ onComplete: () => { s.revert(); if (split.current === s) split.current = null } })
    tl.from(s.chars, { yPercent: 100, duration: 0.6, ease: 'power2.out', stagger: 0.03 }, 0)
    tl.fromTo(chapterRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
    tl.fromTo(textRef.current, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2)
    tl.fromTo(counterRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 }, 0)
    if (numRef.current) tl.from(numRef.current, { yPercent: 110, duration: 0.55, ease: 'power3.out' }, 0)
    return () => { tl.kill() }
  }, [caption])

  // follow cursor
  useEffect(() => {
    if (coarse) return
    const c = cursor.current, a = l1.current, b = l2.current
    if (!c || !a || !b) return
    gsap.set(c, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.6 })
    gsap.set(a, { transformOrigin: '100% 50%', xPercent: -50, yPercent: -50, y: -1.5, rotation: 45 })
    gsap.set(b, { transformOrigin: '100% 50%', xPercent: -50, yPercent: -50, y: 1.5, rotation: -45 })
    let side: 'left' | 'right' = 'right'
    let raf = 0
    const move = (e: MouseEvent) => {
      const r = root.current?.getBoundingClientRect()
      const target = e.target instanceof Element ? e.target : null
      const over = Boolean(target?.closest('button, a, input'))
      mouse.current = { x: e.clientX, y: e.clientY }
      const out = !r || e.clientX <= r.left || e.clientY <= r.top || e.clientX >= r.right || e.clientY >= r.bottom
      if (out || over) { if (inside.current) { inside.current = false; gsap.to(c, { opacity: 0, scale: 0.6, duration: 0.25 }) } return }
      if (!inside.current) { pos.current = { ...mouse.current }; gsap.set(c, { x: e.clientX, y: e.clientY }); gsap.to(c, { opacity: 1, scale: 1, duration: 0.25 }); inside.current = true }
      const s = e.clientX < r.left + r.width / 2 ? 'left' : 'right'
      if (s !== side) { side = s; const L = s === 'left'; gsap.to(a, { rotation: L ? 135 : 45, x: L ? -10 : 4, duration: 0.35 }); gsap.to(b, { rotation: L ? -135 : -45, x: L ? -10 : 4, duration: 0.35 }) }
    }
    const render = () => { pos.current.x += (mouse.current.x - pos.current.x) * 0.12; pos.current.y += (mouse.current.y - pos.current.y) * 0.12; gsap.set(c, { x: pos.current.x, y: pos.current.y }); raf = requestAnimationFrame(render) }
    window.addEventListener('mousemove', move); render()
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf) }
  }, [coarse])

  const renderStrips = (src: string) => Array.from({ length: STRIPS }, (_, i) => {
    const w = 100 / STRIPS
    return (
      <div key={i} ref={(el) => { if (el) stripsRef.current[i] = el }} className="absolute inset-y-0 overflow-hidden" style={{ left: `${i * w}%`, width: `${w}%`, marginLeft: i ? '-0.5px' : 0, paddingLeft: i ? '0.5px' : 0 }}>
        <div className="absolute inset-y-0" style={{ left: `-${i * 100}%`, width: `${STRIPS * 100}%` }}>
          <div ref={(el) => { if (el) zoomRef.current[i] = el }} className="relative h-full w-full will-change-transform">
            <img src={src} alt="" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
          </div>
        </div>
      </div>
    )
  })
  const active = SLIDES[caption]
  const go = (e: React.MouseEvent) => { e.preventDefault(); const el = document.getElementById('pagkos'); const l = getLenis(); if (el) l ? l.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <section id="kreata" data-theme="dark" className="bg-ink text-ivory">
      <div ref={root} className="relative h-[100svh] w-full overflow-hidden bg-ink">
        <div className="absolute inset-0"><img src={SLIDES[current].src} alt={SLIDES[current].title} loading="lazy" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" /></div>
        {incoming !== null && <div className="absolute inset-0">{renderStrips(SLIDES[incoming].src)}</div>}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/20" />

        {total > 1 && (
          <div className="absolute inset-0 z-20" style={{ cursor: coarse ? 'pointer' : 'none' }} onClick={(e) => { if (animating.current) return; const r = e.currentTarget.getBoundingClientRect(); e.clientX < r.left + r.width / 2 ? prev() : next() }} aria-hidden />
        )}

        <div className="pointer-events-none absolute inset-x-5 top-24 z-10 h-px md:inset-x-8" style={{ backgroundColor: 'rgba(243,241,236,.25)' }}>
          <div ref={progressRef} className="h-full w-full origin-left bg-red" style={{ transform: `scaleX(${(caption + 1) / total})` }} />
        </div>
        <div className="pointer-events-none absolute inset-x-5 top-28 z-10 flex items-center justify-between font-mono text-[12px] md:inset-x-8">
          <span ref={chapterRef}>{active.chapter}</span>
          <span ref={counterRef} className="flex items-center"><span className="inline-block w-[2ch] overflow-hidden text-right"><span ref={numRef} className="inline-block">{String(caption + 1).padStart(2, '0')}</span></span><span> / {String(total).padStart(2, '0')}</span></span>
        </div>

        <div className={`absolute inset-x-5 bottom-8 z-10 flex md:inset-x-8 md:bottom-10 ${coarse ? 'flex-col gap-4' : 'items-end justify-between gap-10'}`}>
          <div className="pointer-events-none">
            <h2 ref={titleRef} className="font-display text-[20vw] uppercase leading-[.85] md:text-[11vw]">{active.title}</h2>
            <p ref={textRef} className="mt-3 max-w-[40ch] text-base text-ivory/85 md:text-lg">{active.text}</p>
          </div>
          <div className="pointer-events-auto relative z-30 shrink-0"><Btn href="#pagkos" onClick={go} variant="ivory">Δες τιμές</Btn></div>
        </div>

        {!coarse && (
          <div ref={cursor} className="pointer-events-none fixed left-0 top-0 z-[100]">
            <div className="flex h-16 w-16 items-center justify-center bg-red"><div className="relative h-8 w-8"><span ref={l1} className="absolute left-1/2 top-1/2 h-0.5 w-4 bg-ivory" /><span ref={l2} className="absolute left-1/2 top-1/2 h-0.5 w-4 bg-ivory" /></div></div>
          </div>
        )}
      </div>
    </section>
  )
}
