import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
export function initSmooth() {
  if (lenis) return lenis
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return null
  lenis = new Lenis({ lerp: 0.09, syncTouch: false, wheelMultiplier: 1 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
export function getLenis() { return lenis }
export const isPhone = () => window.matchMedia('(max-width: 767px)').matches
