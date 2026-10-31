/**
 * Ported from 21st.dev "Horizontal Feature Reveal" by hyperiux
 * https://21st.dev/@hyperiux/components/horizontal-feature-reveal
 * Kept: tall section with a sticky viewport, vertical scroll drives the horizontal track,
 * per-card number/title/copy line masks, image parallax, stacked fallback under 1025px.
 * Changed: the track is a tram line. A rail runs under the cards with one stop per product
 * family and the shop's own tram (from the logo) drives along it with the scroll.
 */
import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { STOPS } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger, SplitText)

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export default function Line() {
  const uid = useId().replace(/:/g, '')
  const sectionId = `line-${uid}`
  const tram = useRef<HTMLImageElement>(null)
  const tramMobile = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduced = reducedMotion()
      const desktop = window.innerWidth > 1025

      if (!desktop) {
        // phones and tablets: vertical rail on the left, tram follows the scroll
        if (reduced || !tramMobile.current) return
        gsap.to(tramMobile.current, {
          top: '100%',
          ease: 'none',
          scrollTrigger: { trigger: `#${sectionId} .rail-v`, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
        })
        gsap.utils.toArray<HTMLElement>(`#${sectionId} .stop-card`).forEach((card) => {
          gsap.from(card, {
            y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          })
        })
        return
      }

      const track = document.querySelector<HTMLElement>(`#${sectionId} .line-track`)!
      const travel = () => -(track.scrollWidth - window.innerWidth + window.innerWidth * 0.08)

      gsap.set(`#${sectionId} .stop-img, #${sectionId} .stop-no, #${sectionId} .stop-title, #${sectionId} .stop-copy`, { opacity: 1 })

      gsap.to(track, {
        x: travel,
        ease: 'none',
        scrollTrigger: { trigger: `#${sectionId}`, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true },
      })

      // the tram rides the rail across the viewport while the track moves
      if (tram.current) {
        gsap.fromTo(tram.current, { xPercent: -10 }, {
          xPercent: () => (window.innerWidth / tram.current!.offsetWidth) * 100 - 90,
          ease: 'none',
          scrollTrigger: { trigger: `#${sectionId}`, start: 'top top', end: 'bottom bottom', scrub: 0.6, invalidateOnRefresh: true },
        })
      }

      if (reduced) { ScrollTrigger.refresh(); return }

      const head = document.querySelector(`#${sectionId} .line-head`)
      if (head) {
        const split = new SplitText(head, { type: 'words', mask: 'words' })
        gsap.from(split.words, {
          yPercent: 110, stagger: 0.06, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: `#${sectionId}`, start: 'top 60%', toggleActions: 'play none none none' },
        })
      }

      const cards = document.querySelectorAll<HTMLElement>(`#${sectionId} .stop-card`)
      const n = cards.length
      cards.forEach((card, i) => {
        const a = Math.max(0, (i / n) * 100 - 14)
        const b = a + 8
        const startAt = `${a}% top`
        const endAt = `${b}% top`

        const no = card.querySelector('.stop-no')
        if (no) {
          const s = new SplitText(no, { type: 'lines', mask: 'lines' })
          gsap.from(s.lines, { yPercent: 110, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: `#${sectionId}`, start: startAt, end: endAt, toggleActions: 'play none none reverse' } })
        }
        const title = card.querySelector('.stop-title')
        if (title) {
          const s = new SplitText(title, { type: 'lines', mask: 'lines' })
          gsap.from(s.lines, { yPercent: 100, stagger: 0.08, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: `#${sectionId}`, start: startAt, end: endAt, toggleActions: 'play none none reverse' } })
        }
        card.querySelectorAll('.stop-copy').forEach((p) => {
          const s = new SplitText(p, { type: 'lines', mask: 'lines' })
          gsap.from(s.lines, { yPercent: 100, stagger: 0.06, delay: 0.25, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: `#${sectionId}`, start: startAt, end: endAt, toggleActions: 'play none none reverse' } })
        })
        card.querySelectorAll('.stop-img').forEach((img) => {
          gsap.fromTo(img, { xPercent: -14 }, { xPercent: 14, ease: 'none', scrollTrigger: { trigger: `#${sectionId}`, start: `${Math.max(0, a - 12)}% top`, end: `${b + 22}% top`, scrub: true } })
        })
      })
      ScrollTrigger.refresh()
    })
    return () => ctx.revert()
  }, [sectionId])

  return (
    <section id="grammi" data-theme="dark" className="bg-oxblood text-tile">
      <div id={sectionId} className="relative h-[560vh] w-full max-[1025px]:h-auto max-[1025px]:px-5 max-[1025px]:py-20">
        <div className="sticky top-0 h-screen w-full overflow-hidden max-[1025px]:static max-[1025px]:h-auto max-[1025px]:overflow-visible">
          <div className="hidden max-[1025px]:block max-[1025px]:mb-12">
            <h2 className="font-display text-[clamp(2rem,4.6vw,4.4rem)] font-extrabold leading-[1.02] tracking-tight">
              Η γραμμή του μαγαζιού. Έξι στάσεις, ό,τι χρειάζεται το τραπέζι.
            </h2>
          </div>

          {/* desktop track */}
          <div className="line-track absolute left-0 top-0 flex h-screen w-fit flex-nowrap items-end gap-[6vw] pl-[8vw] pr-[8vw] pb-[16vh] will-change-transform max-[1025px]:hidden">
            <div className="flex h-[62vh] w-[34vw] shrink-0 flex-col justify-end pb-2 pr-[4vw]">
              <h2 className="line-head font-display text-[clamp(2rem,3.8vw,3.6rem)] font-extrabold leading-[1.04] tracking-tight">Η γραμμή του μαγαζιού. Έξι στάσεις, ό,τι χρειάζεται το τραπέζι.</h2>
              <p className="mt-5 max-w-[34ch] text-[15px] text-tile/70">Από το μοσχάρι μέχρι τη μαναβική, με τη σειρά που τα βρίσκεις στο μαγαζί.</p>
            </div>
            {STOPS.map((s, i) => (
              <article key={s.id} className="stop-card flex h-[62vh] w-[58vw] gap-[3vw]">
                <div className="h-full w-[26vw] shrink-0 overflow-hidden">
                  <img src={s.image} alt={s.alt} className="stop-img h-full w-[128%] max-w-none object-cover opacity-0" width={1200} height={1600} loading="lazy" />
                </div>
                <div className="flex flex-col justify-end gap-5 pb-2">
                  <p className="stop-no font-mono text-sm text-tile/60 opacity-0">Στάση {i + 1}</p>
                  <h3 className="stop-title font-display text-[clamp(2rem,3.6vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight opacity-0">{s.title}</h3>
                  <p className="stop-copy text-lg font-medium text-tile opacity-0">{s.line}</p>
                  <p className="stop-copy max-w-[30ch] text-[15px] leading-relaxed text-tile/75 opacity-0">{s.text}</p>
                </div>
              </article>
            ))}
          </div>

          {/* desktop rail */}
          <div className="absolute inset-x-0 bottom-[9vh] max-[1025px]:hidden">
            <div className="relative h-px w-full bg-tile/30">
              <div className="absolute inset-x-0 -top-px h-[3px] bg-tile/30" />
              <img ref={tram} src="/media/tram-mark.png" alt="" aria-hidden className="absolute bottom-[3px] left-0 h-14 w-auto invert will-change-transform" />
            </div>
            <div className="mt-3 flex justify-between px-[8vw] font-mono text-[11px] text-tile/60">
              <span>Σαλαμίνος 124</span>
              <span>Κοπή, Πειραιάς</span>
            </div>
          </div>

          {/* stacked fallback */}
          <div className="relative hidden gap-14 max-[1025px]:flex max-[1025px]:flex-col max-[1025px]:pl-10">
            <div className="rail-v absolute bottom-0 left-2 top-0 w-px bg-tile/30">
              <div ref={tramMobile} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-oxblood py-1"><img src="/media/tram-mark.png" alt="" aria-hidden className="h-6 w-auto invert" /></div>
            </div>
            {STOPS.map((s, i) => (
              <article key={s.id} className="stop-card relative">
                <span className="absolute -left-10 top-1 h-3 w-3 translate-x-[2px] rounded-full bg-tile" />
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img src={s.image} alt={s.alt} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <p className="mt-5 font-mono text-xs text-tile/60">Στάση {i + 1}</p>
                <h3 className="mt-1 font-display text-3xl font-extrabold leading-tight">{s.title}</h3>
                <p className="mt-2 text-base font-medium">{s.line}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-tile/75">{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
