/**
 * Κουίζ: ποιο κομμάτι; The question every customer asks at the counter, as a four-question quiz
 * that ends in a cut, a quantity and a ready order. Structure follows the 21st.dev Product Finder
 * Quiz pattern (ziegfiroyt/ecommerce46) he approved on an earlier site: a question as the heading,
 * "Κουίζ · 4 ερωτήσεις · 1 λεπτό", "Ερώτηση n από 4" with a bar, numbered answers, "γιατί ρωτάμε".
 */
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Btn from '@/components/Btn'
import { cn } from '@/lib/cn'
import { SHOP } from '@/lib/data'

type Q = { id: string; q: string; why: string; options: { label: string; value: string }[] }
const QUESTIONS: Q[] = [
  { id: 'how', q: 'Πώς θα το μαγειρέψεις;', why: 'Κάθε κομμάτι θέλει τον τρόπο του. Το ίδιο ζώο δίνει σούβλα και κατσαρόλα.', options: [{ label: 'Σούβλα', value: 'souvla' }, { label: 'Φούρνος', value: 'fournos' }, { label: 'Σχάρα', value: 'sxara' }, { label: 'Κατσαρόλα', value: 'katsarola' }] },
  { id: 'who', q: 'Πόσοι είστε στο τραπέζι;', why: 'Για να σου πούμε κιλά, όχι «λίγο» και «πολύ».', options: [{ label: '2 με 3', value: '3' }, { label: '4 με 6', value: '5' }, { label: '8 με 10', value: '9' }, { label: 'Γιορτή, πάνω από 12', value: '14' }] },
  { id: 'meat', q: 'Τι σας αρέσει πιο πολύ;', why: 'Το μοσχάρι, το αρνί και το χοιρινό έχουν άλλο κομμάτι για την ίδια δουλειά.', options: [{ label: 'Μοσχάρι', value: 'beef' }, { label: 'Αρνί ή κατσίκι', value: 'lamb' }, { label: 'Χοιρινό', value: 'pork' }, { label: 'Ό,τι προτείνετε', value: 'any' }] },
  { id: 'when', q: 'Πότε θα περάσεις;', why: 'Οι μεγάλες παραγγελίες θέλουν μία μέρα για να κοπούν σωστά.', options: [{ label: 'Σήμερα', value: 'today' }, { label: 'Αύριο', value: 'tomorrow' }, { label: 'Το Σαββατοκύριακο', value: 'weekend' }, { label: 'Για γιορτή', value: 'holiday' }] },
]

function recommend(a: Record<string, string>) {
  const how = a.how, meat = a.meat === 'any' ? (how === 'souvla' ? 'lamb' : how === 'sxara' ? 'pork' : 'beef') : a.meat
  const table: Record<string, Record<string, string>> = {
    souvla: { beef: 'Κοντοσούβλι από μοσχαρίσιο λαιμό', lamb: 'Αρνί ολόκληρο, με κοκορέτσι', pork: 'Κοντοσούβλι από χοιρινό λαιμό' },
    fournos: { beef: 'Κιλότο μοσχαρίσιο', lamb: 'Μπούτι αρνίσιο με πατάτες', pork: 'Παντσέτα ή ρολό γεμιστό' },
    sxara: { beef: 'Μπριζόλες μοσχαρίσιες', lamb: 'Παϊδάκια', pork: 'Χοιρινές μπριζόλες λαιμού και λουκάνικα' },
    katsarola: { beef: 'Σπάλα ή ποντίκι μοσχαρίσιο', lamb: 'Αρνί σπάλα για φρικασέ', pork: 'Χοιρινό λαιμό για λεμονάτο' },
  }
  const people = Number(a.who || 4)
  const perHead = how === 'souvla' && meat === 'lamb' ? 0.9 : how === 'sxara' ? 0.35 : 0.3
  const kg = Math.max(0.5, Math.round(people * perHead * 2) / 2)
  return { cut: table[how]?.[meat] ?? 'Μπριζόλες μοσχαρίσιες', kg, meatLabel: { beef: 'Μοσχάρι', lamb: 'Αρνί & κατσίκι', pork: 'Χοιρινό' }[meat] ?? 'Μοσχάρι' }
}

