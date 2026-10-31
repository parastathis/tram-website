/**
 * Το εργαστήριο σε φιλμ και εικόνες: the generated films of the shop (Veo 3.1) and the WebGL
 * morph gallery (21st.dev Morph Gallery by kedhareswer) whose slides burn into each other.
 */
import { useState } from 'react'
import MorphGallery from '@/components/MorphGallery'

const ITEMS = [
  { src: '/media/gen/case.webp', alt: 'Η βιτρίνα', title: 'Η βιτρίνα, κάθε πρωί στις 7' },
  { src: '/media/gen/ribs.webp', alt: 'Μοσχάρι', title: 'Μοσχάρι Ελασσόνας' },
  { src: '/media/gen/sausages.webp', alt: 'Λουκάνικα', title: 'Λουκάνικα του εργαστηρίου' },
  { src: '/media/gen/lamb.webp', alt: 'Αρνί', title: 'Αρνί Βέροιας' },
  { src: '/media/gen/kokoretsi.webp', alt: 'Κοκορέτσι', title: 'Κοκορέτσι, τυλιγμένο στο χέρι' },
]

function Film({ src, poster, label }: { src: string; poster: string; label: string }) {
  return (
    <figure className="relative aspect-video w-full overflow-hidden bg-ink">
      <video className="absolute inset-0 h-full w-full object-cover" src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none' }} />
      <img src={poster} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      <figcaption className="absolute bottom-4 left-4 bg-ivory px-3 py-1 font-mono text-[12px] text-ink">{label}</figcaption>
    </figure>
  )
}

export default function Gallery() {
  const [i, setI] = useState(0)
  return (
    <section id="ergastirio-film" data-theme="dark" className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-8 md:pt-32">
        <h2 className="font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Μέσα στο μαγαζί</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Film src="/media/case.mp4" poster="/media/gen/case.webp" label="Η βιτρίνα" />
          <Film src="/media/sausages.mp4" poster="/media/gen/sausages.webp" label="Το εργαστήριο" />
        </div>
      </div>
      <div className="relative mt-4 md:mt-6">
        <MorphGallery items={ITEMS} height="80svh" autoplay={4200} index={i} onIndexChange={setI} />
        <div className="pointer-events-none absolute bottom-8 left-5 z-10 md:left-8">
          <p className="font-mono text-[12px] text-ivory/80">{String(i + 1).padStart(2, '0')} / {String(ITEMS.length).padStart(2, '0')}</p>
          <p className="mt-1 font-display text-[clamp(2.4rem,6vw,5rem)] uppercase leading-none">{ITEMS[i].title}</p>
        </div>
      </div>
    </section>
  )
}
