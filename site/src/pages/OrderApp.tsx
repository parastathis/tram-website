/**
 * Γραμμή 1, «Παράγγειλε τώρα»: the order app on its own page, nothing between the visitor and the
 * basket. Built for speed: open-now status and ready time up top, the counter by category with a
 * rail that follows the scroll, search, one-tap reorder of the last order, the basket always in
 * view (a column on desktop, a bar on phones), and the reasons to trust it next to the button.
 * Category rail with scroll-spy follows the 21st.dev "Filter Grid" by ddoemonn already used on the
 * counter (radiogroup semantics, sliding red rule via layoutId).
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowCounterClockwise, Basket, Clock, MagnifyingGlass, Phone, Scales, ShieldCheck, Storefront, Trash, X } from '@phosphor-icons/react'
import ProductCard, { type Item } from '@/components/ProductCard'
import Stepper from '@/components/Stepper'
import { MENU } from '@/lib/menu'
import { cart, euro, fmtQty, img, isWeight, lineCents, minQty, product, split, step, totals, useCart, weighed } from '@/lib/cart'
import { DAYS, HOURS, SHOP, isOpenNow } from '@/lib/data'
import { getLenis } from '@/lib/smooth'
import { cn } from '@/lib/cn'

const ALL: Item[] = MENU.flatMap((c) => c.items.map((p) => ({ ...p, cat: c.name })))
const fold = (s: string) => s.toLocaleLowerCase('el').normalize('NFD').replace(/\p{M}/gu, '')
/** the counter's best sellers, picked from the menu: one or two per counter */
const PICKS = ['cmvtxlxlk000808l2epj2d90r', 'cmvtxm5ib004508l2y09w6m9r', 'cmvtxm04l002a08l2h8etklu3', 'cmvtxm2dn002v08l24ph8467h', 'cmvtxm8qb005a08l2xrnnjkoe', 'cmvtxm8io004w08l280oylojw']

function status(now = new Date()) {
  if (isOpenNow(now)) {
    const close = HOURS[now.getDay()].find(([a, b]) => { const m = now.getHours() * 60 + now.getMinutes(); const t = (s: string) => +s.slice(0, 2) * 60 + +s.slice(3); return m >= t(a) && m < t(b) })?.[1]
    return { open: true, text: `Ανοιχτά τώρα, ως τις ${close}`, sub: 'Έτοιμο για παραλαβή σε περίπου 45 λεπτά' }
  }
  for (let d = 0; d < 8; d++) {
    const day = new Date(now); day.setDate(now.getDate() + d)
    const r = HOURS[day.getDay()]
    const next = r.find(([a]) => d > 0 || +a.slice(0, 2) * 60 + +a.slice(3) > now.getHours() * 60 + now.getMinutes())
    if (next) return { open: false, text: `Κλειστά τώρα. Ανοίγουμε ${d === 0 ? 'σήμερα' : d === 1 ? 'αύριο' : DAYS[day.getDay()]} στις ${next[0]}`, sub: 'Παράγγειλε από τώρα και κλείσε ώρα παραλαβής' }
  }
  return { open: false, text: 'Κλειστά τώρα', sub: '' }
}

function Basket_({ compact = false }: { compact?: boolean }) {
  const { lines } = useCart()
  const t = totals(lines)
  if (!lines.length) return (
    <div className="flex flex-col items-center border border-dashed border-ink/25 px-6 py-10 text-center">
      <Basket size={36} className="text-ink/30" />
      <p className="mt-3 font-display text-2xl uppercase">Το καλάθι είναι άδειο</p>
      <p className="mt-1 text-[14.5px] text-ink-2">Πάτα το + σε ό,τι θέλεις. Μας λες πώς να το κόψουμε στο επόμενο βήμα ή ανοίγοντας το προϊόν.</p>
    </div>
  )
  return (
    <div>
      <ul className={cn('divide-y divide-ink/12 overflow-y-auto overscroll-contain', compact ? '' : 'max-h-[calc(100svh-26rem)]')} data-lenis-prevent>
        {lines.map((l, i) => { const p = product(l.id); if (!p) return null; return (
          <li key={l.id + l.note} className="flex gap-3 py-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden bg-[#ECEAE7]">{img(p) && <img src={img(p)!} alt="" className="h-full w-full object-cover" />}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2"><p className="truncate font-display text-[1.25rem] uppercase leading-none">{split(p, p.cat).title}</p><p className="shrink-0 font-mono text-[13px] font-semibold tabular-nums">{weighed(p) ? '~' : ''}{euro(lineCents(p, l.qty))}</p></div>
              {l.note && <p className="mt-0.5 truncate text-[12.5px] text-ink-2">{l.note}</p>}
              <div className="mt-1.5 flex items-center justify-between"><Stepper small value={l.qty} onChange={(v) => cart.setQty(i, v)} min={minQty(p)} max={isWeight(p) ? 30 : 40} step={step(p)} format={(v) => fmtQty(p, v)} /><button type="button" onClick={() => cart.remove(i)} aria-label="Αφαίρεση" className="flex h-9 w-9 items-center justify-center text-ink-2 hover:text-red"><Trash size={17} /></button></div>
            </div>
          </li>) })}
      </ul>
      <div className="mt-3 border-t border-ink/15 pt-3">
        <div className="flex items-baseline justify-between"><span className="text-[15px] text-ink-2">Σύνολο{t.approx ? ', περίπου' : ''}</span><span className="font-mono text-xl font-semibold tabular-nums">{t.approx ? '~' : ''}{euro(t.cents)}</span></div>
        <button type="button" onClick={() => cart.openCart(true)} className="mt-3 flex w-full items-center justify-center bg-red py-4 font-display text-2xl uppercase tracking-wide text-ivory transition-colors hover:bg-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">Ολοκλήρωση παραγγελίας</button>
        <p className="mt-2 text-center font-mono text-[11px] text-ink-2">Δύο βήματα. Πληρώνεις όταν το παραλάβεις.</p>
      </div>
    </div>
  )
}

