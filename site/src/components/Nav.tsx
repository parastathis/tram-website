import { useEffect, useState } from 'react'
import { Phone, List, X } from '@phosphor-icons/react'
import { SHOP } from '@/lib/data'
import { cn } from '@/lib/cn'
import { getLenis } from '@/lib/smooth'

const LINKS = [
  { id: 'grammi', label: 'Τα είδη' },
  { id: 'taftotita', label: 'Ταυτότητα' },
  { id: 'paraskeves', label: 'Παρασκευές' },
  { id: 'ippokratis', label: 'Το μαγαζί' },
  { id: 'ores', label: 'Ώρες & πού' },
]

export default function Nav() {
  const [active, setActive] = useState('')
  const [dark, setDark] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const ids = ['hero', ...LINKS.map((l) => l.id), 'paraggelia']
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(e.target.id)
            setDark((e.target as HTMLElement).dataset.theme === "dark")
          }
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    const l = getLenis()
    if (l) l.scrollTo(el, { offset: 0, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-colors duration-500', dark ? 'text-tile' : 'text-ink')}>
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-8">
        <a href="#hero" onClick={go('hero')} className="flex items-center gap-3" aria-label="Το Τραμ, αρχική">
          <img src="/media/tram-mark.png" alt="" className={cn('h-7 w-auto md:h-8', dark && 'invert')} />
          <span className="font-display text-lg font-extrabold tracking-tight md:text-xl">Το Τραμ</span>
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={go(l.id)} className={cn('nav-link relative py-2 text-[15px] font-medium', active === l.id && 'is-active')}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a href={SHOP.phoneHref} className={cn('btn hidden !py-2.5 !px-4 text-sm md:inline-flex', dark && '[--btn-fill:#F2EFE9] [--btn-fill-text:#1B1416]')}>
            <Phone size={16} weight="bold" /> {SHOP.phone}
          </a>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-menu" aria-label="Μενού" className="inline-flex h-11 w-11 items-center justify-center md:hidden">
            {open ? <X size={26} /> : <List size={26} />}
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={cn('fixed inset-x-0 top-16 bottom-0 z-40 bg-tile text-ink transition-transform duration-500 ease-[var(--ease-expo)] md:hidden', open ? 'translate-y-0' : '-translate-y-[110%]')} aria-hidden={!open}>
        <ul className="flex flex-col px-6 pt-6">
          {LINKS.map((l, i) => (
            <li key={l.id} className="border-b border-ink/15">
              <a href={`#${l.id}`} onClick={go(l.id)} className="flex items-center justify-between py-5 font-display text-3xl font-bold" style={{ transitionDelay: `${i * 40}ms` }}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 px-6 pt-8">
          <a href="#paraggelia" onClick={go('paraggelia')} className="btn btn-solid justify-center">Παραγγελία</a>
          <a href={SHOP.phoneHref} className="btn justify-center"><Phone size={18} weight="bold" /> {SHOP.phone}</a>
        </div>
      </div>
    </header>
  )
}
