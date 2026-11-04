/**
 * Ported from 21st.dev "Immersive Full Screen Navigation" by hyperiux
 * https://21st.dev/@hyperiux/components/immersive-full-screen-nav
 * Kept: fixed header with brand + animated hamburger, clip-path wipe of a full-screen panel,
 * staggered reveals of tagline, giant links (character-split hover), image row, socials, location,
 * focus trap and Escape. Changed: the panel is tram red, links are in the condensed display face,
 * the images are the shop's own generated scenes, the header carries the phone.
 */
import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { Phone, FacebookLogo, ArrowRight, WhatsappLogo } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { getLenis } from '@/lib/smooth'
import { cn } from '@/lib/cn'
import CartButton from '@/components/CartButton'
import LineSwitch from '@/components/LineSwitch'
import { goTo, useRoute } from '@/lib/route'

export const LINKS = [
  { label: 'Τα κρέατα', href: '#kreata' },
  { label: 'Ο πάγκος', href: '#pagkos' },
  { label: 'Ποιο κομμάτι', href: '#kommati' },
  { label: 'Το μαγαζί', href: '#magazi' },
  { label: 'Ο Ιπποκράτης', href: '#ippokratis' },
  { label: 'Νέα', href: '#nea' },
  { label: 'Παράγγειλε τώρα', href: '/paraggelia' },
  { label: 'Ώρες & πού', href: '#ores' },
]

const CLIP = { closedInitial: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)', open: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', closedFinal: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' }
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'

function LinkHover({ label, href, onClick }: { label: string; href: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <a href={href} onClick={onClick} className="group/l inline-block no-underline">
      <span className="sr-only">{label}</span>
      <span aria-hidden className="relative block h-[1em] overflow-hidden leading-none">
        {[...label].map((ch, i) => (
          <span key={i} className="relative inline-block whitespace-pre leading-none transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/l:-translate-y-[1em] group-focus-visible/l:-translate-y-[1em]" style={{ textShadow: '0 1em currentColor', transitionDelay: `${i * 18}ms` }}>{ch}</span>
        ))}
      </span>
    </a>
  )
}

