/**
 * Ported from 21st.dev "Footer With Newsletter" by balick
 * https://21st.dev/@balick/components/footer-01
 * Kept: top grid with brand block and link columns, bottom bar, oversized background wordmark
 * fading into the ground. Changed: no newsletter, no socials row of icons, the wordmark is the
 * shop's name in slab, and the status dot is the real open/closed state.
 */
import { FacebookLogo } from '@phosphor-icons/react'
import { SHOP, isOpenNow } from '@/lib/data'

export default function Footer() {
  const open = isOpenNow()
  return (
    <footer className="relative overflow-hidden border-t border-ink/15 bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 md:px-8 md:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex max-w-sm flex-col gap-5">
            <a href="#hero" className="flex items-center gap-3 font-display text-2xl uppercase"><img src="/media/tram-mark.png" alt="" className="h-8 w-auto" />Το Τραμ</a>
            <p className="text-sm leading-6 text-ink-2">Παραδοσιακό κρεοπωλείο στον Πειραιά από το 1983. Εξυπηρετούμε όλο τον Πειραιά. Ελληνικό κρέας με ετικέτα, παρασκευές του εργαστηρίου, παραγγελίες γιορτών.</p>
          </div>
          <nav aria-label="Υποσέλιδο" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold">Διεύθυνση</h3>
              <p className="mt-4 text-sm text-ink-2">{SHOP.address}<br />{SHOP.area}</p>
              <a href={SHOP.maps} target="_blank" rel="noopener" className="mt-2 inline-block text-sm underline-offset-4 hover:underline">Οδηγίες</a>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Επικοινωνία</h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-2">
                <li><a className="hover:text-ink" href={SHOP.phoneHref}>{SHOP.phone}</a></li>
                <li><a className="hover:text-ink" href={SHOP.mobileHref}>{SHOP.mobile}</a></li>
                <li><a className="hover:text-ink" href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
                <li><a className="inline-flex items-center gap-1 hover:text-ink" href={SHOP.facebook} target="_blank" rel="noopener"><FacebookLogo size={16} weight="bold" /> Facebook</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Σελίδα</h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-2">
                <li><a className="hover:text-ink" href="#grammi">Τα είδη</a></li>
                <li><a className="hover:text-ink" href="#taftotita">Ταυτότητα κρέατος</a></li>
                <li><a className="hover:text-ink" href="#paraskeves">Παρασκευές</a></li>
                <li><a className="hover:text-ink" href="#paraggelia">Παραγγελία</a></li>
                <li><a className="hover:text-ink" href="#ores">Ώρες & πού</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-ink/15 py-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3 text-sm text-ink-2 sm:flex-row sm:items-center sm:gap-6">
            <span>© {new Date().getFullYear()} {SHOP.full}</span>
            <span className="inline-flex items-center gap-2"><span className={`h-2 w-2 ${open ? 'bg-green' : 'bg-ink/40'}`} />{open ? 'Ανοιχτά τώρα' : 'Κλειστά τώρα'}</span>
          </div>
          <span className="text-sm text-ink-2">Σχεδιασμός: <a href="https://stathisparas.com" className="hover:text-ink" target="_blank" rel="noopener">Στάθης Παρασκευόπουλος</a></span>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none px-5 md:px-8">
        <p className="-mb-[0.2em] bg-gradient-to-b from-ink/15 to-transparent bg-clip-text text-center font-display text-[clamp(6rem,26vw,22rem)] uppercase leading-none text-transparent">Το Τραμ</p>
      </div>
    </footer>
  )
}
