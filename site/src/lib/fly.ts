/**
 * Fly a product photo into the basket. Ported from 21st.dev "Add to basket" by motiondotdev
 * (https://21st.dev/@motiondotdev/components/motion-add-to-basket).
 * Kept: the quadratic arc with a control point off the straight line, rotation along the tangent,
 * the accelerating ease, the shrink to basket size, the basket kick with the tile's velocity and
 * the ping ring. Changed: the flying tile is a copy of the real product photo, launched from any
 * card or sheet to whichever basket is on screen (side button on desktop, phone bar on phones).
 */
import { animate } from 'motion/react'

const wrap = (min: number, max: number, v: number) => { const r = max - min; return ((((v - min) % r) + r) % r) + min }
const quad = (t: number, a: number, b: number, c: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c
const tangent = (t: number, x0: number, cx: number, x1: number, y0: number, cy: number, y1: number) =>
  (Math.atan2(2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy), 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx)) * 180) / Math.PI

function arc(dx: number, dy: number, strength = 0.5, peak = 0.15, rotate = 0.9) {
  const len = Math.hypot(dx, dy) || 1
  const s = -strength // clockwise, as in the original
  const cx = dx * peak + (-dy / len) * s * len, cy = dy * peak + (dx / len) * s * len
  const a0 = tangent(0, 0, cx, dx, 0, cy, dy), a1 = tangent(1, 0, cx, dx, 0, cy, dy)
  const delta = wrap(-180, 180, a1 - a0)
  return (t: number) => ({ x: quad(t, 0, cx, dx), y: quad(t, 0, cy, dy), r: wrap(-180, 180, tangent(t, 0, cx, dx, 0, cy, dy) - (a0 + delta * t)) * rotate })
}

function target(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>('[data-cart-target]'))
  return all.find((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).visibility !== 'hidden' }) ?? null
}

export async function flyToCart(from: HTMLElement | null, src: string | null) {
  const to = target()
  if (!from || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) { bump(to); return }
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect()
  const size = Math.min(a.width, a.height, 180)
  const tile = document.createElement('div')
  Object.assign(tile.style, {
    position: 'fixed', left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px`,
    zIndex: '120', pointerEvents: 'none', background: src ? `#ECEAE7 url(${src}) center/cover` : 'var(--color-red)', boxShadow: '0 0 0 2px var(--color-ivory)', willChange: 'transform',
  })
  document.body.appendChild(tile)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const path = arc(dx, dy)
  const end = 44 / size
  await animate(0, 1, {
    duration: 0.55, ease: [0.74, 0.18, 0.93, 0.69],
    onUpdate: (t) => { const p = path(t); tile.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${1 + (end - 1) * t})`; tile.style.opacity = String(t < 0.95 ? 1 : 1 - (t - 0.95) / 0.05) },
  })
  tile.remove()
  bump(to, dx * 0.004, dy * 0.004)
}

function bump(el: HTMLElement | null, vx = 0, vy = 6) {
  if (!el) return
  animate(el, { x: [vx * 10, 0], y: [vy * 10 > 12 ? 12 : vy * 10, 0] }, { type: 'spring', stiffness: 500, damping: 12 })
  const ping = el.querySelector<HTMLElement>('[data-ping]')
  if (ping) animate(ping, { scale: [1, 2.2], opacity: [0.8, 0] }, { duration: 0.5, ease: 'easeOut' })
}