export default function OrderApp() {
  const reduced = useReducedMotion()
  const { lines } = useCart()
  const t = totals(lines)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(MENU[0].id)
  const [last] = useState(() => cart.last())
  const st = useMemo(() => status(), [])
  const sections = useRef<Record<string, HTMLElement | null>>({})
  const needle = fold(q.trim())
  const found = useMemo(() => (needle ? ALL.filter((p) => fold(p.name + ' ' + p.desc + ' ' + p.cat).includes(needle)) : []), [needle])

  useEffect(() => { document.title = 'Παράγγειλε τώρα · Κρεοπωλείο Το Τραμ, Πειραιάς'; return () => { document.title = 'Το Τραμ · Παραδοσιακό Κρεοπωλείο στον Πειραιά' } }, [])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id.replace('cat-', '')) }), { rootMargin: '-30% 0px -65% 0px' })
    Object.values(sections.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [needle])

  const jump = (id: string) => {
    setQ('')
    requestAnimationFrame(() => { const el = sections.current[id]; if (!el) return; const l = getLenis(); const y = el.getBoundingClientRect().top + scrollY - 150; l ? l.scrollTo(y, { duration: reduced ? 0 : 1 }) : scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' }) })
  }
  const lastCount = last?.lines.length ?? 0

  return (
    <main className="min-h-[100svh] bg-ivory pb-28 text-ink lg:pb-16">
      {/* the platform: where you are, whether we are open, why it is safe */}
      <header className="border-b border-ink/15 bg-ivory-2 px-5 pb-6 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-[1440px]">
          <h1 className="font-display text-[clamp(3rem,8vw,6.8rem)] uppercase leading-[.86]">Παράγγειλε τώρα</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="inline-flex items-center gap-2 font-mono text-[13px] font-semibold"><span className={cn('h-2.5 w-2.5', st.open ? 'bg-green' : 'bg-red')} aria-hidden />{st.text}</p>
            {st.sub && <p className="inline-flex items-center gap-2 font-mono text-[12.5px] text-ink-2"><Clock size={15} />{st.sub}</p>}
          </div>
          <ul className="mt-5 grid gap-2 text-[14px] text-ink-2 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-center gap-2"><Storefront size={18} className="shrink-0 text-ink" />Παραλαβή από {SHOP.address} ή διανομή στον Πειραιά</li>
            <li className="flex items-center gap-2"><Scales size={18} className="shrink-0 text-ink" />Ζυγίζεται όταν κοπεί, πληρώνεις ό,τι ζυγίσει</li>
            <li className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-ink" />Μοσχάρι και χοιρινό Ελασσόνας, κοτόπουλο Πίνδου</li>
            <li className="flex items-center gap-2"><Phone size={18} className="shrink-0 text-ink" />Απορία; <a href={SHOP.phoneHref} className="cut-link font-semibold text-ink">{SHOP.phone}</a></li>
          </ul>
        </div>
      </header>

      {/* rail + search, sticky under the header */}
      <div className="sticky top-16 z-30 border-b border-ink/15 bg-ivory/95 backdrop-blur md:top-20">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-5 md:px-8">
          <div role="radiogroup" aria-label="Κατηγορίες" className="flex min-w-0 flex-1 gap-6 overflow-x-auto py-3.5 [scrollbar-width:none]">
            {MENU.map((c) => { const on = !needle && active === c.id; return (
              <button key={c.id} type="button" role="radio" aria-checked={on} onClick={() => jump(c.id)} className={cn('relative shrink-0 pb-1.5 font-display text-[1.45rem] uppercase leading-none transition-colors focus-visible:outline-none focus-visible:text-red', on ? 'text-ink' : 'text-ink/45 hover:text-ink/80')}>
                {c.name}<sup className="ml-1 font-mono text-[10px] font-normal">{c.items.length}</sup>
                {on && <motion.span layoutId="rail" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34 }} className="absolute inset-x-0 -bottom-[1px] h-[3px] bg-red" />}
              </button>) })}
          </div>
          <label className="relative hidden w-[17rem] shrink-0 md:block">
            <span className="sr-only">Αναζήτηση</span>
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ψάξε: παϊδάκια, κιμάς, λουκάνικο" className="h-10 w-full border-b-2 border-ink/25 bg-transparent pl-7 pr-7 text-[15px] outline-none placeholder:text-ink-2/70 focus:border-red" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Καθαρισμός" className="absolute right-0 top-1/2 -translate-y-1/2 text-ink-2"><X size={16} /></button>}
          </label>
        </div>
        <label className="relative mx-5 mb-3 block md:hidden">
          <span className="sr-only">Αναζήτηση</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="Τι ψάχνεις;" className="h-11 w-full border border-ink/25 bg-ivory pl-10 pr-3 text-[16px] outline-none focus:border-ink" />
        </label>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 pt-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {needle ? (
            <section aria-live="polite">
              <h2 className="font-display text-3xl uppercase">{found.length ? `${found.length} για «${q.trim()}»` : `Δεν βρήκαμε «${q.trim()}»`}</h2>
              {found.length === 0 && <p className="mt-2 text-ink-2">Πάρε μας στο <a href={SHOP.phoneHref} className="cut-link text-ink">{SHOP.phone}</a>. Μπορεί να το έχουμε στο ψυγείο.</p>}
              <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3" style={{ gridAutoRows: '1fr' }}>{found.map((p) => <li key={p.id} className="min-w-0"><ProductCard p={p} /></li>)}</ul>
            </section>
          ) : (
            <>
              {lastCount > 0 && (
                <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border border-ink/20 bg-ivory-2 p-4 md:p-5">
                  <div>
                    <p className="font-display text-2xl uppercase leading-none">Τα ίδια με την άλλη φορά;</p>
                    <p className="mt-1 text-[14px] text-ink-2">{last!.lines.slice(0, 3).map((l) => { const p = product(l.id)!; return `${fmtQty(p, l.qty)} ${split(p, p.cat).title}` }).join(', ')}{lastCount > 3 ? ` και ${lastCount - 3} ακόμα` : ''}</p>
                  </div>
                  <button type="button" onClick={() => cart.reorder()} className="inline-flex items-center gap-2 border-2 border-ink px-4 py-2.5 font-display text-xl uppercase transition-colors hover:bg-ink hover:text-ivory"><ArrowCounterClockwise size={18} weight="bold" /> Βάλ' τα στο καλάθι</button>
                </div>
              )}
              <section className="mb-12">
                <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] uppercase leading-none">Τα πιο αγαπημένα</h2>
                <p className="mt-1 text-[14.5px] text-ink-2">Αυτά φεύγουν πρώτα από τη βιτρίνα.</p>
                <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3" style={{ gridAutoRows: '1fr' }}>{PICKS.map((id) => ALL.find((p) => p.id === id)).filter(Boolean).map((p) => <li key={p!.id} className="min-w-0"><ProductCard p={p!} /></li>)}</ul>
              </section>
              {MENU.map((c) => (
                <section key={c.id} id={`cat-${c.id}`} ref={(el) => { sections.current[c.id] = el }} className="mb-12 scroll-mt-40">
                  <h2 className="border-b border-ink/15 pb-2 font-display text-[clamp(2rem,3.4vw,2.8rem)] uppercase leading-none">{c.name}<span className="ml-2 align-top font-mono text-[12px] text-ink-2">{c.items.length}</span></h2>
                  <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3" style={{ gridAutoRows: '1fr' }}>{c.items.map((p) => <li key={p.id} className="min-w-0"><ProductCard p={{ ...p, cat: c.name }} /></li>)}</ul>
                </section>
              ))}
            </>
          )}
        </div>

        {/* the basket, always in view on desktop */}
        <aside className="hidden lg:block" aria-label="Καλάθι">
          <div className="sticky top-44">
            <div className="flex items-baseline justify-between"><h2 className="font-display text-3xl uppercase">Το καλάθι σου</h2>{t.count > 0 && <span className="font-mono text-[12px] text-ink-2">{t.count} {t.count === 1 ? 'είδος' : 'είδη'}</span>}</div>
            <div className="mt-3"><Basket_ /></div>
          </div>
        </aside>
      </div>

      {/* phones: the basket bar */}
      <div className={cn('fixed inset-x-0 bottom-0 z-[55] bg-ink p-[6px] pb-[max(6px,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden', t.count ? 'translate-y-0' : 'translate-y-full')}>
        <button type="button" data-cart-target onClick={() => cart.openCart()} className="flex h-14 w-full items-center justify-between bg-red px-4 text-ivory">
          <span className="flex items-center gap-2 font-mono text-[13px] font-semibold"><span className="relative"><span data-ping aria-hidden className="absolute inset-0 border-2 border-ivory opacity-0" /><Basket size={20} weight="bold" /></span>{t.count} {t.count === 1 ? 'είδος' : 'είδη'}</span>
          <span className="font-display text-xl uppercase tracking-wide">Δες το καλάθι</span>
          <span className="font-mono text-[14px] font-semibold tabular-nums">{t.approx ? '~' : ''}{euro(t.cents)}</span>
        </button>
      </div>
    </main>
  )
}
