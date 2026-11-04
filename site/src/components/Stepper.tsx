/**
 * Quantity control, ported from 21st.dev "Quantity Stepper" by arihantcodes
 * https://21st.dev/@arihantcodes_1f7b8c4d/components/quantity-stepper
 * Kept: rolling digits in the direction of travel, press squish, boundary shake, hold-to-repeat.
 * Changed: square corners, kilo or piece steps, brand colours, a compact size for basket lines.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { Minus, Plus } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const variants = { enter: (d: number) => ({ y: d * 12, opacity: 0 }), center: { y: 0, opacity: 1 }, exit: (d: number) => ({ y: d * -12, opacity: 0 }) }

export default function Stepper({ value, onChange, min = 0, max = 30, step = 0.5, format, small, label = 'Ποσότητα' }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; format?: (v: number) => string; small?: boolean; label?: string }) {
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
    const next = clamp(Math.round((ref.current + delta) / step) * step, min, max)
    if (next === ref.current) { setFlash((f) => f + 1); return false }
    ref.current = next; setDir(delta > 0 ? 1 : -1); onChange(next); return true
  }, [min, max, step, onChange])
  const hold = (delta: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    stop(); if (!stepBy(delta)) return
    timers.current.d = setTimeout(() => { timers.current.i = setInterval(() => { if (!stepBy(delta)) stop() }, 110) }, 420)
  }
  const text = format ? format(value) : `${value.toFixed(1).replace('.0', '')} kg`
  const size = small ? 'h-9 w-9' : 'h-11 w-11'
  const btn = cn(size, 'flex touch-manipulation items-center justify-center transition-colors hover:bg-ink/5 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ink')
  return (
    <div role="group" aria-label={label} className="inline-flex select-none items-center border border-ink/25 bg-ivory">
      <motion.button type="button" aria-label="Λιγότερο" onPointerDown={hold(-step)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepBy(-step) } }} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, value <= min && 'opacity-40')}><Minus size={small ? 14 : 16} weight="bold" /></motion.button>
      <motion.span role="spinbutton" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} aria-valuetext={text} aria-label={label} tabIndex={0} animate={shake}
        onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); stepBy(step) } if (e.key === 'ArrowDown') { e.preventDefault(); stepBy(-step) } }}
        className={cn('flex items-center justify-center overflow-hidden px-1 font-mono font-semibold tabular-nums', small ? 'h-9 min-w-[64px] text-[13px]' : 'h-11 min-w-[80px] text-sm', flash ? 'text-red' : 'text-ink')}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          <motion.span key={value} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={reduced || flash ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }} className="inline-block whitespace-nowrap">{text}</motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.button type="button" aria-label="Περισσότερο" onPointerDown={hold(step)} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stepBy(step) } }} whileTap={reduced ? undefined : { scale: 0.85 }} className={cn(btn, value >= max && 'opacity-40')}><Plus size={small ? 14 : 16} weight="bold" /></motion.button>
    </div>
  )
}
