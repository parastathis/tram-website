export const SHOP = {
  name: 'Το Τραμ',
  full: 'Παραδοσιακό Κρεοπωλείο «Το Τραμ»',
  owner: 'Ιπποκράτης Πεπονάς',
  since: 1983,
  address: 'Σπάρτης & Σαλαμίνος 124-126',
  area: 'Κοπή, Πειραιάς 185 46',
  phone: '210 461 9369',
  phoneHref: 'tel:+302104619369',
  mobile: '694 788 4743',
  mobileHref: 'tel:+306947884743',
  whatsapp: 'https://wa.me/306947884743',
  email: 'ippokratispeponas@gmail.com',
  facebook: 'https://www.facebook.com/totram2/',
  lat: 37.9537237, lng: 23.6309264,
  maps: 'https://www.google.com/maps/dir/?api=1&destination=37.9537237,23.6309264',
}

/** day 0 = Sunday */
export const HOURS: Record<number, [string, string][]> = {
  0: [],
  1: [['07:00', '15:00']],
  2: [['07:00', '14:30'], ['17:00', '20:30']],
  3: [['07:00', '15:00']],
  4: [['07:00', '14:30'], ['17:00', '20:30']],
  5: [['07:00', '14:30'], ['17:00', '20:30']],
  6: [['07:00', '15:00']],
}
export const DAYS = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']

export function isOpenNow(d = new Date()) {
  const ranges = HOURS[d.getDay()]
  const m = d.getHours() * 60 + d.getMinutes()
  return ranges.some(([a, b]) => {
    const [ah, am] = a.split(':').map(Number); const [bh, bm] = b.split(':').map(Number)
    return m >= ah * 60 + am && m < bh * 60 + bm
  })
}

export const STOPS = [
  { id: 'moschari', title: 'Μοσχάρι', line: 'Ελληνικό, νεαρό ζώο, με ονοματεπώνυμο.', text: 'Μοσχάρι από τη Φάρμα Ελασσόνας με ετικέτα ιχνηλασιμότητας AU2+: γέννηση, εκτροφή και σφαγή στην Ελλάδα. Μπριζόλες, κιλότο, κιμάς της ώρας.', image: '/media/still-ribeye.webp', alt: 'Μοσχαρίσιες μπριζόλες' },
  { id: 'arni', title: 'Αρνί & κατσίκι', line: 'Από τη Φάρμα Ελασσόνας.', text: 'Αρνάκι και κατσικάκι γάλακτος, ολόκληρα ή σε μερίδες. Για το Πάσχα και τα Χριστούγεννα με παραγγελία.', image: '/media/still-lamb-leg.webp', alt: 'Αρνίσιο μπούτι' },
  { id: 'xoirino', title: 'Χοιρινό', line: 'Από τη Φάρμα Ελασσόνας.', text: 'Πανσέτα, μπριζόλες, λαιμός. Κόβεται στο πάχος που θέλεις, την ώρα που το ζητάς. Ρολό γεμιστό και παντσέτα για το φούρνο.', image: '/media/still-pork-chops.webp', alt: 'Χοιρινές μπριζόλες' },
  { id: 'kotopoulo', title: 'Κοτόπουλο', line: 'Από την Πίνδο.', text: 'Ολόκληρο ή σε μερίδες: μπούτια, στήθος, φτερούγες. Μαριναρισμένο με τα μπαχαρικά του μαγαζιού όταν το προτιμάς έτοιμο.', image: '/media/still-case-hd.webp', alt: 'Η βιτρίνα του καταστήματος' },
  { id: 'paraskeves', title: 'Παρασκευές', line: 'Φτιάχνονται εδώ, στο εργαστήριο.', text: 'Χωριάτικα λουκάνικα, κοκορέτσι, ρολά, σουτζούκι μοσχαρίσιο πικάντικο, μπιφτέκια. Οι συνταγές του μαγαζιού από το 1983.', image: '/media/still-sausages-hanging.webp', alt: 'Χειροποίητα λουκάνικα' },
  { id: 'katepsygmena', title: 'Κατεψυγμένα & μαναβική', line: 'Ό,τι χρειάζεται το τραπέζι.', text: 'Κατεψυγμένα, φρέσκα λαχανικά και βασικά είδη, για να φεύγεις με όλα όσα θέλεις σε μία στάση.', image: '/media/shelves.webp', alt: 'Ράφια με προϊόντα' },
]

export const PREPARATIONS = [
  { id: 'loukanika', title: 'Χωριάτικα λουκάνικα', meta: 'Χοιρινό, πορτοκάλι, πράσο', image: '/media/still-sausages-rack.webp' },
  { id: 'kokoretsi', title: 'Κοκορέτσι', meta: 'Τυλιγμένο στο χέρι', image: '/media/still-kokoretsi-tray.webp' },
  { id: 'rola', title: 'Ρολά γεμιστά', meta: 'Έτοιμα για το φούρνο', image: '/media/still-rolls.webp' },
  { id: 'soutzouki', title: 'Σουτζούκι μοσχαρίσιο πικάντικο', meta: 'Το ζητάνε με το όνομά του', image: '/media/still-ribs.webp' },
  { id: 'pansetes', title: 'Πανσέτες & μπριζόλες κομμένες', meta: 'Στο πάχος που θέλεις', image: '/media/still-chops-row.webp' },
]

export const REVIEWS = [
  { name: 'Ε. Κ.', text: 'Τα καλύτερα κρέατα στην περιοχή και πάντα με άριστη εξυπηρέτηση.', source: 'Google' },
  { name: 'Ν. Κ.', text: 'Ψωνίζω από αυτό το κρεοπωλείο εδώ και 20 χρόνια. Το πικάντικο μοσχαρίσιο σουτζούκι είναι κάτι άλλο.', source: 'Google' },
  { name: 'C. C.', text: 'Καθαρό! Εξαιρετική ποιότητα και ευγένεια!', source: 'Google' },
  { name: 'Ν. Σ.', text: 'Άψογη εξυπηρέτηση και εξαιρετική ποιότητα!', source: 'Google' },
  { name: 'Α. Τ.', text: 'Άψογη εξυπηρέτηση! Πολύ καλά προϊόντα!', source: 'Google' },
  { name: 'Κ. Κ.', text: 'Άριστη ποιότητα και εξυπηρέτηση!', source: 'Google' },
  { name: 'Γ. Π.', text: 'Πρώτη ποιότητα!', source: 'Google' },
  { name: 'Τ. Α.', text: 'Εξυπηρετικός ιδιοκτήτης και προσωπικό, ποιοτικά προϊόντα και καθαρά.', source: 'Google' },
  { name: 'Evangelia A.', text: 'Άριστης ποιότητας προϊόντα και με πάρα πολύ νόστιμες και καινοτόμες παρασκευές! Συνεχίστε έτσι!', source: 'Facebook' },
  { name: 'Kassandra K.', text: 'Άριστη ποιότητα και εξυπηρέτηση!', source: 'Facebook' },
]
