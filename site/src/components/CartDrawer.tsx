/**
 * The basket and the checkout, in three steps inside one drawer: what you picked, when and how
 * you get it, and the receipt. The order is sent to the shop's mobile as a ready WhatsApp message
 * (or SMS), because the shop takes orders on that phone; payment happens at the counter or on
 * delivery. Nothing is stored anywhere but this browser.
 */
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Basket, ChatCircleText, Storefront, Trash, Truck, WhatsappLogo, CheckCircle } from '@phosphor-icons/react'
import Panel from '@/components/Panel'
import Stepper from '@/components/Stepper'
import { cart, euro, fmtQty, img, isWeight, lineCents, minQty, product, split, step, totals, useCart, weighed, type Line } from '@/lib/cart'
import { DAYS, HOURS, SHOP } from '@/lib/data'
import { cn } from '@/lib/cn'

type StepId = 'cart' | 'details' | 'done'
type Slot = { day: string; label: string; times: string[] }

const pad = (n: number) => String(n).padStart(2, '0')
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }

/** the next four days the shop is open, in half hours, starting 45 minutes from now */
function slots(now = new Date()): Slot[] {
  const out: Slot[] = []
  for (let d = 0; out.length < 4 && d < 10; d++) {
    const day = new Date(now); day.setDate(now.getDate() + d)
    const ranges = HOURS[day.getDay()]
    if (!ranges.length) continue
    const earliest = d === 0 ? now.getHours() * 60 + now.getMinutes() + 45 : 0
    const times: string[] = []
    ranges.forEach(([a, b]) => { for (let m = toMin(a) + 30; m <= toMin(b) - 30; m += 30) if (m >= earliest) times.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`) })
    if (!times.length) continue
    const label = d === 0 ? 'Σήμερα' : d === 1 ? 'Αύριο' : DAYS[day.getDay()]
    out.push({ day: `${label} ${day.getDate()}/${day.getMonth() + 1}`, label, times })
  }
  return out
}

function LineRow({ l, i }: { l: Line; i: number }) {
  const p = product(l.id)
  if (!p) return null
  const { title } = split(p, p.cat)
  return (
    <motion.li layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24, transition: { duration: 0.18 } }} className="flex gap-3 border-b border-ink/12 py-4">
      <div className="h-[72px] w-[72px] shrink-0 overflow-hidden bg-[#ECEAE7]">{img(p) && <img src={img(p)!} alt="" className="h-full w-full object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[1.45rem] uppercase leading-[.95]">{title}</p>
          <p className="shrink-0 font-mono text-[14px] font-semibold tabular-nums">{weighed(p) ? '~' : ''}{euro(lineCents(p, l.qty))}</p>
        </div>
        {l.note && <p className="mt-1 text-[13.5px] text-ink-2">{l.note}</p>}
        <div className="mt-2 flex items-center justify-between gap-2">
          <Stepper small value={l.qty} onChange={(v) => cart.setQty(i, v)} min={minQty(p)} max={isWeight(p) ? 30 : 40} step={step(p)} format={(v) => fmtQty(p, v)} />
          <button type="button" onClick={() => cart.remove(i)} aria-label={`Αφαίρεσε ${title}`} className="flex h-9 w-9 items-center justify-center text-ink-2 transition-colors hover:bg-ink/5 hover:text-red"><Trash size={18} /></button>
        </div>
      </div>
    </motion.li>
  )
}

function Choice({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return <button type="button" role="radio" aria-checked={on} onClick={onClick} className={cn('border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red', on ? 'border-ink bg-ink text-ivory' : 'border-ink/25 hover:border-ink', className)}>{children}</button>
}

export default function CartDrawer() {
  const { lines, open } = useCart()
  const reduced = useReducedMotion()
  const [stepId, setStep] = useState<StepId>('cart')
  const [method, setMethod] = useState<'pickup' | 'delivery'>('pickup')
  const days = useMemo(() => slots(), [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const [day, setDay] = useState(0)
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState<{ code: string; text: string; total: string } | null>(null)
  const [tried, setTried] = useState(false)
  const t = totals(lines)

  useEffect(() => { if (open && stepId === 'done' && !sent) setStep('cart') }, [open, stepId, sent])
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem('tram-me') || '{}'); setName(v.name || ''); setPhone(v.phone || ''); setAddress(v.address || '') } catch { /* none */ } }, [])
  useEffect(() => { setTime('') }, [day])

  const slot = days[day]
  const okPhone = phone.replace(/\D/g, '').length >= 10
  const valid = name.trim().length > 1 && okPhone && Boolean(slot && time) && (method === 'pickup' || address.trim().length > 4)

  const message = (code: string) => {
    const rows = lines.map((l) => { const p = product(l.id)!; return `• ${fmtQty(p, l.qty)} ${p.name}${l.note ? ` (${l.note})` : ''}  ${weighed(p) ? '~' : ''}${euro(lineCents(p, l.qty))}` })
    const info = [
      `Σύνολο: ${t.approx ? '~' : ''}${euro(t.cents)}${t.approx ? ' (τελικό στη ζυγαριά)' : ''}`,
      method === 'pickup' ? `Παραλαβή από το μαγαζί: ${slot?.day} ${time}` : `Διανομή: ${slot?.day} ${time}\nΔιεύθυνση: ${address.trim()}`,
      `Όνομα: ${name.trim()}`,
      `Τηλέφωνο: ${phone.trim()}`,
      ...(note.trim() ? [`Σημείωση: ${note.trim()}`] : []),
    ]
    return [`Παραγγελία ${code} από το site`, '', ...rows, '', ...info].join('\n')
  }

  const send = (via: 'wa' | 'sms') => {
    setTried(true)
    if (!valid) return
    const code = 'T' + Date.now().toString(36).slice(-5).toUpperCase()
    const text = message(code)
    try { localStorage.setItem('tram-me', JSON.stringify({ name, phone, address })) } catch { /* none */ }
    const href = via === 'wa' ? `${SHOP.whatsapp}?text=${encodeURIComponent(text)}` : `sms:+306947884743?&body=${encodeURIComponent(text)}`
    window.open(href, via === 'wa' ? '_blank' : '_self', 'noopener')
    setSent({ code, text, total: `${t.approx ? '~' : ''}${euro(t.cents)}` })
    cart.clear()
    setStep('done')
  }

  const close = () => { cart.closeCart(); if (stepId === 'done') { setSent(null); setStep('cart') } }
  const slide = reduced ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] as const } }
  const err = (bad: boolean) => tried && bad
  const field = 'mt-2 h-12 w-full border bg-ivory px-3 text-[15.5px] focus:border-ink focus:outline-none'

  const title = (
    <div className="flex items-center gap-3">
      {stepId === 'details' && <button type="button" onClick={() => setStep('cart')} aria-label="Πίσω στο καλάθι" className="-ml-2 flex h-11 w-11 items-center justify-center hover:bg-ink/5"><ArrowLeft size={20} weight="bold" /></button>}
      <div>
        <p className="font-mono text-[11px] uppercase text-ink-2">{stepId === 'cart' ? `${t.count} ${t.count === 1 ? 'είδος' : 'είδη'}` : stepId === 'details' ? 'Βήμα 2 από 2' : 'Στάλθηκε'}</p>
        <h3 className="mt-1 font-display text-[2.4rem] uppercase leading-[.9]">{stepId === 'cart' ? 'Το καλάθι σου' : stepId === 'details' ? 'Πότε και πώς' : 'Ευχαριστούμε'}</h3>
      </div>
    </div>
  )

  const footer = stepId === 'cart' ? (lines.length > 0 && (
    <div>
      <div className="flex items-baseline justify-between"><span className="text-[15px] text-ink-2">Σύνολο{t.approx ? ', περίπου' : ''}</span><span className="font-mono text-xl font-semibold tabular-nums">{t.approx ? '~' : ''}{euro(t.cents)}</span></div>
      <button type="button" onClick={() => { setTried(false); setStep('details') }} className="mt-3 flex h-13 w-full items-center justify-center bg-red py-3.5 font-display text-2xl uppercase tracking-wide text-ivory transition-colors hover:bg-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2">Συνέχεια</button>
    </div>
  )) : stepId === 'details' ? (
    <div>
      <div className="flex items-baseline justify-between"><span className="text-[15px] text-ink-2">Πληρώνεις {method === 'pickup' ? 'στο μαγαζί' : 'στην παράδοση'}</span><span className="font-mono text-xl font-semibold tabular-nums">{t.approx ? '~' : ''}{euro(t.cents)}</span></div>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <button type="button" onClick={() => send('wa')} className="flex items-center justify-center gap-2 bg-green py-3.5 font-display text-2xl uppercase tracking-wide text-ivory transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"><WhatsappLogo size={22} weight="bold" /> Στείλε την παραγγελία</button>
        <button type="button" onClick={() => send('sms')} aria-label="Στείλε με SMS" className="flex w-14 items-center justify-center border-2 border-ink transition-colors hover:bg-ink hover:text-ivory"><ChatCircleText size={22} weight="bold" /></button>
      </div>
      {tried && !valid && <p role="alert" className="mt-2 text-[13.5px] font-medium text-red">Συμπλήρωσε όνομα, κινητό{method === 'delivery' ? ', διεύθυνση' : ''} και ώρα.</p>}
    </div>
  ) : (
    <button type="button" onClick={close} className="flex w-full items-center justify-center border-2 border-ink py-3.5 font-display text-2xl uppercase tracking-wide transition-colors hover:bg-ink hover:text-ivory">Πίσω στο site</button>
  )

  return (
    <Panel open={open} onClose={close} title={title} footer={footer} label="Καλάθι">
      <AnimatePresence mode="wait" initial={false}>
        {stepId === 'cart' && (
          <motion.div key="cart" {...slide} className="px-5 md:px-7">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Basket size={44} className="text-ink/30" />
                <p className="mt-4 font-display text-3xl uppercase">Άδειο ακόμα</p>
                <p className="mt-2 max-w-[30ch] text-ink-2">Διάλεξε από τον πάγκο και θα το έχουμε έτοιμο όταν περάσεις.</p>
                <a href="#pagkos" onClick={() => cart.closeCart()} className="cut-link mt-6 font-display text-xl uppercase">Στον πάγκο</a>
              </div>
            ) : (
              <ul><AnimatePresence initial={false}>{lines.map((l, i) => <LineRow key={l.id + l.note} l={l} i={i} />)}</AnimatePresence></ul>
            )}
            {lines.length > 0 && t.approx && <p className="py-4 font-mono text-[11.5px] text-ink-2">Τα κρέατα ζυγίζονται όταν κοπούν, οπότε το ποσό μπορεί να βγει λίγο πάνω ή κάτω.</p>}
          </motion.div>
        )}

        {stepId === 'details' && (
          <motion.div key="details" {...slide} className="space-y-6 px-5 py-5 md:px-7">
            <div role="radiogroup" aria-label="Τρόπος" className="grid grid-cols-2 gap-2">
              <Choice on={method === 'pickup'} onClick={() => setMethod('pickup')} className="p-3"><Storefront size={22} weight="bold" /><span className="mt-2 block font-display text-xl uppercase leading-none">Παραλαβή</span><span className={cn('mt-1 block text-[13px]', method === 'pickup' ? 'text-ivory/75' : 'text-ink-2')}>{SHOP.address}</span></Choice>
              <Choice on={method === 'delivery'} onClick={() => setMethod('delivery')} className="p-3"><Truck size={22} weight="bold" /><span className="mt-2 block font-display text-xl uppercase leading-none">Διανομή</span><span className={cn('mt-1 block text-[13px]', method === 'delivery' ? 'text-ivory/75' : 'text-ink-2')}>Σε όλο τον Πειραιά</span></Choice>
            </div>
            {method === 'delivery' && <p className="-mt-3 font-mono text-[11.5px] text-ink-2">Σε παίρνουμε τηλέφωνο να επιβεβαιώσουμε ώρα και κόστος διανομής.</p>}

            <div>
              <p className="font-mono text-[12px] text-ink-2">Μέρα</p>
              <div role="radiogroup" aria-label="Μέρα" className="mt-2 grid grid-cols-4 gap-2">
                {days.map((d, i) => <Choice key={d.day} on={day === i} onClick={() => setDay(i)} className="px-2 py-2.5 text-center"><span className="block font-display text-lg uppercase leading-none">{d.label}</span><span className="mt-1 block font-mono text-[11px] opacity-70">{d.day.split(' ').pop()}</span></Choice>)}
              </div>
              <p className="mt-4 font-mono text-[12px] text-ink-2">Ώρα</p>
              <div role="radiogroup" aria-label="Ώρα" className={cn('mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5', err(!time) && 'outline outline-2 outline-offset-4 outline-red')}>
                {slot?.times.map((tm) => <Choice key={tm} on={time === tm} onClick={() => setTime(tm)} className="py-2.5 text-center font-mono text-[14px] tabular-nums">{tm}</Choice>)}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block"><span className="font-mono text-[12px] text-ink-2">Όνομα</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={cn(field, err(name.trim().length < 2) ? 'border-red' : 'border-ink/25')} /></label>
              <label className="block"><span className="font-mono text-[12px] text-ink-2">Κινητό</span><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="69..." className={cn(field, err(!okPhone) ? 'border-red' : 'border-ink/25')} /></label>
            </div>
            {method === 'delivery' && <label className="block"><span className="font-mono text-[12px] text-ink-2">Διεύθυνση</span><input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" placeholder="Οδός, αριθμός, όροφος, κουδούνι" className={cn(field, err(address.trim().length < 5) ? 'border-red' : 'border-ink/25')} /></label>}
            <label className="block"><span className="font-mono text-[12px] text-ink-2">Κάτι ακόμα;</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="π.χ. πάρτε με πριν κόψετε" className="mt-2 w-full resize-none border border-ink/25 bg-ivory px-3 py-2 text-[15px] focus:border-ink focus:outline-none" /></label>
            <p className="font-mono text-[11.5px] leading-relaxed text-ink-2">Η παραγγελία πάει στο κινητό του μαγαζιού ({SHOP.mobile}) ως έτοιμο μήνυμα. Πληρωμή με μετρητά ή κάρτα {method === 'pickup' ? 'στο ταμείο' : 'στην πόρτα'}. Δεν αποθηκεύουμε τα στοιχεία σου πουθενά εκτός από αυτή τη συσκευή.</p>
          </motion.div>
        )}

        {stepId === 'done' && sent && (
          <motion.div key="done" {...slide} className="px-5 py-8 md:px-7">
            <motion.div initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}><CheckCircle size={56} weight="fill" className="text-green" /></motion.div>
            <p className="mt-4 font-display text-4xl uppercase leading-[.92]">Παραγγελία {sent.code}</p>
            <p className="mt-3 max-w-[40ch] text-[16px] text-ink-2">Πάτησε αποστολή στο μήνυμα που άνοιξε. Ο Ιπποκράτης σου απαντά για επιβεβαίωση. Αν δεν άνοιξε τίποτα, πάρε μας στο <a href={SHOP.mobileHref} className="cut-link text-ink">{SHOP.mobile}</a>.</p>
            <pre className="mt-6 whitespace-pre-wrap border border-ink/15 bg-ivory-2 p-4 font-mono text-[12.5px] leading-relaxed">{sent.text}</pre>
            <div className="mt-4 flex gap-4">
              <a href={`${SHOP.whatsapp}?text=${encodeURIComponent(sent.text)}`} target="_blank" rel="noopener" className="cut-link inline-flex items-center gap-2 font-display text-xl uppercase"><WhatsappLogo size={20} weight="bold" /> Ξανά στο WhatsApp</a>
              <button type="button" onClick={() => { void navigator.clipboard?.writeText(sent.text) }} className="cut-link font-display text-xl uppercase">Αντιγραφή</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  )
}
