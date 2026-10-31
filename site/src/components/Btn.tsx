/**
 * Magnetic brand button. The magnet is ported from 21st.dev "Button Magnetic" by uilayout
 * (https://21st.dev/@uilayout.contact/components/button-magnetic): the button is pulled toward
 * the cursor inside a radius with a spring, and the label rolls up by character on hover.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { cn } from '@/lib/cn'

export function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden>
      {[...text].map((c, i) => (
        <span key={i} style={{ transitionDelay: `${i * 14}ms` }}>{c}</span>
      ))}
    </span>
  )
}

export default function Btn({ children, href, onClick, variant = 'red', className, icon, type = 'button', target }: { children: string; href?: string; onClick?: (e: React.MouseEvent) => void; variant?: 'red' | 'ghost' | 'ivory'; className?: string; icon?: ReactNode; type?: 'button' | 'submit'; target?: string }) {
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0), y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18 }), sy = useSpring(y, { stiffness: 220, damping: 18 })
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setFine(mq.matches)
    if (!mq.matches) return
    const onMove = (e: MouseEvent) => {
      const el = ref.current; if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy), R = 110
      if (d < R) { const s = (1 - d / R) * 0.4; x.set(dx * s); y.set(dy * s) } else { x.set(0); y.set(0) }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [x, y])
  const cls = cn('btn', variant === 'ghost' && 'btn-ghost', variant === 'ivory' && 'btn-ivory', className)
  const inner = <><span className="sr-only">{children}</span><Roll text={children} />{icon}</>
  const style = fine ? { x: sx, y: sy } : undefined
  if (href) return <motion.a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} onClick={onClick} target={target} rel={target ? 'noopener' : undefined} className={cls} style={style}>{inner}</motion.a>
  return <motion.button ref={ref as React.RefObject<HTMLButtonElement>} type={type} onClick={onClick} className={cls} style={style}>{inner}</motion.button>
}
