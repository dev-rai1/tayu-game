import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EXPANSION_MODULES } from '../constants/modules.js'

const MISSIONS = {
  'first-paycheck': [
    { prompt: 'Maya likes fixing computers. Which role best matches that interest?', answers: ['IT support apprentice', 'Choose any job only by its title'], correct: 0, why: 'Career exploration starts by connecting interests and skills to real work.' },
    { prompt: 'Maya can train for 6 weeks for a $20/hour role or start today at $14/hour. What should she compare?', answers: ['Only the first paycheck', 'Training cost, time, benefits, and long-term pay'], correct: 1, why: 'Human-capital choices trade income today for possible income later.' },
    { prompt: 'Which application detail gives an employer useful evidence?', answers: ['A skill and example of using it', 'A favorite color'], correct: 0, why: 'Applications connect skills and experience to the job.' },
    { prompt: 'Maya earns $800 gross. $120 is withheld and $40 pays for benefits. What is net pay?', answers: ['$640', '$680', '$800'], correct: 0, why: 'Net pay is $800 - $120 - $40 = $640.' },
    { prompt: 'What does a practice W-4 help an employer determine?', answers: ['A worker’s hourly wage', 'Federal income-tax withholding'], correct: 1, why: 'A W-4 guides withholding; it does not set wages.' },
    { prompt: 'Maya’s first goal is a $320 training fee. Which plan reaches it?', answers: ['$40 from each of 8 paychecks', '$10 from each of 8 paychecks'], correct: 0, why: 'Eight deposits of $40 total $320 and connect earnings to a specific goal.' },
  ],
  'rainy-day': [
    { prompt: 'Rio rents an apartment. Which policy protects his belongings?', answers: ['Renters insurance', 'The landlord’s building policy'], correct: 0, why: 'A landlord’s policy generally protects the building, not a renter’s possessions.' },
    { prompt: 'Nea owns a home. Which cost belongs in her housing plan?', answers: ['Repairs, tax, insurance, and the mortgage', 'Only the mortgage'], correct: 0, why: 'Ownership brings several costs that rent alone does not show.' },
    { prompt: 'A covered repair costs $2,000 with a $500 deductible. What does Rio pay first?', answers: ['$0', '$500', '$2,000'], correct: 1, why: 'The deductible is the amount paid before covered insurance benefits apply.' },
    { prompt: 'Which choice best manages an emergency?', answers: ['Insurance only', 'Savings only', 'Coverage plus emergency savings'], correct: 2, why: 'Coverage transfers defined risks; savings handles deductibles and uncovered costs.' },
    { prompt: 'A storm causes a covered $4,000 loss. With a $500 deductible, which outcome protects Rio’s rent money?', answers: ['Insurance pays the covered balance after $500', 'Rio pays all $4,000'], correct: 0, why: 'Coverage changes the outcome: Rio keeps more emergency cash after paying the deductible.' },
    { prompt: 'Replay the storm without insurance. What is the visible consequence?', answers: ['The insurer pays', 'Rio must use $4,000 of savings or borrow'], correct: 1, why: 'Without coverage, the household keeps the whole financial risk.' },
  ],
  'big-picture': [
    { prompt: 'Prices rise 5% while savings earn 1%. What happens to buying power?', answers: ['It rises', 'It falls'], correct: 1, why: 'Prices are rising faster than the money grows, so the same balance buys less.' },
    { prompt: 'When market interest rates rise, an older low-rate bond usually becomes...', answers: ['More attractive', 'Less attractive'], correct: 1, why: 'New bonds may offer higher rates, so an older low-rate bond can lose market value.' },
    { prompt: 'Which measure tracks the value of final goods and services produced?', answers: ['GDP', 'APR', 'Credit utilization'], correct: 0, why: 'Gross domestic product is a broad measure of production.' },
    { prompt: 'Unemployment rises sharply. Which household stake is most direct?', answers: ['Jobs and income may be harder to find', 'Every wage automatically rises'], correct: 0, why: 'Labor-market conditions affect job opportunities and household income.' },
    { prompt: 'A tariff raises the price of an imported part. What may happen next?', answers: ['The product can cost more', 'The part becomes free'], correct: 0, why: 'Trade policy can change business input costs and consumer prices.' },
    { prompt: 'During a slowdown, a temporary public spending increase is an example of...', answers: ['Fiscal policy', 'A credit score'], correct: 0, why: 'Government taxes and spending are fiscal policy and can affect total demand.' },
  ],
}