export default function Nav({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false)
  const route = useRoute()
  const [active, setActive] = useState('')
  const overlay = useRef<HTMLElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const animating = useRef(false)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const items = useRef<(HTMLElement | null)[]>([])
  const imgs = useRef<(HTMLElement | null)[]>([])
  const foot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1))
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive('#' + e.target.id)), { rootMargin: '-45% 0px -50% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const openMenu = () => {
    setOpen(true)
    tl.current?.kill()
    gsap.set(overlay.current, { clipPath: CLIP.closedInitial })
    gsap.set(wrap.current, { opacity: 1, scale: 1 })
    if (reduced()) { gsap.set(overlay.current, { clipPath: CLIP.open }); gsap.set([...items.current, ...imgs.current, foot.current], { y: 0, opacity: 1, scale: 1 }); return }
    const t = gsap.timeline({ onStart: () => { animating.current = true }, onComplete: () => { animating.current = false } })
    tl.current = t
    t.to(overlay.current, { clipPath: CLIP.open, duration: 1.1, delay: 0.1, ease: 'power4.inOut' })
    t.fromTo(items.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power2.out' }, 0.7)
    t.fromTo(imgs.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, stagger: 0.05, ease: 'power3.out' }, 0.85)
    t.fromTo(foot.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1)
  }
  const closeMenu = () => {
    setOpen(false)
    tl.current?.kill()
    if (reduced()) { gsap.set(overlay.current, { clipPath: CLIP.closedFinal }); return }
    const t = gsap.timeline({ onStart: () => { animating.current = true }, onComplete: () => { animating.current = false; gsap.set(overlay.current, { clipPath: CLIP.closedInitial }) } })
    tl.current = t
    t.to(wrap.current, { scale: 0.92, opacity: 0.4, duration: 0.6, ease: 'power2.in' }).to(overlay.current, { clipPath: CLIP.closedFinal, duration: 1, ease: 'power4.inOut' }, '<')
  }
  const toggleMenu = () => { if (animating.current) return; open ? closeMenu() : openMenu() }

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  useEffect(() => {
    if (!open) return
    const c = root.current!
    const prev = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => toggle.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return }
      if (e.key !== 'Tab') return
      const f = Array.from(c.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey ? a === first || !c.contains(a) : a === last || !c.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (open) closeMenu()
    if (route === 'order') { setTimeout(() => goTo('home', href === '#hero' ? '' : href), open ? 700 : 0); return }
    const el = document.querySelector<HTMLElement>(href)
    if (!el) return
    const l = getLenis()
    setTimeout(() => { l ? l.scrollTo(el, { duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' }) }, open ? 700 : 0)
  }
  const color = open ? '#F3F1EC' : dark ? '#F3F1EC' : '#141012'

  return (
    <div ref={root}>
      <header className={cn('fixed inset-x-0 top-0 z-[70] flex h-16 items-center justify-between px-5 transition-colors duration-300 md:h-20 md:px-8', route === 'order' && !open && 'border-b border-ink/15 bg-ivory')} style={{ color }}>
        <a href="#hero" onClick={go('#hero')} className="flex items-center gap-3 transition-colors duration-500" aria-label="Το Τραμ, αρχική">
          <img src="/media/tram-mark.png" alt="" className={cn('h-7 w-auto transition duration-500 md:h-8', (open || dark) && 'invert')} />
          <span className="font-display text-2xl uppercase tracking-wide">Το Τραμ</span>
        </a>
        {!open && <LineSwitch color={color} className="hidden lg:flex" />}
        <div className="flex items-center gap-3 md:gap-5">
          <a href={SHOP.phoneHref} className="hidden items-center gap-2 font-display text-xl tracking-wide md:inline-flex"><Phone size={18} weight="bold" /> {SHOP.phone}</a>
          {!open && <CartButton color={color} />}
          <button ref={toggle} type="button" onClick={toggleMenu} aria-label="Μενού" aria-expanded={open} className="flex h-11 w-11 flex-col items-center justify-center gap-1.5">
            <span className={cn('block h-0.5 w-7 transition-all duration-700 ease-in-out', open && 'translate-y-2 rotate-45')} style={{ background: color }} />
            <span className={cn('block h-0.5 w-7 transition-all duration-500', open && 'scale-x-0 opacity-0')} style={{ background: color }} />
            <span className={cn('block h-0.5 w-7 transition-all duration-700 ease-in-out', open && '-translate-y-2 -rotate-45')} style={{ background: color }} />
          </button>
        </div>
      </header>

      <nav ref={overlay} style={{ clipPath: CLIP.closedInitial }} className={cn('fixed inset-0 z-[60] overflow-y-auto bg-red text-ivory', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open} aria-label="Κύριο μενού">
        <div ref={wrap} className="flex min-h-[100svh] w-full flex-col justify-between gap-8 px-5 pb-8 pt-20 md:px-12 md:pb-10 md:pt-24">
          <div className="flex items-start justify-between gap-10 max-[1025px]:flex-col">
            <div className="flex flex-col max-[1025px]:w-full">
              {/* phones: the order line first, as a block you cannot miss */}
              <a href="/paraggelia" ref={(el) => { items.current[LINKS.length] = el }} onClick={(e) => { e.preventDefault(); closeMenu(); setTimeout(() => goTo('order'), 700) }} style={{ opacity: 0 }}
                className="mb-5 hidden items-center justify-between bg-ivory px-5 py-4 text-red no-underline max-[1025px]:flex">
                <span><span className="block font-display text-[2.1rem] uppercase leading-none">Παράγγειλε τώρα</span><span className="mt-1 block font-mono text-[11.5px] text-ink/70">Όλος ο πάγκος με τιμές, σε δύο βήματα</span></span>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-red text-ivory"><ArrowRight size={22} weight="bold" /></span>
              </a>
              {LINKS.map((l, i) => (
                <div key={l.href} ref={(el) => { items.current[i] = el }} className={cn('flex items-baseline gap-4 py-[0.06em] font-display text-[min(7.2vw,9vh)] uppercase leading-none max-[1025px]:items-center max-[1025px]:justify-between max-[1025px]:border-b max-[1025px]:border-ivory/20 max-[1025px]:py-3 max-[1025px]:text-[min(9.6vw,5.6vh)]', active === l.href ? 'text-ivory' : 'text-ivory/90', l.href.startsWith('/') && 'max-[1025px]:hidden')} style={{ opacity: 0 }}>
                  <span className="w-[1.6em] shrink-0 font-mono text-[11px] text-ivory/60 max-[1025px]:hidden">{String(i + 1).padStart(2, '0')}{active === l.href ? ' ●' : ''}</span>
                  <span className="flex items-center gap-3">{active === l.href && <span aria-hidden className="hidden h-2.5 w-2.5 bg-ivory max-[1025px]:block" />}<LinkHover label={l.label} href={l.href} onClick={l.href.startsWith('/') ? (e) => { e.preventDefault(); closeMenu(); setTimeout(() => goTo('order'), 700) } : go(l.href)} /></span>
                  <ArrowRight aria-hidden size={20} weight="bold" className="hidden text-ivory/60 max-[1025px]:block" />
                </div>
              ))}
            </div>
            <div className="flex items-end gap-6 max-[1025px]:hidden">
              {['/media/gen/counter-sm.webp', '/media/gen/front-sm.webp'].map((src, i) => (
                <div key={src} ref={(el) => { imgs.current[i] = el }} className="relative h-[16vw] w-[22vw] overflow-hidden max-[1025px]:h-[28vw] max-[1025px]:w-1/2" style={{ opacity: 0 }}>
                  <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div ref={foot} className="flex flex-wrap items-end justify-between gap-4 font-mono text-[12px]" style={{ opacity: 0 }}>
            <div className="hidden w-full grid-cols-2 gap-2 max-[1025px]:grid">
              <a href={SHOP.phoneHref} className="flex h-14 items-center justify-center gap-2 bg-ink font-display text-xl uppercase tracking-wide text-ivory no-underline"><Phone size={18} weight="bold" /> Κάλεσε</a>
              <a href={SHOP.whatsapp} target="_blank" rel="noopener" className="flex h-14 items-center justify-center gap-2 bg-green font-display text-xl uppercase tracking-wide text-ivory no-underline"><WhatsappLogo size={20} weight="bold" /> WhatsApp</a>
            </div>
            <div className="flex items-center gap-6 max-[1025px]:hidden">
              <a href={SHOP.facebook} target="_blank" rel="noopener" className="inline-flex items-center gap-2"><FacebookLogo size={18} weight="bold" /> Facebook</a>
              <a href={SHOP.phoneHref}>{SHOP.phone}</a>
              <a href={SHOP.mobileHref}>{SHOP.mobile}</a>
            </div>
            <span>{SHOP.address}, Κοπή, Πειραιάς · από το 1983</span>
          </div>
        </div>
      </nav>
    </div>
  )
}
