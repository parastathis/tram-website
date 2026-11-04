/**
 * Ο πάγκος on the home line: a short window of what sells first, with the price, each one a tap
 * from the basket, and one clear way into the full order app (Γραμμή 1).
 */
import { ArrowRight } from '@phosphor-icons/react'
import ProductCard, { type Item } from '@/components/ProductCard'
import { MENU } from '@/lib/menu'
import { link, ORDER_PATH } from '@/lib/route'

const ALL: Item[] = MENU.flatMap((c) => c.items.map((p) => ({ ...p, cat: c.name })))
const PICKS = ['cmvtxlxlk000808l2epj2d90r', 'cmvtxm5ib004508l2y09w6m9r', 'cmvtxm04l002a08l2h8etklu3', 'cmvtxm2dn002v08l24ph8467h', 'cmvtxm8qb005a08l2xrnnjkoe', 'cmvtxm8io004w08l280oylojw', 'cmvtxlxi6000208l2ia5y70ip', 'cmvtxlycr001n08l2q47o96j8']

export default function Showcase() {
  const items = PICKS.map((id) => ALL.find((p) => p.id === id)).filter(Boolean) as Item[]
  return (
    <section id="pagkos" className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-8 md:grid-cols-12 md:items-end">
          <h2 className="font-display text-[clamp(3.4rem,9vw,8.4rem)] uppercase leading-[.86] md:col-span-7">Ο πάγκος,<br />με τιμές</h2>
          <div className="md:col-span-5">
            <p className="max-w-[44ch] text-lg text-ink-2">Αυτά φεύγουν πρώτα από τη βιτρίνα. Πάτα το + και πάει στο καλάθι, ή δες όλα τα {ALL.length} είδη και παράγγειλε σε δύο βήματα.</p>
            <a href={ORDER_PATH} onClick={link('order')} className="group mt-6 inline-flex items-center gap-3 bg-red px-6 py-4 font-display text-[1.45rem] uppercase leading-none tracking-wide text-ivory no-underline transition-colors hover:bg-red-deep">
              Όλος ο πάγκος, παράγγειλε <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
        <ul className="mt-14 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4" style={{ gridAutoRows: '1fr' }}>
          {items.map((p) => <li key={p.id} className="min-w-0"><ProductCard p={p} /></li>)}
        </ul>
        <p className="mt-6 font-mono text-[11.5px] text-ink-2">Οι τιμές είναι της ημέρας. Τα κρέατα πληρώνονται με το βάρος τους.</p>
      </div>
    </section>
  )
}
