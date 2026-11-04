/** Two lines, one terminus: "/" is the shop's story, "/paraggelia" is the order app. */
import { useSyncExternalStore } from 'react'

export type Route = 'home' | 'order'
export const ORDER_PATH = '/paraggelia'
const read = (): Route => (location.pathname.replace(/\/+$/, '') === ORDER_PATH ? 'order' : 'home')
const subs = new Set<() => void>()
window.addEventListener('popstate', () => subs.forEach((f) => f()))

export function useRoute() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, read, read)
}

/** go to a line; a hash ("#magazi") on the home line scrolls there once the page is up */
export function goTo(to: Route, hash = '') {
  const path = (to === 'order' ? ORDER_PATH : '/') + hash
  if (location.pathname + location.hash === path) return
  history.pushState(null, '', path)
  window.scrollTo(0, 0)
  subs.forEach((f) => f())
  if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 120)
}

/** onClick for <a href> that switches line without a reload */
export const link = (to: Route, hash = '') => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault(); goTo(to, hash)
}
