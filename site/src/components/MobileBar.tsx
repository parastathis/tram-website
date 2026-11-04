/**
 * Phone bar. On a phone the visitor wants to order, not to browse: a fixed bar with Call, WhatsApp
 * and Directions rises once the hero has scrolled away, and hides again while the menu is open or
 * the hero is on screen. Safe-area aware.
 */
import { useEffect, useState } from 'react'
import { Phone, WhatsappLogo, Basket } from '@phosphor-icons/react'
import { euro, totals, useCart } from '@/lib/cart'
import { link, ORDER_PATH } from '@/lib/route'
import { SHOP } from '@/lib/data'
import { cn } from '@/lib/cn'

export default function MobileBar() {
  const [show, setShow] = useState(false)
  const { lines } = useCart()
  const t = totals(lines)
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0, rootMargin: '0px 0px -40% 0px' })
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  return (
    <div aria-label="Γρήγορες ενέργειες" className={cn('fixed inset-x-0 bottom-0 z-[55] grid grid-cols-3 gap-[2px] bg-ink p-[2px] pb-[max(2px,env(safe-area-inset-bottom))] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden', show ? 'translate-y-0' : 'translate-y-full')}>
      <a href={SHOP.phoneHref} className="flex h-14 items-center justify-center gap-2 bg-ivory font-display text-lg uppercase tracking-wide text-ink no-underline"><Phone size={18} weight="bold" /> Κάλεσε</a>
      <a href={SHOP.whatsapp} target="_blank" rel="noopener" className="flex h-14 items-center justify-center gap-2 bg-green font-display text-lg uppercase tracking-wide text-ivory no-underline"><WhatsappLogo size={20} weight="bold" /> WhatsApp</a>
      <a href={ORDER_PATH} onClick={link('order')} className="flex h-14 items-center justify-center gap-2 bg-red no-underline font-display text-lg uppercase tracking-wide text-ivory"><Basket size={18} weight="bold" /> {t.count ? <span className="font-mono text-[13px] font-semibold normal-case tabular-nums">{t.count} · {euro(t.cents)}</span> : 'Παράγγειλε'}</a>
    </div>
  )
}
