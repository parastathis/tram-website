/**
 * Two stops on one line: Το μαγαζί (the story) and Παραγγελία (the order app). The tram mark
 * rides the rail to the stop you pick; the current stop is filled red.
 */
import { motion, useReducedMotion } from 'motion/react'
import { goTo, ORDER_PATH, useRoute, type Route } from '@/lib/route'
import { cn } from '@/lib/cn'

const STOPS: { id: Route; label: string; href: string }[] = [
  { id: 'home', label: 'Το μαγαζί', href: '/' },
  { id: 'order', label: 'Παραγγελία', href: ORDER_PATH },
]

export default function LineSwitch({ color, className }: { color: string; className?: string }) {
  const route = useRoute()
  const reduced = useReducedMotion()
  return (
    <nav aria-label="Γραμμές" className={cn('items-center gap-3', className)} style={{ color }}>
      {STOPS.map((s, i) => {
        const on = route === s.id
        return (
          <div key={s.id} className="flex items-center gap-3">
            {i > 0 && (
              <span aria-hidden className="relative block h-[2px] w-14 opacity-50" style={{ background: color }}>
                <motion.img src="/media/tram-mark.png" alt="" className={cn('absolute -top-[11px] h-[13px] w-auto', color.startsWith('#F') && 'invert')} initial={false} animate={{ left: route === 'order' ? 'calc(100% - 22px)' : '0px' }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 22 }} />
              </span>
            )}
            <a href={s.href} aria-current={on ? 'page' : undefined} onClick={(e) => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); goTo(s.id) }}
              className={cn('flex items-center gap-2 font-display text-xl uppercase tracking-wide no-underline transition-opacity', on ? 'opacity-100' : 'opacity-60 hover:opacity-100')}>
              <span aria-hidden className={cn('h-2.5 w-2.5 border-2', on ? 'border-red bg-red' : '')} style={on ? undefined : { borderColor: color }} />
              {s.label}
            </a>
          </div>
        )
      })}
    </nav>
  )
}
