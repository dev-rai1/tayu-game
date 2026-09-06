import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MODULE_CATALOG } from '../constants/modules.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'

const CHECKS = {
  1: { q: 'You have $10. Which plan saves money for later?', a: ['$10 spend', '$6 spend and $4 save'], correct: 1 },
  2: { q: 'Sales are $20 and costs are $12. What is profit?', a: ['$8', '$32'], correct: 0 },
  3: { q: 'Which should a budget pay first?', a: ['Rent and food', 'A new game'], correct: 0 },
  4: { q: 'A message asks for your password. What should you do?', a: ['Send it', 'Stop and verify with the bank'], correct: 1 },
  5: { q: 'Which portfolio spreads risk?', a: ['One company', 'Several different investments'], correct: 1 },
  6: { q: 'Which bond usually has more credit risk?', a: ['A strong government bond', 'A weak company bond'], correct: 1 },
  7: { q: 'Gross pay is $500 and withholding is $75. What is take-home pay?', a: ['$425', '$575'], correct: 0 },
}

export default function AccessibleModules() {
  const [moduleNumber, setModuleNumber] = useState(null)
  const [answer, setAnswer] = useState(null)
  const profile = loadProfile() || {}
  const badges = profile.badges || []
  const module = MODULE_CATALOG.find((item) => item.n === moduleNumber)
  const check = CHECKS[moduleNumber]

  const finish = () => {
    if (answer !== check.correct) return
    saveProfile({ badges: [...new Set([...badges, module.badge])] })
    setModuleNumber(null)
    setAnswer(null)
  }

  return <main className="min-h-screen bg-[#eef8ff] px-4 py-8 text-slate-950"><div className="mx-auto max-w-4xl">
    <header className="rounded-3xl bg-white p-6 shadow-lg"><p className="text-xs font-extrabold uppercase tracking-widest text-electric">No 3D controls required</p><h1 className="mt-2 font-display text-4xl font-extrabold">Accessible module path</h1><p className="mt-3 max-w-3xl font-semibold leading-relaxed text-slate-700">This keyboard- and screen-reader-friendly path teaches and records the same seven module badges. Every control has visible focus, text instructions, and a retryable knowledge check.</p><Link to="/modules" className="mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-navy px-4 font-extrabold text-white">Back to module menu</Link></header>
    {!module ? <section aria-label="Accessible learning modules" className="mt-6 grid gap-4 sm:grid-cols-2">{MODULE_CATALOG.map((item) => <article key={item.n} className="rounded-3xl bg-white p-5 shadow-md"><p className="text-xs font-extrabold uppercase text-electric">Module {item.n} · {item.minutes}</p><h2 className="mt-1 font-display text-2xl font-extrabold">{item.title}</h2><p className="mt-2 font-semibold text-slate-700">{item.desc}</p><p className="mt-2 text-sm font-bold text-[#08785d]">{item.fcps.join(' · ')} · {item.sol.join(', ')}</p><button type="button" onClick={() => { setModuleNumber(item.n); setAnswer(null) }} aria-label={`Open accessible Module ${item.n}: ${item.title}`} className="mt-4 min-h-[48px] w-full rounded-xl bg-navy px-4 font-extrabold text-white">{badges.includes(item.badge) ? 'Review completed module' : 'Start text module'}</button></article>)}</section>
      : <section className="mt-6 rounded-3xl bg-white p-6 shadow-lg" aria-labelledby="accessible-module-title"><p className="text-xs font-extrabold uppercase text-electric">Module {module.n}</p><h2 id="accessible-module-title" className="mt-1 font-display text-3xl font-extrabold">{module.title}</h2><p className="mt-3 font-semibold leading-relaxed text-slate-700">{module.objective}</p><div className="mt-5 rounded-2xl bg-slate-100 p-5"><h3 className="text-xl font-extrabold">Check your choice</h3><p className="mt-2 font-semibold">{check.q}</p><fieldset className="mt-4 grid gap-3"><legend className="sr-only">Choose one answer</legend>{check.a.map((label, index) => <label key={label} className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl bg-white p-3 font-bold"><input type="radio" name="answer" checked={answer === index} onChange={() => setAnswer(index)} />{label}</label>)}</fieldset>{answer !== null && <p role="status" aria-live="polite" className={`mt-4 rounded-xl p-3 font-extrabold ${answer === check.correct ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'}`}>{answer === check.correct ? 'Correct. You can complete this module.' : 'Not yet. Review the goal and choose again.'}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setModuleNumber(null); setAnswer(null) }} className="min-h-[48px] rounded-xl bg-slate-200 px-4 font-extrabold">Choose another module</button><button type="button" disabled={answer !== check.correct} onClick={finish} className="min-h-[48px] rounded-xl bg-navy px-4 font-extrabold text-white disabled:opacity-40">Complete and save badge</button></div></div></section>}
  </div></main>
}
