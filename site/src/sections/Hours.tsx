/**
 * The clock is the shop's own wall clock: the same logo artwork as the real dial (photo IMG_5817),
 * with live hands. The map is ported from 21st.dev "Expanded Map" by dev.shejanmahamud
 * https://21st.dev/@dev.shejanmahamud/components/expanded-map
 * Kept: real tiles computed from lat/lng with no API key, 3x3 tile grid, marker, tilt on hover.
 * Changed: OpenStreetMap tiles (CARTO now needs a key), always expanded, square, brand marker,
 * opens directions on click.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { MapPin, ArrowUpRight } from '@phosphor-icons/react'
import { DAYS, HOURS, SHOP, isOpenNow } from '@/lib/data'
import { cn } from '@/lib/cn'

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function Clock({ now }: { now: Date }) {
  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60
  const hand = (deg: number, len: number, w: number, color: string) =>
    ({ left: '50%', top: '50%', width: w, height: `${len}%`, background: color, transform: `translate(-50%, -100%) rotate(${deg}deg)`, transformOrigin: '50% 100%' }) as React.CSSProperties
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px] [border-radius:50%] border border-ink/15 bg-ivory shadow-[0_30px_60px_-30px_rgba(27,20,22,.35)]">
      <img src="/media/logo-ink.png" alt="Το ρολόι του μαγαζιού με το λογότυπο Το Τραμ, παράδοση από το 1980" className="absolute inset-[6%] h-[88%] w-[88%] object-contain" loading="lazy" />
      <div aria-hidden className="absolute rounded-sm" style={hand(h * 30, 24, 7, '#C8262D')} />
      <div aria-hidden className="absolute rounded-sm" style={hand(m * 6, 36, 5, '#C8262D')} />
      <div aria-hidden className="absolute" style={hand(s * 6, 40, 1.5, '#1B1416')} />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 [border-radius:50%] bg-red ring-2 ring-ivory" />
    </div>
  )
}

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z
  const x = ((lng + 180) / 360) * n
  const r = (lat * Math.PI) / 180
  const y = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n
  return { x, y }
}

function Map() {
  const zoom = 16
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-50, 50], [5, -5]), { stiffness: 300, damping: 30 })
  const ry = useSpring(useTransform(mx, [-50, 50], [-5, 5]), { stiffness: 300, damping: 30 })
  const tiles = useMemo(() => {
    const c = tileXY(SHOP.lat, SHOP.lng, zoom)
    const cx = Math.floor(c.x)
    const cy = Math.floor(c.y)
    const fx = (c.x - cx) * 256
    const fy = (c.y - cy) * 256
    const list: { url: string; dx: number; dy: number }[] = []
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) list.push({ url: `https://tile.openstreetmap.org/${zoom}/${cx + dx}/${cy + dy}.png`, dx, dy })
    return { list, fx, fy }
  }, [])
  return (
    <a
      href={SHOP.maps}
      target="_blank"
      rel="noopener"
      aria-label="Οδηγίες στο Google Maps"
      className="block"
      style={{ perspective: 1000 }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        mx.set(e.clientX - (r.left + r.width / 2))
        my.set(e.clientY - (r.top + r.height / 2))
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <motion.div ref={ref} style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }} className="relative aspect-[4/3] w-full overflow-hidden border border-ink/20 bg-ivory-2">
        <div className="absolute left-1/2 top-1/2 h-[768px] w-[768px]" style={{ transform: `translate(calc(-50% + ${128 - tiles.fx}px), calc(-50% + ${128 - tiles.fy}px))` }}>
          {tiles.list.map((t, i) => (
            <img key={i} src={t.url} alt="" className="absolute h-64 w-64 select-none" style={{ left: (t.dx + 1) * 256, top: (t.dy + 1) * 256 }} loading="lazy" draggable={false} />
          ))}
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin size={44} weight="fill" className="text-red drop-shadow-[0_6px_10px_rgba(27,20,22,.35)]" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ivory/95 px-4 py-3 text-sm">
          <span className="font-medium">{SHOP.address}, Κοπή</span>
          <span className="inline-flex items-center gap-1 font-mono text-[12px]">
            Οδηγίες <ArrowUpRight size={14} weight="bold" />
          </span>
        </div>
        <span className="absolute right-1 top-1 bg-ivory/80 px-1 font-mono text-[9px] text-ink-2">© OpenStreetMap</span>
      </motion.div>
    </a>
  )
}

export default function Hours() {
  const now = useNow()
  const open = isOpenNow(now)
  const today = now.getDay()
  return (
    <section id="ores" className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Clock now={now} />
            <p className={cn('mt-8 inline-flex items-center gap-2 border px-3 py-2 font-mono text-[12px]', open ? 'border-green text-green' : 'border-ink/30 text-ink-2')}>
              <span className={cn('h-2 w-2', open ? 'bg-green' : 'bg-ink/40')} />
              {open ? 'Ανοιχτά τώρα' : 'Κλειστά τώρα'}
            </p>
          </div>
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Ώρες.</h2>
            <table className="mt-8 w-full border-t border-ink/15 text-[15px]">
              <tbody>
                {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                  <tr key={d} className={cn('border-b border-ink/15', d === today && 'font-semibold')}>
                    <th scope="row" className="py-3 pr-4 text-left font-medium">
                      {DAYS[d]}
                      {d === today && <span className="ml-2 font-mono text-[11px] text-red">σήμερα</span>}
                    </th>
                    <td className="py-3 text-right font-mono text-[13px]">{HOURS[d].length ? HOURS[d].map((r) => r.join(' - ')).join(' · ') : 'Κλειστά'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 space-y-2 text-[15px]">
              <p>
                <a className="font-medium underline-offset-4 hover:underline" href={SHOP.phoneHref}>{SHOP.phone}</a> ·{' '}
                <a className="font-medium underline-offset-4 hover:underline" href={SHOP.mobileHref}>{SHOP.mobile}</a>
              </p>
              <p><a className="underline-offset-4 hover:underline" href={`mailto:${SHOP.email}`}>{SHOP.email}</a></p>
            </div>
          </div>
          <div className="md:col-span-4">
            <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Πού.</h2>
            <p className="mt-4 text-[15px] text-ink-2">{SHOP.address}, {SHOP.area}. Στη γωνία Σπάρτης και Σαλαμίνος.</p>
            <div className="mt-6"><Map /></div>
          </div>
        </div>
      </div>
    </section>
  )
}
