import { useCallback, useEffect, useState } from 'react'
import { initSmooth } from '@/lib/smooth'
import Nav from '@/components/Nav'
import Preloader from '@/components/Preloader'
import MobileBar from '@/components/MobileBar'
import Hero from '@/sections/Hero'
import Chapters from '@/sections/Chapters'
import Cuts from '@/sections/Cuts'
import Shop from '@/sections/Shop'
import Butcher from '@/sections/Butcher'
import Reviews from '@/sections/Reviews'
import Order from '@/sections/Order'
import Hours from '@/sections/Hours'
import Footer from '@/sections/Footer'

export default function App() {
  const [dark, setDark] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const onDone = useCallback(() => { setLoaded(true); window.dispatchEvent(new CustomEvent('tram:enter')) }, [])
  useEffect(() => {
    initSmooth()
    const els = Array.from(document.querySelectorAll<HTMLElement>('main > section'))
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setDark((e.target as HTMLElement).dataset.theme === 'dark') }), { rootMargin: '-8% 0px -88% 0px' })
    els.forEach((el) => io.observe(el))
    const onTheme = (e: Event) => setDark(Boolean((e as CustomEvent<{ dark: boolean }>).detail?.dark))
    window.addEventListener('tram:theme', onTheme)
    return () => { io.disconnect(); window.removeEventListener('tram:theme', onTheme) }
  }, [])
  return (
    <>
      <Preloader onDone={onDone} />
      <Nav dark={dark} />
      <main className={loaded ? '' : 'invisible'}>
        <Hero />
        <Chapters />
        <Cuts />
        <Shop />
        <Butcher />
        <Reviews />
        <Order />
        <Hours />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}