const STAKES = {
  'first-paycheck': 'Maya needs to fund training without missing rent.',
  'rainy-day': 'Rio and Nea must keep their homes stable after the same storm.',
  'big-picture': 'Nea must protect a family goal as prices, rates, and jobs change.',
}

const STORAGE_KEY = 'tayu-expansion-stamps-v1'
function readStamps() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }

export default function ExpansionMissions() {
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [stamps, setStamps] = useState(readStamps)
  const mission = useMemo(() => EXPANSION_MODULES.find((item) => item.id === selected), [selected])
  const question = selected ? MISSIONS[selected][step] : null

  const choose = (answerIndex) => setFeedback({ correct: answerIndex === question.correct, why: question.why })
  const next = () => {
    if (!feedback?.correct) { setFeedback(null); return }
    if (step + 1 < MISSIONS[selected].length) { setStep(step + 1); setFeedback(null); return }
    const nextStamps = [...new Set([...stamps, selected])]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStamps)); setStamps(nextStamps); setSelected(null); setStep(0); setFeedback(null)
  }

  return <main className="min-h-screen bg-[#eef8ff] px-4 py-8 text-navy"><div className="mx-auto max-w-5xl"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-electric">TAYU expansion missions</p><h1 className="mt-2 font-display text-4xl font-extrabold">Earn a stamp by making real-world choices</h1><p className="mt-2 max-w-3xl font-semibold text-navy/70">Wrong choices have a visible consequence and can be replayed immediately. These missions extend FCPS EPF coverage without changing saved core-module progress.</p></div><Link to="/modules" className="rounded-xl bg-navy px-4 py-3 font-extrabold text-white">Back to modules</Link></header>
    <section className="mt-6 rounded-3xl bg-white p-5 shadow-lg"><h2 className="font-display text-xl font-extrabold">My learning passport</h2><div className="mt-3 flex flex-wrap gap-2">{EXPANSION_MODULES.map((item) => <span key={item.id} className={`rounded-full px-4 py-2 text-sm font-extrabold ${stamps.includes(item.id) ? 'bg-teal text-navy' : 'bg-slate-100 text-slate-500'}`}>{stamps.includes(item.id) ? '✓' : '○'} {item.title}</span>)}</div></section>
    {!mission ? <section className="mt-6 grid gap-4 md:grid-cols-3">{EXPANSION_MODULES.map((item) => <article key={item.id} className="min-h-[250px] rounded-3xl border-2 border-white bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:border-electric"><div className="text-xs font-extrabold uppercase text-electric">{item.grades}</div><h2 className="mt-2 font-display text-2xl font-extrabold">{item.title}</h2><p className="mt-2 text-xs font-extrabold text-[#08785d]">{item.fcps}<br />{item.sol}</p><p className="mt-4 font-semibold text-navy/70">{item.summary}</p><p className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-bold">Stake: {STAKES[item.id]}</p><button aria-label={`Start ${item.title} mission`} onClick={() => { setSelected(item.id); setStep(0); setFeedback(null) }} className="mt-5 min-h-[48px] w-full rounded-xl bg-navy px-4 font-extrabold text-white">Start mission →</button></article>)}</section> : <section className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 shadow-xl"><div className="text-xs font-extrabold uppercase text-electric">{mission.title} · Decision {step + 1} of {MISSIONS[selected].length}</div><p className="mt-2 rounded-xl bg-slate-100 p-3 text-sm font-bold">Stake: {STAKES[selected]}</p><h2 className="mt-3 font-display text-2xl font-extrabold">{question.prompt}</h2><div className="mt-5 grid gap-3">{question.answers.map((answer, index) => <button key={answer} disabled={Boolean(feedback)} onClick={() => choose(index)} className="min-h-[54px] rounded-2xl border-2 border-slate-200 px-4 text-left font-extrabold hover:border-electric disabled:opacity-70">{answer}</button>)}</div>{feedback && <div role="status" aria-live="polite" className={`mt-5 rounded-2xl p-4 ${feedback.correct ? 'bg-teal/20' : 'bg-red-100'}`}><h3 className="font-extrabold">{feedback.correct ? 'Good evidence.' : 'That choice changes the character’s outcome. Try again.'}</h3><p className="mt-1 font-semibold">{feedback.why}</p><button onClick={next} className="mt-4 min-h-[44px] rounded-xl bg-navy px-5 font-extrabold text-white">{feedback.correct ? 'Continue' : 'Replay this decision'}</button></div>}</section>}</div></main>
}
