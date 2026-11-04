/** The basket in the header: count and running total, the landing spot for flying photos. */
import { AnimatePresence, motion } from 'motion/react'
import { Basket } from '@phosphor-icons/react'
import { cart, euro, totals, useCart } from '@/lib/cart'
import { cn } from '@/lib/cn'

export default function CartButton({ color, className }: { color: string; className?: string }) {
  const { lines } = useCart()
  const t = totals(lines)
  return (
    <button type="button" data-cart-target onClick={cart.openCart} aria-label={`Καλάθι, ${t.count} είδη`} className={cn('relative flex h-11 items-center gap-2 px-2 font-display text-xl tracking-wide', className)} style={{ color }}>
      <span className="relative">
        <span data-ping aria-hidden className="absolute inset-0 border-2 border-red opacity-0" />
        <Basket size={24} weight="bold" />
        <AnimatePresence>
          {t.count > 0 && (
            <motion.span key={t.count} initial={{ scale: 0.4 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 600, damping: 18 }}
              className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center bg-red px-1 font-mono text-[11px] font-semibold leading-none text-ivory">{t.count}</motion.span>
          )}
        </AnimatePresence>
      </span>
      {t.count > 0 && <span className="hidden font-mono text-[14px] font-semibold tabular-nums md:inline">{t.approx ? '~' : ''}{euro(t.cents)}</span>}
    </button>
  )
}
