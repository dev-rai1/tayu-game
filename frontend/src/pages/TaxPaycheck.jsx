import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadProfile, saveProfile } from '../services/walletStore.js'

const STEPS = [
  { id: 'paycheck', label: 'Read the paycheck' },
  { id: 'plan', label: 'Plan the take-home pay' },
  { id: 'surprise', label: 'Handle a life event' },
]

const JOBS = [
  { id: 'library', title: 'Library helper', gross: 120, taxRate: 10, note: 'A calm first job with a simple paycheck.' },
  { id: 'camp', title: 'Camp assistant', gross: 160, taxRate: 15, note: 'More hours and a slightly larger tax amount.' },
  { id: 'design', title: 'Design gig', gross: 200, taxRate: 20, note: 'Higher pay, with more money set aside for taxes.' },
]

const EVENTS = [
  { id: 'bike', title: 'Bike repair', cost: 24, emoji: '🚲', copy: 'Your bike needs a repair before next week.' },
  { id: 'gift', title: 'Friend celebration', cost: 18, emoji: '🎁', copy: 'You want to buy a thoughtful gift this weekend.' },
  { id: 'trip', title: 'School trip', cost: 30, emoji: '🚌', copy: 'A class trip payment is due soon.' },
]

const money = (value) => `$${Number(value || 0).toFixed(0)}`

