/**
 * Ο πάγκος: the shop's whole Orderoo menu on the site, with its prices, and every item one tap
 * from the online order. Ported from 21st.dev "Filter Grid" by ddoemonn
 * (https://21st.dev/@ddoemonn/components/filter-grid).
 * Kept: radiogroup filters with live per-filter counts, a thumb that slides between filters
 * (layoutId), arrow/Home/End keys, cells that reflow with a spring (popLayout) and fade out fast,
 * reduced-motion fallbacks, the polite live region. Changed: the filters are big condensed words
 * with a red rule under the active one (no chips), the grid grows instead of scrolling inside a box,
 * the cells are same-size product cards with the Orderoo marble photos, the shop's own copy and the
 * price per kilo, and each one opens the order.
 */
import { useCallback, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight, MagnifyingGlass } from '@phosphor-icons/react'
import Btn from '@/components/Btn'
import { MENU, ORDEROO, type Product } from '@/lib/menu'
import { cn } from '@/lib/cn'

const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const
const MOVE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const
const EASE = [0.23, 1, 0.32, 1] as const
const LEAVE = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const
const INSTANT = { duration: 0 } as const

const ORIGINS = ['Ελασσόνας', 'Πίνδος', 'Νάξου', 'Νιτσιάκος', 'Κρήτης', 'Ρεθύμνου', 'Αμφιλοχίας']
const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €'

/** "Κόντρα Νεαρό Μοσχάρι Ελληνικό Ελασσόνας" -> title "Κόντρα", tag "Νεαρό μοσχάρι · Ελασσόνας" */
function split(p: Product, cat: string) {
  let t = p.name
  const origin = ORIGINS.find((o) => t.includes(o))
  const greek = /Ελληνικ[όήά]/.test(t)
  t = t.replace(/\s*Ελληνικ[όήά]\s*/g, ' ')
  if (origin) t = t.replace(origin, ' ')
  t = t.replace(/\s+Νεαρό Μοσχάρι/, '').replace(/\s+Χοιριν[όή](?=\s|$)/, '').replace(/\s+/g, ' ').trim()
  const kind = /Νεαρό Μοσχάρι/.test(p.name) ? 'Νεαρό μοσχάρι' : cat
  const tag = [kind, origin ?? (greek ? 'Ελληνικό' : null)].filter(Boolean).join(' · ')
  return { title: t, tag }
}

function price(p: Product) {
  if (p.sale === 'PIECE_BY_WEIGHT' && p.grams && p.perKg) return { main: `~${euro(Math.round((p.perKg * p.grams) / 1000))}`, sub: `το κομμάτι, ~${(p.grams / 1000).toString().replace('.', ',')} kg · ${euro(p.perKg)}/kg` }
  if (p.sale === 'WEIGHT') return { main: euro(p.cents), sub: 'το κιλό' }
  return { main: euro(p.cents), sub: 'το τεμάχιο' }
}

type Item = Product & { cat: string }
const ITEMS: Item[] = MENU.flatMap((c) => c.items.map((p) => ({ ...p, cat: c.name })))
const FILTERS = MENU.map((c) => ({ id: c.id, label: c.name }))

function Card({ p }: { p: Item }) {
  const { title, tag } = split(p, p.cat)
  const pr = price(p)
  return (
    <a href={ORDEROO} target="_blank" rel="noopener" className="group flex h-full flex-col bg-ivory text-ink outline-none focus-visible:ring-2 focus-visible:ring-red">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#ECEAE7]">
        {p.img ? (
          <img src={`/media/p/${p.img}-sm.webp`} srcSet={`/media/p/${p.img}-sm.webp 640w, /media/p/${p.img}.webp 1600w`} sizes="(min-width: 1024px) 25vw, 50vw" alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#F1EFEC,#E2DED8)]">
            <img src="/media/tram-mark.png" alt="" className="w-1/3 opacity-25" />
          </div>
        )}
        <span className="absolute left-2 top-2 bg-ivory/90 px-2 py-[3px] font-mono text-[10.5px] text-ink-2 md:left-3 md:top-3">{tag}</span>
      </div>
      <div className="flex flex-1 flex-col border-x border-b border-ink/15 p-3 md:p-4">
        <h3 className="line-clamp-2 min-h-[2em] font-display text-[clamp(1.25rem,2vw,1.7rem)] uppercase leading-[1]">{title}</h3>
        <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-2 md:text-[14.5px]">{p.desc || ' '}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-mono text-[15px] font-semibold tabular-nums md:text-[17px]">{pr.main}</p>
            <p className="font-mono text-[10.5px] text-ink-2">{pr.sub}</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red text-ivory transition-transform duration-300 group-hover:-translate-y-0.5" aria-hidden><ArrowUpRight size={18} weight="bold" /></span>
        </div>
      </div>
    </a>
  )
}

