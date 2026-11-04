/**
 * The site's pointer: a butcher's cleaver, on every page, for mouse and trackpad users.
 * Ported from 21st.dev "Cursor" by unlumen (https://21st.dev/@unlumen/components/cursor).
 * Kept: a spring-followed pointer tilted by its own velocity with a slight squash when fast, and
 * a label that follows it with squash and skew. Changed: the pointer is a cleaver, it lifts over
 * anything clickable and chops on every click; the label comes from the nearest `data-cursor`
 * (or `data-cursor-left` / `data-cursor-right`, picked by which half of the element you are on).
 * Touch screens keep the system behaviour. With reduced motion the cleaver is a plain CSS cursor.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls, useMotionValue, useSpring, useTransform, useVelocity } from 'motion/react'

const FOLLOW = { damping: 28, stiffness: 420, mass: 0.5 }
const CLICKABLE = 'a, button, [role="button"], label, select, summary, [data-cursor], [data-cursor-left]'

/** Steel blade with its hole, a wooden handle with two rivets. Hotspot = front of the edge (4, 47). */
export function Cleaver({ w = 88 }: { w?: number }) {
  return (
    <svg viewBox="0 0 64 44" width={w} height={(w * 44) / 64} aria-hidden style={{ display: 'block', filter: 'drop-shadow(0 2px 3px rgba(14,12,13,.35))' }}>
      <path d="M40 11.5h19.5a3.5 3.5 0 0 1 0 7H40z" fill="#9A6440" stroke="#0E0C0D" strokeWidth="1" />
      <path d="M44 13.2h14" stroke="#C08A5E" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="47" cy="15" r="1.1" fill="#C9C2B6" /><circle cx="54" cy="15" r="1.1" fill="#C9C2B6" />
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H40v28.5c0 1.4-1 2.5-2.4 2.6L3.8 36.8A2 2 0 0 1 1.6 34.8z" fill="#D9D5CE" stroke="#0E0C0D" strokeWidth="1" />
      <path d="M1.6 30.4 38.6 26.6 40 30.5c0 1.4-1 2.5-2.4 2.6L3.8 36.8A2 2 0 0 1 1.6 34.8z" fill="#F4F1EA" />
      <path d="M4 3.8h34" stroke="#A9A39A" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="33" cy="10" r="3.1" fill="#0E0C0D" />
    </svg>
  )
}

export default function CleaverCursor() {
  const [on, setOn] = useState(false)
  const [seen, setSeen] = useState(false)
  const [hot, setHot] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const chop = useAnimationControls()

  const mx = useMotionValue(-200), my = useMotionValue(-200)
  const sx = useSpring(mx, FOLLOW), sy = useSpring(my, FOLLOW)
  const vx = useVelocity(sx), vy = useVelocity(sy)
  const tilt = useSpring(useTransform([vx, vy], ([a, b]) => Math.max(-35, Math.min(35, ((a as number) / 1000) * 24 + ((b as number) / 1000) * 18))), { damping: 15, stiffness: 200 })
  const squash = useTransform([vx, vy], ([a, b]) => 1 - Math.min(Math.hypot(a as number, b as number) / 2000, 0.1))
  const lsx = useTransform(vx, [-1000, 0, 1000], [0.9, 1, 1.15]), lsy = useTransform(vy, [-1000, 0, 1000], [1.15, 1, 0.9])
  const lkx = useTransform(vx, [-1000, 0, 1000], [-3, 0, 3])

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      const live = fine.matches && !still.matches
      setOn(live)
      document.documentElement.classList.toggle('cleaver-live', live)
      document.documentElement.classList.toggle('cleaver-static', fine.matches && still.matches)
    }
    sync(); fine.addEventListener('change', sync); still.addEventListener('change', sync)
    return () => { fine.removeEventListener('change', sync); still.removeEventListener('change', sync); document.documentElement.classList.remove('cleaver-live', 'cleaver-static') }
  }, [])

  useEffect(() => {
    if (!on) return
    let first = true
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (first) { sx.jump(e.clientX); sy.jump(e.clientY); first = false }
      mx.set(e.clientX); my.set(e.clientY); setSeen(true)
      const t = e.target instanceof Element ? e.target : null
      setHot(Boolean(t?.closest(CLICKABLE)))
      const one = t?.closest<HTMLElement>('[data-cursor]')
      const two = t?.closest<HTMLElement>('[data-cursor-left]')
      if (one) setLabel(one.dataset.cursor || null)
      else if (two) { const r = two.getBoundingClientRect(); setLabel((e.clientX < r.left + r.width / 2 ? two.dataset.cursorLeft : two.dataset.cursorRight) || null) }
      else setLabel(null)
    }
    const down = (e: PointerEvent) => { if (e.pointerType !== 'touch') chop.start({ rotate: [0, 38, -6, 0], y: [0, 10, 0, 0], transition: { duration: 0.32, times: [0, 0.35, 0.7, 1], ease: 'easeOut' } }) }
    const out = (e: MouseEvent) => { if (!e.relatedTarget) setSeen(false) }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    document.addEventListener('mouseout', out)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerdown', down); document.removeEventListener('mouseout', out) }
  }, [on, chop, mx, my, sx, sy])

  if (!on) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2147483000]">
      <motion.div className="absolute left-0 top-0" style={{ x: sx, y: sy }} animate={{ opacity: seen ? 1 : 0 }} transition={{ duration: 0.15 }}>
        <motion.div style={{ rotate: tilt, scale: squash, transformOrigin: '4px 47px', x: -4, y: -47 }}>
          <motion.div animate={{ rotate: hot ? -14 : 0, scale: hot ? 1.06 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }} style={{ transformOrigin: '77px 19px' }}>
            <motion.div animate={chop} style={{ transformOrigin: '77px 19px' }}><Cleaver /></motion.div>
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {label && (
            <motion.span key={label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className="absolute left-6 top-6 whitespace-nowrap bg-red px-2.5 py-1.5 font-mono text-[11px] uppercase text-ivory" style={{ scaleX: lsx, scaleY: lsy, skewX: lkx }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
