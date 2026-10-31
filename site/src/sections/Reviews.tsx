/**
 * Ported from 21st.dev "Testimonial Marquee" by componentry (flush-dual variant)
 * https://21st.dev/@componentry/components/testimonial-marquee
 * Kept: two rows moving in opposite directions, duplicated track, pause on hover.
 * Changed: cards are scale tickets (mono, hairline right edge, square corners), no avatars,
 * only real reviews from Google and Facebook with initials.
 */
import { memo, useMemo, type ReactNode } from 'react'
import { REVIEWS } from '@/lib/data'
import { cn } from '@/lib/cn'

const Row = memo(({ children, direction = 'left', speed = 40 }: { children: ReactNode; direction?: 'left' | 'right'; speed?: number }) => (
  <div className="group flex overflow-hidden [--gap:0px]">
    {[0, 1].map((k) => (
      <div key={k} aria-hidden={k === 1} className={cn('flex min-w-full shrink-0 justify-start will-change-transform [backface-visibility:hidden] group-hover:[animation-play-state:paused]', direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right')} style={{ '--duration': `${speed}s` } as React.CSSProperties}>
        {children}
      </div>
    ))}
  </div>
))

const Ticket = ({ r }: { r: (typeof REVIEWS)[number] }) => (
  <div className="flex h-[200px] w-[340px] shrink-0 flex-col justify-between border-r border-ink/15 bg-ivory p-6 transition-colors hover:bg-ivory-2">
    <p className="font-mono text-[13px] leading-relaxed">«{r.text}»</p>
    <div className="flex items-center justify-between font-mono text-[12px] text-ink-2">
      <span>{r.name}</span>
      <span>{r.source}</span>
    </div>
  </div>
)

export default function Reviews() {
  const items = useMemo(() => { let a = [...REVIEWS]; while (a.length < 12) a = [...a, ...REVIEWS]; return a }, [])
  const half = Math.ceil(items.length / 2)
  return (
    <section className="border-y border-ink/15 bg-ivory py-20 text-ink md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Το λένε οι πελάτες, όχι εμείς.</h2>
        <p className="mt-3 text-ink-2">Κριτικές από το Google και το Facebook. 100% προτείνουν τη σελίδα.</p>
      </div>
      <div className="mt-10 flex flex-col gap-px border-y border-ink/15 bg-ink/15">
        <Row speed={48}>{items.slice(0, half).map((r, i) => <Ticket key={`a${i}`} r={r} />)}</Row>
        <Row speed={56} direction="right">{items.slice(half).map((r, i) => <Ticket key={`b${i}`} r={r} />)}</Row>
      </div>
    </section>
  )
}
