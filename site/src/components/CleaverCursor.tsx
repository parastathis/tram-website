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

/** Ippokratis's own cleaver: dark carbon steel with patina, a bright worn edge, a steel collar,
 *  a slim black handle. Drawn in real tones, no outlines. Hotspot = front of the edge (3, 33). */
// Patina is soft stains, not lines; no hole and no rivets (his cleaver shows neither).
const CLEAVER_PATHS = `
  <defs>
    <linearGradient id="cv-steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7C766F"/><stop offset=".18" stop-color="#5D5852"/>
      <stop offset=".55" stop-color="#4A4541"/><stop offset=".86" stop-color="#3B3734"/><stop offset="1" stop-color="#5A5550"/>
    </linearGradient>
    <linearGradient id="cv-sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".13"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="cv-edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#A9A39A"/><stop offset="1" stop-color="#E6E2DA"/>
    </linearGradient>
    <linearGradient id="cv-handle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3A302C"/><stop offset=".35" stop-color="#1A1514"/><stop offset="1" stop-color="#0B0909"/>
    </linearGradient>
    <linearGradient id="cv-collar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#CFCAC2"/><stop offset=".5" stop-color="#8E8880"/><stop offset="1" stop-color="#5E5953"/>
    </linearGradient>
    <radialGradient id="cv-patina"><stop offset="0" stop-color="#2E2723" stop-opacity=".32"/><stop offset="1" stop-color="#2E2723" stop-opacity="0"/></radialGradient>
  </defs>
  <path d="M58 9.6h15.5c2.6 0 4.5 1.6 4.5 3.9s-1.9 3.9-4.5 3.9H58z" fill="url(#cv-handle)"/>
  <path d="M60 10.6h13" stroke="#fff" stroke-opacity=".14" stroke-width=".8" stroke-linecap="round"/>
  <rect x="53.6" y="8.8" width="4.8" height="9.4" rx="1" fill="url(#cv-collar)"/>
  <path d="M3.2 3.6h50.6v23.9L5.6 34.2C3.9 34.4 2.4 33.2 2.4 31.5V4.4c0-.5.4-.8.8-.8z" fill="url(#cv-steel)"/>
  <path d="M3.2 3.6h50.6v23.9L5.6 34.2C3.9 34.4 2.4 33.2 2.4 31.5V4.4c0-.5.4-.8.8-.8z" fill="url(#cv-sheen)"/>
  <path d="M2.4 29.6 53.8 23.4v4.1L5.6 34.2c-1.7.2-3.2-1-3.2-2.7z" fill="#615B55" fill-opacity=".55"/>
  <path d="M2.6 31.9 53.8 25.9v1.6L5.6 34.2c-1.5.2-2.8-.8-3-2.3z" fill="url(#cv-edge)"/>
  <path d="M3.2 3.6h50.6" stroke="#B3ADA4" stroke-opacity=".7" stroke-width=".9"/>
  <ellipse cx="18" cy="15" rx="13" ry="7" fill="url(#cv-patina)"/>
  <ellipse cx="42" cy="20" rx="10" ry="5" fill="url(#cv-patina)"/>
`

export function Cleaver({ w = 92 }: { w?: number }) {
  return <svg viewBox="0 0 80 44" width={w} height={(w * 44) / 80} aria-hidden style={{ display: 'block', filter: 'drop-shadow(0 3px 4px rgba(14,12,13,.4)) drop-shadow(0 0 1px rgba(239,234,224,.35))' }} dangerouslySetInnerHTML={{ __html: CLEAVER_PATHS }} />
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
        <motion.div style={{ rotate: tilt, scale: squash, transformOrigin: '3.5px 38px', x: -3.5, y: -38 }}>
          <motion.div animate={{ rotate: hot ? -14 : 0, scale: hot ? 1.06 : 1 }} transition={{ type: 'spring', stiffness: 380, damping: 22 }} style={{ transformOrigin: '78px 15.5px' }}>
            <motion.div animate={chop} style={{ transformOrigin: '78px 15.5px' }}><Cleaver /></motion.div>
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
