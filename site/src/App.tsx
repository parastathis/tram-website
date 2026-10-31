import { useEffect } from 'react'
import { initSmooth } from '@/lib/smooth'
import Nav from '@/components/Nav'
import Hero from '@/sections/Hero'
import Line from '@/sections/Line'
import Identity from '@/sections/Identity'
import Preparations from '@/sections/Preparations'
import Shop from '@/sections/Shop'
import Reviews from '@/sections/Reviews'
import Order from '@/sections/Order'
import Hours from '@/sections/Hours'
import Footer from '@/sections/Footer'

export default function App() {
  useEffect(() => {
    initSmooth()
  }, [])
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Line />
        <Identity />
        <Preparations />
        <Shop />
        <Reviews />
        <Order />
        <Hours />
      </main>
      <Footer />
    </>
  )
}