export default function TaxPaycheck() {
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [job, setJob] = useState(JOBS[0])
  const [taxAnswer, setTaxAnswer] = useState('')
  const [taxResult, setTaxResult] = useState(null)
  const [plan, setPlan] = useState({ now: 0, later: 0, give: 0, taxReserve: 0 })
  const [event, setEvent] = useState(EVENTS[0])
  const [eventChoice, setEventChoice] = useState('')
  const [finished, setFinished] = useState(false)

  const tax = useMemo(() => Math.round(job.gross * job.taxRate / 100), [job])
  const takeHome = job.gross - tax
  const allocated = Object.values(plan).reduce((sum, value) => sum + Number(value || 0), 0)
  const remaining = takeHome - allocated
  const eventReady = Number(plan.later) >= event.cost

  const chooseJob = (nextJob) => {
    setJob(nextJob)
    setTaxAnswer('')
    setTaxResult(null)
    setPlan({ now: 0, later: 0, give: 0, taxReserve: 0 })
    setEventChoice('')
  }

  const checkTax = () => {
    const correct = Number(taxAnswer) === tax
    setTaxResult(correct ? 'correct' : 'retry')
    if (correct) window.setTimeout(() => setStep(1), 650)
  }

  const updatePlan = (key, value) => {
    const next = Math.max(0, Math.round(Number(value) || 0))
    setPlan((current) => ({ ...current, [key]: next }))
  }

  const continuePlan = () => {
    if (remaining !== 0 || Number(plan.later) <= 0) return
    setStep(2)
  }

  const complete = () => {
    const goodChoice = eventChoice === (eventReady ? 'pay' : 'adjust')
    if (!goodChoice) return
    const profile = loadProfile() || {}
    const badges = [...new Set([...(profile.badges || []), 'tax'])]
    saveProfile({ badges, taxLab: { job: job.id, gross: job.gross, tax, takeHome, plan, event: event.id, completedAt: new Date().toISOString() } })
    setFinished(true)
  }

  if (finished) {
    return (
      <main className="grid min-h-screen place-items-center bg-navy px-5 py-10 text-white">
        <section className="w-full max-w-xl rounded-3xl border-4 border-teal bg-white p-7 text-center text-navy shadow-2xl" role="status" aria-live="polite">
          <div className="text-6xl" aria-hidden>🧾✨</div>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Module 5 complete</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">You built a paycheck plan</h1>
          <p className="mt-3 font-semibold text-navy/75">You calculated taxes, found take-home pay, allocated every dollar, and prepared for a real-life expense.</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-sm font-extrabold">
            <div className="rounded-2xl bg-electric/10 p-3">Gross<br />{money(job.gross)}</div>
            <div className="rounded-2xl bg-sun/30 p-3">Taxes<br />{money(tax)}</div>
            <div className="rounded-2xl bg-teal/20 p-3">Take-home<br />{money(takeHome)}</div>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => nav('/modules')} className="min-h-[54px] rounded-2xl bg-electric px-4 font-extrabold text-white">Back to module map</button>
            <button type="button" onClick={() => { setFinished(false); setStep(0); setTaxAnswer(''); setTaxResult(null); setPlan({ now: 0, later: 0, give: 0, taxReserve: 0 }); setEventChoice('') }} className="min-h-[54px] rounded-2xl bg-navy/10 px-4 font-extrabold text-navy">Try another job</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module 5</p>
            <h1 className="font-display text-3xl font-extrabold">Paycheck Planet</h1>
            <p className="mt-1 max-w-2xl font-semibold text-white/70">Earn money, calculate a simple tax, and make choices with what actually reaches your account.</p>
          </div>
          <Link to="/modules" className="rounded-xl bg-white/10 px-4 py-2 font-extrabold">Exit module</Link>
        </header>

        <ol className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Module progress">
          {STEPS.map((item, index) => <li key={item.id} className={`rounded-2xl border px-4 py-3 text-sm font-extrabold ${index === step ? 'border-teal bg-teal/15 text-teal' : index < step ? 'border-white/20 bg-white/10' : 'border-white/10 bg-black/20 text-white/45'}`}>{index + 1}. {item.label}</li>)}
        </ol>

        {step === 0 && (
          <section className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-5">
            <h2 className="font-display text-2xl font-extrabold">Choose a job</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{JOBS.map((option) => <button key={option.id} type="button" onClick={() => chooseJob(option)} className={`rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${job.id === option.id ? 'border-sun bg-sun/10' : 'border-white/10 bg-black/20 hover:border-white/30'}`}><span className="block font-extrabold text-sun">{option.title}</span><span className="mt-1 block text-2xl font-extrabold">{money(option.gross)}</span><span className="block text-xs font-bold text-white/60">Gross pay · {option.taxRate}% tax</span><span className="mt-2 block text-sm font-semibold text-white/75">{option.note}</span></button>)}</div>

            <div className="mt-5 grid gap-4 rounded-3xl bg-black/25 p-5 md:grid-cols-[1fr_220px]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wide text-teal">Paycheck math</p>
                <h3 className="mt-1 text-xl font-extrabold">What tax amount comes out?</h3>
                <p className="mt-2 font-semibold text-white/75">Find {job.taxRate}% of {money(job.gross)}. Tip: {job.taxRate}% means {job.taxRate} out of every 100.</p>
                <div className="mt-4 flex flex-wrap items-center gap-2"><span className="font-extrabold">Tax = $</span><input aria-label="Tax amount" inputMode="numeric" value={taxAnswer} onChange={(event) => { setTaxAnswer(event.target.value.replace(/[^0-9]/g, '')); setTaxResult(null) }} className="w-28 rounded-xl border-2 border-white/20 bg-navy px-3 py-3 text-xl font-extrabold outline-none focus:border-teal" /><button type="button" onClick={checkTax} className="min-h-[50px] rounded-xl bg-electric px-5 font-extrabold">Check my math</button></div>
                <p className="mt-3 min-h-7 font-extrabold" aria-live="polite">{taxResult === 'correct' ? `Correct! ${money(job.gross)} − ${money(tax)} = ${money(takeHome)} take-home pay.` : taxResult === 'retry' ? 'Not quite. Try dividing the gross pay into groups of 10 or 20.' : ''}</p>
              </div>
              <div className={`grid place-items-center rounded-3xl border-2 p-4 text-center transition-all ${taxResult === 'correct' ? 'scale-105 border-teal bg-teal/20' : taxResult === 'retry' ? 'animate-pulse border-sun bg-sun/10' : 'border-white/10 bg-white/5'}`} aria-hidden>
                <div><div className="text-6xl">{taxResult === 'correct' ? '✅' : taxResult === 'retry' ? '🧮' : '🧾'}</div><div className="mt-2 font-extrabold">{taxResult === 'correct' ? 'Paycheck cleared!' : taxResult === 'retry' ? 'Recalculate' : 'Gross → tax → take-home'}</div></div>
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-teal">Take-home pay: {money(takeHome)}</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">Give every dollar a job</h2>
            <p className="mt-2 font-semibold text-white/70">Allocate exactly {money(takeHome)}. Keep something for a later need. A tax reserve is useful for gig work where taxes may not be removed automatically.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{[
              ['now', 'Spend now', '🍿', 'Small current choices'],
              ['later', 'Save for later', '🎯', 'Upcoming needs and goals'],
              ['give', 'Give', '🤝', 'Helping someone or a cause'],
              ['taxReserve', 'Extra tax reserve', '🧾', 'Useful when taxes were not withheld'],
            ].map(([key, label, emoji, copy]) => <label key={key} className="rounded-2xl bg-black/20 p-4"><span className="flex items-center justify-between gap-3"><span className="font-extrabold">{emoji} {label}</span><span className="text-lg font-extrabold text-sun">{money(plan[key])}</span></span><span className="mt-1 block text-xs font-semibold text-white/60">{copy}</span><input aria-label={`${label} amount`} type="range" min="0" max={takeHome} step="1" value={plan[key]} onChange={(event) => updatePlan(key, event.target.value)} className="mt-4 w-full" /></label>)}</div>
            <div className={`mt-5 rounded-2xl border-2 p-4 ${remaining === 0 ? 'border-teal bg-teal/10' : remaining < 0 ? 'border-rose-400 bg-rose-400/10' : 'border-sun bg-sun/10'}`} aria-live="polite"><div className="flex items-center justify-between gap-3 font-extrabold"><span>Money left to allocate</span><span className="text-2xl">{money(remaining)}</span></div><p className="mt-1 text-sm font-semibold text-white/70">{remaining === 0 && Number(plan.later) > 0 ? 'Balanced plan. You used only the money that reached you.' : remaining < 0 ? 'Your plan spends more than your take-home pay. Reduce one area.' : remaining === 0 ? 'Balanced, but add at least $1 for a later need.' : 'Keep adjusting until every take-home dollar has a purpose.'}</p></div>
            <button type="button" disabled={remaining !== 0 || Number(plan.later) <= 0} onClick={continuePlan} className="mt-4 min-h-[52px] w-full rounded-2xl bg-electric px-5 font-extrabold disabled:cursor-not-allowed disabled:opacity-40">Test this plan with a life event →</button>
          </section>
        )}

        {step === 2 && (
          <section className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-5">
            <h2 className="font-display text-2xl font-extrabold">A future expense appears</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{EVENTS.map((option) => <button key={option.id} type="button" onClick={() => { setEvent(option); setEventChoice('') }} className={`rounded-2xl border-2 p-4 text-left ${event.id === option.id ? 'border-teal bg-teal/10' : 'border-white/10 bg-black/20'}`}><span className="text-3xl" aria-hidden>{option.emoji}</span><span className="mt-2 block font-extrabold">{option.title}</span><span className="text-sm font-bold text-sun">Costs {money(option.cost)}</span></button>)}</div>
            <div className={`mt-5 rounded-3xl border-2 p-5 ${eventReady ? 'border-teal bg-teal/10' : 'border-sun bg-sun/10'}`}><p className="font-extrabold">{event.emoji} {event.copy}</p><p className="mt-2 text-lg font-extrabold">Later fund: {money(plan.later)} · Cost: {money(event.cost)}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => setEventChoice('pay')} className={`min-h-[58px] rounded-2xl border-2 px-4 font-extrabold ${eventChoice === 'pay' ? 'border-white bg-electric' : 'border-white/15 bg-black/20'}`}>Pay from the later fund</button><button type="button" onClick={() => setEventChoice('adjust')} className={`min-h-[58px] rounded-2xl border-2 px-4 font-extrabold ${eventChoice === 'adjust' ? 'border-white bg-electric' : 'border-white/15 bg-black/20'}`}>Adjust the plan first</button></div><p className="mt-3 min-h-6 font-extrabold" aria-live="polite">{eventChoice && eventChoice === (eventReady ? 'pay' : 'adjust') ? eventReady ? 'Good decision. Your earlier allocation covered the expense.' : 'Good decision. The later fund is short, so changing the plan avoids pretending the money is available.' : eventChoice ? 'Think again: compare the later fund with the event cost.' : ''}</p></div>
            <button type="button" disabled={!eventChoice || eventChoice !== (eventReady ? 'pay' : 'adjust')} onClick={complete} className="mt-4 min-h-[52px] w-full rounded-2xl bg-teal px-5 font-extrabold text-navy disabled:cursor-not-allowed disabled:opacity-40">Complete Paycheck Planet</button>
          </section>
        )}
      </div>
    </main>
  )
}
