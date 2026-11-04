/**
 * Sheet and drawer in one. Behaviour ported from 21st.dev "Drawer" by wensity
 * (https://21st.dev/@wensity/components/drawer): on phones a bottom sheet with a grab handle that
 * is dragged down to dismiss (by distance or by flick speed), on larger screens a full-height side
 * drawer; backdrop, Escape, focus trap, scroll lock and a scrolling body between a fixed header and
 * footer. Changed: built on motion (the site's engine) instead of Base UI, square corners, ivory
 * surface with an ink hairline, and Lenis is paused while it is open.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react'
import { X } from '@phosphor-icons/react'
import { getLenis } from '@/lib/smooth'
import { cn } from '@/lib/cn'

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])'
const EASE = [0.23, 1, 0.32, 1] as const

function useWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => { const mq = window.matchMedia('(min-width: 768px)'); const f = () => setWide(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f) }, [])
  return wide
}

export default function Panel({ open, onClose, title, children, footer, width = 520, label }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; width?: number; label: string }) {
  const wide = useWide()
  const reduced = useReducedMotion()
  const drag = useDragControls()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const l = getLenis(); l?.stop()
    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const prev = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => box.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus() ?? box.current?.focus())
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab' || !box.current) return
      const f = Array.from(box.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)
      if (!f.length) return
      const first = f[0], last = f[f.length - 1], a = document.activeElement
      if (e.shiftKey ? a === first || !box.current.contains(a) : a === last || !box.current.contains(a)) { e.preventDefault(); (e.shiftKey ? last : first).focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); document.documentElement.style.overflow = prevOverflow; l?.start(); prev?.focus?.() }
  }, [open, onClose])

  const t = reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }
  const from = wide ? { x: '100%' } : { y: '100%' }
  const to = wide ? { x: 0 } : { y: 0 }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]" key="panel">
          <motion.div className="absolute inset-0 bg-ink/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: 0.3 }} onClick={onClose} />
          <motion.div ref={box} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}
            className={cn('absolute flex flex-col bg-ivory text-ink outline-none', wide ? 'inset-y-0 right-0 border-l border-ink/20' : 'inset-x-0 bottom-0 max-h-[92svh] border-t border-ink/20')}
            style={wide ? { width: `min(100vw, ${width}px)` } : undefined}
            initial={from} animate={to} exit={{ ...from, transition: reduced ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 1, 1] } }} transition={t}
            drag={wide ? false : 'y'} dragControls={drag} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.9 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120 || i.velocity.y > 600) onClose() }}>
            {!wide && (
              <div className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing" onPointerDown={(e) => drag.start(e)} aria-hidden>
                <span className="h-1.5 w-12 bg-ink/25" />
              </div>
            )}
            <div className={cn('flex shrink-0 items-start justify-between gap-4 border-b border-ink/15 px-5 pb-4 md:px-7 md:pt-6', wide ? 'pt-6' : 'pt-1 touch-none')} onPointerDown={wide ? undefined : (e) => { if (!(e.target as HTMLElement).closest('button')) drag.start(e) }}>
              <div className="min-w-0 flex-1">{title}</div>
              <button type="button" onClick={onClose} aria-label="Κλείσιμο" className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red"><X size={20} weight="bold" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>{children}</div>
            {footer && <div className="shrink-0 border-t border-ink/15 bg-ivory px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-7">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