export default function Catalogue() {
  const uid = useId()
  const reduced = useReducedMotion()
  const [active, setActive] = useState(FILTERS[0].id)
  const [q, setQ] = useState('')
  const chips = useRef<(HTMLButtonElement | null)[]>([])
  const top = useRef<HTMLDivElement>(null)

  const counts = useMemo(() => Object.fromEntries(MENU.map((c) => [c.id, c.items.length])), [])
  const needle = q.trim().toLocaleLowerCase('el').normalize('NFD').replace(/\p{M}/gu, '')
  const visible = useMemo(() => {
    if (needle) return ITEMS.filter((p) => (p.name + ' ' + p.desc).toLocaleLowerCase('el').normalize('NFD').replace(/\p{M}/gu, '').includes(needle))
    return ITEMS.filter((p) => MENU.find((c) => c.id === active)?.items.some((x) => x.id === p.id))
  }, [active, needle])
  const index = Math.max(0, FILTERS.findIndex((f) => f.id === active))
  const activeLabel = needle ? `«${q.trim()}»` : FILTERS[index].label

  const choose = useCallback((id: string) => { setQ(''); setActive(id) }, [])
  const go = (i: number) => { const n = (i + FILTERS.length) % FILTERS.length; chips.current[n]?.focus(); choose(FILTERS[n].id) }
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(i + 1) }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(i - 1) }
    else if (e.key === 'Home') { e.preventDefault(); go(0) }
    else if (e.key === 'End') { e.preventDefault(); go(FILTERS.length - 1) }
  }
  const step = reduced ? INSTANT : { layout: MOVE, duration: 0.2, ease: EASE }
  const leave = reduced ? INSTANT : LEAVE

  return (
    <section id="pagkos" className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-8 md:pt-32">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(3.4rem,9vw,8.4rem)] uppercase leading-[.86]">Ο πάγκος,<br />με τιμές</h2>
          </div>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-lg text-ink-2">Ό,τι έχει σήμερα η βιτρίνα, με την τιμή του. Διάλεξε, παράγγειλε online και πέρνα να το πάρεις: είναι έτοιμο σε 15 με 25 λεπτά.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Btn href={ORDEROO} target="_blank">Παράγγειλε online</Btn>
            </div>
          </div>
        </div>

        <div ref={top} className="sticky top-16 z-20 -mx-5 mt-14 md:top-20 border-b border-ink/15 bg-ivory/95 px-5 backdrop-blur md:-mx-8 md:px-8">
          <div className="flex items-center gap-4">
            <div role="radiogroup" aria-label="Κατηγορία" aria-controls={`${uid}-grid`} className="flex min-w-0 flex-1 gap-6 overflow-x-auto py-4 [scrollbar-width:none] md:gap-7">
              {FILTERS.map((f, i) => {
                const on = i === index && !needle
                return (
                  <button key={f.id} ref={(n) => { chips.current[i] = n }} type="button" role="radio" aria-checked={on} tabIndex={on || (needle && i === 0) ? 0 : -1}
                    onClick={() => { choose(f.id); top.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' }) }} onKeyDown={(e) => onKeyDown(e, i)}
                    className={cn('relative shrink-0 pb-2 font-display text-[clamp(1.45rem,2.05vw,2.1rem)] uppercase leading-none outline-none transition-colors focus-visible:text-red', on ? 'text-ink' : 'text-ink/40 hover:text-ink/75')} style={{ touchAction: 'manipulation' }}>
                    {f.label}<sup className="ml-1 font-mono text-[11px] font-normal tabular-nums">{counts[f.id]}</sup>
                    {on && <motion.span aria-hidden layoutId={reduced ? undefined : `${uid}-thumb`} transition={CELL} className="absolute inset-x-0 -bottom-[1px] h-[3px] bg-red" />}
                  </button>
                )
              })}
            </div>
            <label className="relative hidden shrink-0 md:block">
              <span className="sr-only">Αναζήτηση</span>
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-ink-2" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ψάξε: παϊδάκια, κιμάς…" className="h-10 w-[15rem] border-b-2 border-ink/25 bg-transparent pl-7 text-[15px] outline-none placeholder:text-ink-2/70 focus:border-red" />
            </label>
          </div>
        </div>

        <ul id={`${uid}-grid`} className="mt-6 grid grid-cols-2 gap-3 pb-6 md:gap-5 lg:grid-cols-4" style={{ gridAutoRows: '1fr' }}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p) => (
              <motion.li key={p.id} layout={reduced ? false : 'position'} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: leave }} transition={step} className="min-w-0">
                <Card p={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {visible.length === 0 && <p className="py-16 text-center text-ink-2">Δεν το βρήκαμε στον πάγκο. Πάρε τηλέφωνο, μπορεί να το έχουμε στο ψυγείο.</p>}
        <p aria-live="polite" className="sr-only">{activeLabel}: {visible.length} από {ITEMS.length}</p>
        <p className="pb-24 pt-4 font-mono text-[11.5px] text-ink-2 md:pb-32">Οι τιμές είναι του online καταλόγου μας και μπορεί να αλλάξουν. Για ποσότητες γιορτής, πάρε τηλέφωνο.</p>
      </div>
    </section>
  )
}
