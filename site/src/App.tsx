import { useCallback, useEffect, useState } from 'react'
import { initSmooth } from '@/lib/smooth'
import Nav from '@/components/Nav'
import Preloader from '@/components/Preloader'
import Hero from '@/sections/Hero'
import Chapters from '@/sections/Chapters'
import Cuts from '@/sections/Cuts'
import Identity from '@/sections/Identity'
import Line from '@/sections/Line'
import Gallery from '@/sections/Gallery'
import Butcher from '@/sections/Butcher'
import Reviews from '@/sections/Reviews'
import Order from '@/sections/Order'
import Hours from '@/sections/Hours'
import Footer from '@/sections/Footer'

export default function App() {
  const [dark, setDark] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const onDone = useCallback(() => setLoaded(true), [])
  useEffect(() => {
    initSmooth()
    const els = Array.from(document.querySelectorAll<HTMLElement>('main > section'))
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setDark((e.target as HTMLElement).dataset.theme === 'dark') }), { rootMargin: '-8% 0px -88% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <>
      <Preloader onDone={onDone} />
      <Nav dark={dark} />
      <main className={loaded ? '' : 'invisible'}>
        <Hero />
        <Chapters />
        <Butcher />
        <Cuts />
        <Identity />
        <Line />
        <Gallery />
        <Reviews />
        <Order />
        <Hours />
      </main>
      <Footer />
    </>
  )
}
