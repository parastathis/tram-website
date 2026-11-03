/**
 * Order sheet. The quantity control is ported from 21st.dev "Quantity Stepper" by arihantcodes
 * https://21st.dev/@arihantcodes_1f7b8c4d/components/quantity-stepper
 * Kept: rolling digits in the direction of travel, press squish, boundary shake, hold-to-repeat.
 * Changed: square corners, 0.5 kg steps, brand colours. The sheet ends in WhatsApp or a phone call,
 * because the shop takes orders by phone today.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { Minus, Plus } from '@phosphor-icons/react'
import Btn from '@/components/Btn'
import { SHOP, STOPS } from '@/lib/data'
import { ORDEROO } from '@/lib/menu'
import { cn } from '@/lib/cn'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const variants = { enter: (d: number) => ({ y: d * 12, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d: number) => ({ y: d * -12, opacity: 0 }) }

function Stepper({ value, onChange, min = 0, max = 20, step = 0.5 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  const reduced = useReducedMotion()
  const [dir, setDir] = useState(1)
  const [flash, setFlash] = useState(0)
  const shake = useAnimationControls()
  const ref = useRef(value); useEffect(() => { ref.current = value }, [value])
  const timers = useRef<{ d: ReturnType<typeof setTimeout> | null; i: ReturnType<typeof setInterval> | null }>({ d: null, i: null })
  const stop = useCallback(() => { if (timers.current.d) clearTimeout(timers.current.d); if (timers.current.i) clearInterval(timers.current.i); timers.current = { d: null, i: null } }, [])
  useEffect(() => stop, [stop])
  useEffect(() => {
    if (!flash) return
    if (!reduced) { shake.set({ x: 0 }); void shake.start({ x: [0, -4, 4, -2, 2, 0], transition: { duration: 0.3 } }) }
    const id = setTimeout(() => setFlash(0), 400); return () => clearTimeout(id)
  }, [flash, reduced, shake])
  const stepBy = useCallback((delta: number) => {
    const next = clamp(Math.round((ref.current + delta) * 2) / 2, min, max)
    if (next === ref.current) { setFlash((f) => f + 1); return false }
    ref.current = next; setDir(delta > 0 ? 1 : -1); onChange(next); return true
  }, [min, max, onChange])
  const hold = (delta: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    stop(); if (!stepBy(delta)) return
    timers.current.d = setTimeout(() => { timers.current.i = setInterval(() => { if (!stepBy(delta)) stop() }, 110) }, 420)
  }
  const btn = 'flex h-11 w-11 touch-manipulation items-center justify-center transition-colors hover:bg-ink/5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ink'
  return (
    <div role="group" aria-label="Ποσότητα" className="inline-flex select-none items-center border border-ink/25 bg-tile">
      <motion.button type="button" tabIndex={-1} aria-label="Λιγότερο" onPointerDown={hold(-step)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, value <= min && 'opacity-40')}><Minus size={16} weight="bold" /></motion.button>
      <motion.span role="spinbutton" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-label="Κιλά" tabIndex={0} animate={shake}
        onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); stepBy(step) } if (e.key === 'ArrowDown') { e.preventDefault(); stepBy(-step) } }}
        className={cn('flex h-11 min-w-[72px] items-center justify-center overflow-hidden px-1 font-mono text-sm font-semibold tabular-nums', flash ? 'text-red' : 'text-ink')}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span key={value} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={reduced || flash ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }} className="inline-block">{value.toFixed(1).replace('.0', '')} kg</motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.button type="button" tabIndex={-1} aria-label="Περισσότερο" onPointerDown={hold(step)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, value >= max && 'opacity-40')}><Plus size={16} weight="bold" /></motion.button>
    </div>
  )
}

const KINDS = STOPS.filter((s) => s.id !== 'katepsygmena').map((s) => s.title)

export default function Order() {
  const [kind, setKind] = useState(KINDS[0])
  const [kg, setKg] = useState(1)
  const [day, setDay] = useState('')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const msg = `Γεια σας, θα ήθελα να παραγγείλω ${kg} kg ${kind}${day ? ` για παραλαβή ${day}` : ''}.${note ? ` ${note}` : ''}${name ? ` Όνομα: ${name}.` : ''}`
  const wa = `${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`

  return (
    <section id="paraggelia" className="bg-ivory-2 text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
          <div>
            <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Παραγγελία για παραλαβή.</h2>
            <p className="mt-4 max-w-[44ch] text-lg text-ink-2">Ο πιο γρήγορος δρόμος είναι το online καλάθι μας: διαλέγεις, πληρώνεις και περνάς σε 15 με 25 λεπτά. Για το τραπέζι της Κυριακής, το Πάσχα ή τα Χριστούγεννα, γράψε μας εδώ τι θέλεις και πότε περνάς.</p>
            <div className="mt-8"><Btn href={ORDEROO} target="_blank">Online καλάθι</Btn></div>
            <ul className="mt-8 space-y-2 text-[15px] text-ink-2">
              <li>Παραλαβή από το κατάστημα, Σπάρτης & Σαλαμίνος 124.</li>
              <li>Οι παραγγελίες γιορτών κλείνουν λίγες μέρες πριν. Ρώτα μας νωρίς.</li>
              <li>Απαντάμε στο τηλέφωνο τις ώρες λειτουργίας.</li>
            </ul>
          </div>

          <form className="order-sheet border border-ink/20 bg-ivory p-6 md:p-8" onSubmit={(e) => { e.preventDefault(); window.open(wa, '_blank', 'noopener') }}>
            <fieldset>
              <legend className="font-mono text-[12px] text-ink-2">Είδος</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {KINDS.map((k) => (
                  <label key={k} className={cn('cursor-pointer border px-3 py-3 text-center text-sm font-medium transition-colors', kind === k ? 'border-red bg-red text-ivory' : 'border-ink/25 hover:border-ink')}>
                    <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />{k}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-6 flex flex-wrap items-end gap-6">
              <div>
                <p className="font-mono text-[12px] text-ink-2">Ποσότητα</p>
                <div className="mt-3"><Stepper value={kg} onChange={setKg} min={0.5} max={30} /></div>
              </div>
              <label className="flex-1 min-w-[160px]">
                <span className="font-mono text-[12px] text-ink-2">Παραλαβή</span>
                <input type="text" value={day} onChange={(e) => setDay(e.target.value)} placeholder="π.χ. Σάββατο πρωί" className="mt-3 h-11 w-full border border-ink/25 bg-ivory px-3 text-sm focus:border-ink focus:outline-none" />
              </label>
            </div>
            <label className="mt-6 block">
              <span className="font-mono text-[12px] text-ink-2">Όνομα</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="mt-3 h-11 w-full border border-ink/25 bg-ivory px-3 text-sm focus:border-ink focus:outline-none" />
            </label>
            <label className="mt-6 block">
              <span className="font-mono text-[12px] text-ink-2">Σημείωση</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="κομμένο για σούβλα, χωρίς κόκαλο..." className="mt-3 w-full border border-ink/25 bg-ivory px-3 py-2 text-sm focus:border-ink focus:outline-none" />
            </label>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Btn type="submit">Στείλε στο WhatsApp</Btn>
              <Btn href={SHOP.phoneHref} variant="ghost">Πάρε τηλέφωνο</Btn>
            </div>
            <p className="mt-4 font-mono text-[11px] text-ink-2">Ανοίγει το WhatsApp με έτοιμο μήνυμα προς το {SHOP.mobile}. Δεν αποθηκεύουμε τίποτα.</p>
          </form>
        </div>
      </div>
    </section>
  )
}
