/**
 * One product, opened from the catalogue: photo, where it comes from, the price, how to cut it,
 * how much, and into the basket. The photo flies to the basket on add.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import Panel from '@/components/Panel'
import Stepper from '@/components/Stepper'
import { CUTS, cart, defaultQty, euro, fmtQty, img, isWeight, lineCents, minQty, price, product, split, step, useCart, weighed } from '@/lib/cart'
import { flyToCart } from '@/lib/fly'
import { cn } from '@/lib/cn'

export default function ProductSheet() {
  const { sheet } = useCart()
  const p = sheet ? product(sheet) : undefined
  const reduced = useReducedMotion()
  const [qty, setQty] = useState(1)
  const [cut, setCut] = useState('')
  const [note, setNote] = useState('')
  const photo = useRef<HTMLDivElement>(null)

  useEffect(() => { if (p) { setQty(defaultQty(p)); setCut(''); setNote('') } }, [p])

  const keep = useRef(p); if (p) keep.current = p
  const q = keep.current
  const cuts = q ? CUTS[q.cat] ?? [] : []
  const full = [cut, note.trim()].filter(Boolean).join(' · ')

  const add = () => {
    if (!q) return
    void flyToCart(photo.current, img(q))
    cart.add(q.id, qty, full)
    cart.closeSheet()
  }

  return (
    <Panel open={Boolean(p)} onClose={cart.closeSheet} label={q ? split(q, q.cat).title : 'Προϊόν'} width={560}
      title={q && <div><p className="font-mono text-[11px] uppercase text-ink-2">{split(q, q.cat).tag}</p><h3 className="mt-1 font-display text-[clamp(2rem,5vw,2.8rem)] uppercase leading-[.92]">{split(q, q.cat).title}</h3></div>}
      footer={q && (
        <div className="flex items-center gap-3">
          <Stepper value={qty} onChange={setQty} min={minQty(q)} max={isWeight(q) ? 30 : 40} step={step(q)} format={(v) => fmtQty(q, v)} />
          <motion.button type="button" data-autofocus onClick={add} whileTap={reduced ? undefined : { scale: 0.97 }}
            className="flex h-11 min-w-0 flex-1 items-center justify-between gap-2 whitespace-nowrap bg-red px-3 font-display text-lg uppercase md:px-4 md:text-xl tracking-wide text-ivory transition-colors hover:bg-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">
            <span>Στο καλάθι</span><span className="font-mono text-[13px] font-semibold tabular-nums md:text-[14px]">{weighed(q) ? '~' : ''}{euro(lineCents(q, qty))}</span>
          </motion.button>
        </div>
      )}>
      {q && (
        <div className="pb-6">
          <div ref={photo} className="relative aspect-[16/10] overflow-hidden bg-[#ECEAE7]">
            {img(q) ? <img src={img(q, true)!} alt={q.name} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center"><img src="/media/tram-mark.png" alt="" className="w-1/4 opacity-25" /></div>}
          </div>
          <div className="px-5 pt-5 md:px-7">
            <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-4">
              <p className="max-w-[40ch] text-[15.5px] leading-snug text-ink-2">{q.desc || 'Κομμένο την ώρα που το ζητάς.'}</p>
              <p className="shrink-0 text-right"><span className="block font-mono text-lg font-semibold tabular-nums">{price(q).main}</span><span className="block font-mono text-[11px] text-ink-2">{price(q).sub}</span></p>
            </div>

            {cuts.length > 0 && (
              <fieldset className="mt-5">
                <legend className="font-mono text-[12px] text-ink-2">Πώς να το κόψουμε</legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {cuts.map((c) => (
                    <label key={c} className={cn('relative flex min-h-12 cursor-pointer items-center border px-3 py-2 text-[14.5px] font-medium transition-colors', cut === c ? 'border-ink bg-ink text-ivory' : 'border-ink/25 hover:border-ink')}>
                      <input type="radio" name="cut" value={c} checked={cut === c} onChange={() => setCut(c)} onClick={() => { if (cut === c) setCut('') }} className="sr-only" />
                      <span className={cn('mr-2.5 h-3 w-3 shrink-0 border', cut === c ? 'border-ivory bg-red' : 'border-ink/40')} aria-hidden />{c}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <label className="mt-5 block">
              <span className="font-mono text-[12px] text-ink-2">Σημείωση για τον χασάπη</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="π.χ. χοντρές φέτες, χωρίς λίπος, για 6 άτομα" className="mt-2 w-full resize-none border border-ink/25 bg-ivory px-3 py-2 text-[15px] focus:border-ink focus:outline-none" />
            </label>
            {weighed(q) && <p className="mt-3 font-mono text-[11.5px] text-ink-2">Η τελική τιμή βγαίνει στη ζυγαριά. Πληρώνεις ό,τι ζυγίσει.</p>}
          </div>
        </div>
      )}
    </Panel>
  )
}
