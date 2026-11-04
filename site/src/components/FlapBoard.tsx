/**
 * Split-flap letters, ported from 21st.dev "Split Flap Display" by componentry
 * (https://21st.dev/@componentry/components/split-flap-display).
 * Kept: one cell per character with a static top and bottom half, the top flap falling and the
 * bottom flap rising on every step, the centre hinge line, a stagger across the row so it reads
 * as a wave. Changed: Greek capitals, the cells walk a short run of letters and land on the
 * target (a real board does not spin the whole alphabet), the cells take the display face and
 * scale with the screen, square corners, and the row can stay blank until `play` turns true.
 */
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const SET = 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ0123456789'
const STYLE_ID = 'flap-keyframes'

function useKeyframes() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return
    const s = document.createElement('style'); s.id = STYLE_ID
    s.textContent = '@keyframes flapTop{to{transform:rotateX(-90deg)}}@keyframes flapBottom{from{transform:rotateX(90deg)}to{transform:rotateX(0)}}'
    document.head.appendChild(s)
  }, [])
}

function Cell({ ch, play, delay, speed }: { ch: string; play: boolean; delay: number; speed: number }) {
  const [shown, setShown] = useState(' ')
  const [prev, setPrev] = useState(' ')
  const [tick, setTick] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    if (!play) { setShown(' '); setPrev(' '); return }
    if (ch === ' ') { setShown(' '); return }
    const steps = 4 + Math.floor(Math.random() * 5)
    const run = Array.from({ length: steps }, () => SET[Math.floor(Math.random() * SET.length)]).concat(ch)
    let last = ' '
    run.forEach((c, i) => timers.current.push(setTimeout(() => { setPrev(last); setShown(c); setTick((t) => t + 1); last = c }, delay + i * speed)))
    return () => timers.current.forEach(clearTimeout)
  }, [ch, play, delay, speed])
  const half = 'absolute inset-x-0 h-1/2 overflow-hidden'
  const glyph = 'absolute left-1/2 -translate-x-1/2 leading-none'
  return (
    <span aria-hidden className="relative inline-block h-[1.18em] w-[.72em] select-none" style={{ perspective: '400px' }}>
      <span className={cn(half, 'top-0 bg-[#221C1E]')}><span className={cn(glyph, 'bottom-0 translate-y-1/2')}>{shown}</span></span>
      <span className={cn(half, 'bottom-0 bg-[#1A1517]')}><span className={cn(glyph, 'top-0 -translate-y-1/2 text-ivory/90')}>{shown}</span></span>
      {tick > 0 && (
        <span key={tick}>
          <span className={cn(half, 'top-0 z-10 origin-bottom bg-[#2A2326]')} style={{ animation: `flapTop ${speed * 0.5}ms ease-in forwards` }}><span className={cn(glyph, 'bottom-0 translate-y-1/2')}>{prev}</span></span>
          <span className={cn(half, 'bottom-0 z-10 origin-top bg-[#1A1517]')} style={{ animation: `flapBottom ${speed * 0.5}ms ease-out ${speed * 0.45}ms both` }}><span className={cn(glyph, 'top-0 -translate-y-1/2 text-ivory/90')}>{shown}</span></span>
        </span>
      )}
      <span className="absolute inset-x-0 top-1/2 z-20 h-[2px] -translate-y-1/2 bg-ink/90" />
    </span>
  )
}

export default function FlapText({ text, play, stagger = 45, speed = 70, className }: { text: string; play: boolean; stagger?: number; speed?: number; className?: string }) {
  useKeyframes()
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return <span className={className}>{text}</span>
  return (
    <span className={cn('inline-flex gap-[.06em]', className)}>
      <span className="sr-only">{text}</span>
      {[...text.toLocaleUpperCase('el').normalize('NFD').replace(/\p{M}/gu, '')].map((c, i) => <Cell key={i} ch={c} play={play} delay={i * stagger} speed={speed} />)}
    </span>
  )
}