export default function Cuts() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const done = step >= QUESTIONS.length
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]
  const rec = useMemo(() => (done ? recommend(answers) : null), [done, answers])
  const pick = (id: string, v: string) => { setAnswers((a) => ({ ...a, [id]: v })); setStep((s) => s + 1) }
  const reset = () => { setAnswers({}); setStep(0) }
  const whenLabel = { today: 'σήμερα', tomorrow: 'αύριο', weekend: 'το Σαββατοκύριακο', holiday: 'για τη γιορτή' }[answers.when] ?? ''
  const wa = rec ? `${SHOP.whatsapp}?text=${encodeURIComponent(`Γεια σας, θα ήθελα ${rec.kg} kg ${rec.cut} για παραλαβή ${whenLabel}.`)}` : '#'

  return (
    <section id="kommati" className="bg-ivory text-ink">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <p className="font-mono text-[12px] text-ink-2">Κουίζ · 4 ερωτήσεις · 1 λεπτό</p>
            <h2 className="mt-3 font-display text-[clamp(3.2rem,8vw,7rem)] uppercase leading-[.9]">Ποιο κομμάτι να πάρω;</h2>
            <p className="mt-5 max-w-[42ch] text-lg text-ink-2">Ό,τι ρωτάς στον πάγκο. Απάντησε στα τέσσερα και σου λέμε κομμάτι και κιλά, έτοιμα για παραγγελία.</p>
            <div className="mt-10 hidden aspect-[16/10] w-full overflow-hidden bg-ivory-2 md:block">
              <img src="/media/gen/chart.webp" alt="Σχέδιο με τα κομμάτια του μοσχαριού" className="h-full w-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/media/gen/ribs.webp' }} />
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <div className="border-2 border-ink bg-ivory p-6 md:p-8">
              <div className="flex items-center justify-between font-mono text-[12px] text-ink-2">
                <span>{done ? 'Η πρότασή μας' : `Ερώτηση ${step + 1} από ${QUESTIONS.length}`}</span>
                <button type="button" onClick={reset} className="underline-offset-4 hover:underline">Από την αρχή</button>
              </div>
              <div className="mt-3 h-1 w-full bg-ink/10"><motion.div className="h-full bg-red" animate={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></div>

              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.div key={q.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <h3 className="mt-6 font-display text-4xl uppercase leading-none md:text-5xl">{q.q}</h3>
                    <ol className="mt-6 grid gap-2 sm:grid-cols-2">
                      {q.options.map((o, i) => (
                        <li key={o.value}>
                          <button type="button" onClick={() => pick(q.id, o.value)} className={cn('group flex w-full items-center gap-4 border-2 border-ink/20 px-4 py-4 text-left transition-colors duration-200 hover:border-red hover:bg-red hover:text-ivory', answers[q.id] === o.value && 'border-red bg-red text-ivory')}>
                            <span className="font-mono text-[12px] opacity-60">{i + 1}</span>
                            <span className="font-display text-2xl uppercase leading-none">{o.label}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-5 text-sm text-ink-2"><span className="font-semibold">Γιατί ρωτάμε:</span> {q.why}</p>
                  </motion.div>
                ) : (
                  <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <p className="mt-6 font-mono text-[12px] text-ink-2">{rec!.meatLabel}</p>
                    <h3 className="mt-2 font-display text-4xl uppercase leading-[.95] md:text-5xl">{rec!.cut}</h3>
                    <p className="mt-4 text-lg">Για το τραπέζι σου υπολογίζουμε <span className="font-mono font-semibold">{rec!.kg} kg</span>. Το κόβουμε {whenLabel || 'όταν περάσεις'}, όπως το θέλεις.</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Btn href={wa} target="_blank">Στείλε την παραγγελία</Btn>
                      <Btn href={SHOP.phoneHref} variant="ghost">Πάρε τηλέφωνο</Btn>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
