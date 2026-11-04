/** One product on the counter: photo, origin, price, + to add (the photo flies to the basket), tap to open. */
import { useRef } from 'react'
import { motion } from 'motion/react'
import { Plus } from '@phosphor-icons/react'
import type { Product } from '@/lib/menu'
import { cart, defaultQty, fmtQty, price, split, useCart } from '@/lib/cart'
import { flyToCart } from '@/lib/fly'

export type Item = Product & { cat: string }

export default function ProductCard({ p }: { p: Item }) {
  const { title, tag } = split(p, p.cat)
  const pr = price(p)
  const photo = useRef<HTMLDivElement>(null)
  const { lines } = useCart()
  const inCart = lines.filter((l) => l.id === p.id).reduce((n, l) => n + l.qty, 0)
  const quick = () => { void flyToCart(photo.current, p.img ? `/media/p/${p.img}-sm.webp` : null); cart.add(p.id, defaultQty(p)) }
  return (
    <article className="group relative flex h-full flex-col bg-ivory text-ink">
      <div ref={photo} className="relative aspect-[16/10] overflow-hidden bg-[#ECEAE7]">
        {p.img ? (
          <img src={`/media/p/${p.img}-sm.webp`} srcSet={`/media/p/${p.img}-sm.webp 640w, /media/p/${p.img}.webp 1600w`} sizes="(min-width: 1024px) 25vw, 50vw" alt={p.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]" />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#F1EFEC,#E2DED8)]">
            <img src="/media/tram-mark.png" alt="" className="w-1/3 opacity-25" />
          </div>
        )}
        <span className="absolute left-2 top-2 bg-ivory/90 px-2 py-[3px] font-mono text-[10.5px] text-ink-2 md:left-3 md:top-3">{tag}</span>
        {inCart > 0 && <span className="absolute bottom-2 left-2 bg-ink px-2 py-[3px] font-mono text-[10.5px] font-semibold text-ivory md:bottom-3 md:left-3">✓ {fmtQty(p, inCart)} στο καλάθι</span>}
      </div>
      <div className="flex flex-1 flex-col border-x border-b border-ink/15 p-3 md:p-4">
        <h3 className="line-clamp-2 min-h-[2em] font-display text-[clamp(1.25rem,2vw,1.7rem)] uppercase leading-[1]">
          <button type="button" onClick={() => cart.openSheet(p.id)} className="text-left uppercase outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-red">{title}</button>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[13.5px] leading-snug text-ink-2 md:text-[14.5px]">{p.desc || ' '}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="font-mono text-[15px] font-semibold tabular-nums md:text-[17px]">{pr.main}</p>
            <p className="font-mono text-[10.5px] text-ink-2">{pr.sub}</p>
          </div>
          <motion.button type="button" onClick={quick} whileTap={{ scale: 0.88 }} aria-label={`Βάλε ${title} στο καλάθι`} className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center bg-red text-ivory transition-colors hover:bg-red-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"><Plus size={20} weight="bold" /></motion.button>
        </div>
      </div>
    </article>
  )
}
