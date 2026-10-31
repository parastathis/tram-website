/**
 * Η γραμμή 41. The tram the shop is named after, as a full-bleed scene that opens with a slit
 * (clip-path from a thin horizontal line to full, the way a tram door opens) and parallaxes.
 * The scene is generated (Nano Banana / Veo, Google Flow) from the shop's own bag print.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'motion/react'

export default function Line() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const inView = useInView(ref, { once: true, margin: '-25% 0px' })
  return (
    <section ref={ref} id="grammi" data-theme="dark" className="relative overflow-hidden bg-ink text-ivory">
      <motion.div className="absolute inset-0" initial={{ clipPath: 'inset(49.5% 0 49.5% 0)' }} animate={inView ? { clipPath: 'inset(0% 0 0% 0)' } : {}} transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}>
        <motion.div className="absolute inset-x-0 -inset-y-[10%]" style={{ y }}>
          <img src="/media/gen/tram.webp" alt="Το τραμ 41 Πειραιά Περάματος σε παραλιακό δρόμο του Πειραιά" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <video className="absolute inset-0 h-full w-full object-cover" poster="/media/gen/tram.webp" src="/media/tram.mp4" autoPlay muted loop playsInline preload="metadata" onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = 'none' }} />
        </motion.div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />
      </motion.div>
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-40 md:px-8 md:pb-20">
        <p className="font-mono text-[12px]">Γραμμή Πειραιάς - Πέραμα, 1936 έως 1977</p>
        <h2 className="mt-3 font-display text-[clamp(3.4rem,10vw,9rem)] uppercase leading-[.85]">Το τραμ που<br />πέρναγε από δω</h2>
        <p className="mt-6 max-w-[48ch] text-lg text-ivory/85 md:text-xl">Το 41 κατέβαινε στο Πέραμα μέχρι το 1977. Τρία χρόνια μετά άνοιξε το κρεοπωλείο στη γωνία Σπάρτης και Σαλαμίνος και πήρε το όνομά του. Στη σακούλα μας είναι ακόμα το βαγόνι.</p>
      </div>
    </section>
  )
}
