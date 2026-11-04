/**
 * The shop's own basket. Lives in localStorage, read through useSyncExternalStore, so the
 * catalogue, the product sheet, the basket and the phone bar all see the same thing.
 * Weight items are in kilos (0.5 steps), everything else in pieces.
 */
import { useSyncExternalStore } from 'react'
import { MENU, type Product } from '@/lib/menu'

export type Line = { id: string; qty: number; note: string }
type State = { lines: Line[]; sheet: string | null; open: boolean }

const KEY = 'tram-cart-v1'
const BY_ID = new Map<string, Product & { cat: string }>()
MENU.forEach((c) => c.items.forEach((p) => BY_ID.set(p.id, { ...p, cat: c.name })))
export const product = (id: string) => BY_ID.get(id)

function load(): Line[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((l) => BY_ID.has(l.id)) : [] } catch { return [] }
}
let state: State = { lines: typeof window === 'undefined' ? [] : load(), sheet: null, open: false }
const subs = new Set<() => void>()
function set(next: Partial<State>) {
  state = { ...state, ...next }
  if (next.lines) try { localStorage.setItem(KEY, JSON.stringify(state.lines)) } catch { /* private mode */ }
  subs.forEach((f) => f())
}
const subscribe = (f: () => void) => { subs.add(f); return () => subs.delete(f) }
export function useCart() { return useSyncExternalStore(subscribe, () => state, () => state) }

export const isWeight = (p: Product) => p.sale === 'WEIGHT'
export const step = (p: Product) => (isWeight(p) ? 0.5 : 1)
export const minQty = (p: Product) => (isWeight(p) ? 0.5 : 1)
export const defaultQty = (p: Product) => (isWeight(p) ? 1 : 1)
export const fmtQty = (p: Product, q: number) => (isWeight(p) ? `${q.toString().replace('.', ',')} kg` : `${q} τεμ.`)
export const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',') + ' €'

/** cents for one line: per kilo, per piece, or per piece weighed at the counter */
export function lineCents(p: Product, q: number) {
  if (p.sale === 'PIECE_BY_WEIGHT' && p.perKg && p.grams) return Math.round((p.perKg * p.grams) / 1000) * q
  return Math.round(p.cents * q)
}
/** true when the final price is set on the scale */
export const weighed = (p: Product) => p.sale === 'WEIGHT' || p.sale === 'PIECE_BY_WEIGHT'

export const cart = {
  add(id: string, qty: number, note = '') {
    const lines = [...state.lines]
    const i = lines.findIndex((l) => l.id === id && l.note === note)
    if (i >= 0) lines[i] = { ...lines[i], qty: lines[i].qty + qty }
    else lines.push({ id, qty, note })
    set({ lines })
  },
  setQty(i: number, qty: number) {
    const lines = [...state.lines]
    if (qty <= 0) lines.splice(i, 1); else lines[i] = { ...lines[i], qty }
    set({ lines })
  },
  remove(i: number) { const lines = [...state.lines]; lines.splice(i, 1); set({ lines }) },
  clear() { set({ lines: [] }) },
  openSheet(id: string) { set({ sheet: id }) },
  closeSheet() { set({ sheet: null }) },
  openCart() { set({ open: true, sheet: null }) },
  closeCart() { set({ open: false }) },
}

export function totals(lines: Line[]) {
  let cents = 0, count = 0, approx = false
  for (const l of lines) { const p = BY_ID.get(l.id); if (!p) continue; cents += lineCents(p, l.qty); count += 1; if (weighed(p)) approx = true }
  return { cents, count, approx }
}

/** Quick cutting choices per counter, shown as tiles in the product sheet */
export const CUTS: Record<string, string[]> = {
  'Μοσχάρι': ['Ολόκληρο κομμάτι', 'Μπριζόλες', 'Κιμάς', 'Κύβοι για κοκκινιστό', 'Φέτες για σνίτσελ'],
  'Χοιρινό': ['Ολόκληρο κομμάτι', 'Μπριζόλες', 'Κύβοι για σουβλάκι', 'Κιμάς'],
  'Πουλερικά & Κουνέλι': ['Ολόκληρο', 'Σε μερίδες', 'Χωρίς πέτσα', 'Φιλέτο'],
  'Αρνί & Κατσίκι': ['Ολόκληρο κομμάτι', 'Σε μερίδες', 'Για φούρνο', 'Για σούβλα'],
}

const ORIGINS = ['Ελασσόνας', 'Πίνδος', 'Νάξου', 'Νιτσιάκος', 'Κρήτης', 'Ρεθύμνου', 'Αμφιλοχίας']
/** "Κόντρα Νεαρό Μοσχάρι Ελληνικό Ελασσόνας" -> title "Κόντρα", tag "Νεαρό μοσχάρι · Ελασσόνας" */
export function split(p: Product, cat: string) {
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

export function price(p: Product) {
  if (p.sale === 'PIECE_BY_WEIGHT' && p.grams && p.perKg) return { main: `~${euro(Math.round((p.perKg * p.grams) / 1000))}`, sub: `το κομμάτι, ~${(p.grams / 1000).toString().replace('.', ',')} kg · ${euro(p.perKg)}/kg` }
  if (p.sale === 'WEIGHT') return { main: euro(p.cents), sub: 'το κιλό' }
  return { main: euro(p.cents), sub: 'το τεμάχιο' }
}
export const img = (p: Product, big = false) => (p.img ? `/media/p/${p.img}${big ? '' : '-sm'}.webp` : null)
