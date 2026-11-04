import { useCallback, useEffect, useState } from 'react'
import { initSmooth } from '@/lib/smooth'
import Nav from '@/components/Nav'
import Preloader from '@/components/Preloader'
import CleaverCursor from '@/components/CleaverCursor'
import MobileBar from '@/components/MobileBar'
import ProductSheet from '@/components/ProductSheet'
import CartDrawer from '@/components/CartDrawer'
import Hero from '@/sections/Hero'
import Chapters from '@/sections/Chapters'
import Cuts from '@/sections/Cuts'
import Showcase from '@/sections/Showcase'
import Greek from '@/sections/Greek'
import OrderApp from '@/pages/OrderApp'
import { useRoute } from '@/lib/route'
import News from '@/sections/News'
import Shop from '@/sections/Shop'
import Butcher from '@/sections/Butcher'
import Reviews from '@/sections/Reviews'
import Order from '@/sections/Order'
import Hours from '@/sections/Hours'
import Footer from '@/sections/Footer'

export default function App() {
  const route = useRoute()
  const [dark, setDark] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const onDone = useCallback(() => { setLoaded(true); window.dispatchEvent(new CustomEvent('tram:enter')) }, [])
  const [startOnOrder] = useState(route === 'order')
  useEffect(() => { if (startOnOrder) onDone() }, [startOnOrder, onDone])
  useEffect(() => { initSmooth() }, [])
  useEffect(() => {
    if (route === 'order') { setDark(false); return }
    const els = Array.from(document.querySelectorAll<HTMLElement>('main > section'))
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setDark((e.target as HTMLElement).dataset.theme === 'dark') }), { rootMargin: '-8% 0px -88% 0px' })
    els.forEach((el) => io.observe(el))
    const onTheme = (e: Event) => setDark(Boolean((e as CustomEvent<{ dark: boolean }>).detail?.dark))
    window.addEventListener('tram:theme', onTheme)
    return () => { io.disconnect(); window.removeEventListener('tram:theme', onTheme) }
  }, [route])
  return (
    <>
      {!startOnOrder && <Preloader onDone={onDone} />}
      <Nav dark={dark} />
      {route === 'order' ? <OrderApp /> : (
      <main className={loaded ? '' : 'invisible'}>
        <Hero />
        <Chapters />
        <Showcase />
        <Greek />
        <Cuts />
        <Shop />
        <Butcher />
        <News />
        <Reviews />
        <Order />
        <Hours />
      </main>
      )}
      <Footer />
      {route === 'home' && <MobileBar />}
      <CleaverCursor />
      <ProductSheet />
      <CartDrawer />
    </>
  )
}
