import { useEffect, useState } from 'react'
import { WORDS } from './ModuleGlossary.jsx'
import { say } from '../services/speech.js'

const TIPS = {
  3: 'Pay for essentials first: food, housing, transport, and health. Cut optional treats before needs, and keep some money ready for surprises.',
  5: 'There is no guaranteed best investment. Compare the business information and risk, spread money across companies, and keep cash for money you may need soon.',
  6: 'Treasury = lend to the U.S. government. Municipal = lend to a state or local government. Corporate = lend to a company. Compare who owes you, payment risk, interest, and tax treatment.',
  7: 'Withholding is tax paid in advance. A deduction lowers taxable income; a credit lowers tax itself. Compare final tax with withholding to find a refund or amount due.',
}

export function MoneyWordHelp({ moduleNumber }) {
  const [open, setOpen] = useState(false)
  const module = WORDS[moduleNumber]
  useEffect(() => setOpen(false), [moduleNumber])
  useEffect(() => {
    if (!open) return
    const close = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [open])
  if (!module) return null
  return (
    <div className="pointer-events-none fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-[550]">
      {open && (
        <aside aria-label="Money words for this module" className="pointer-events-auto mb-2 max-h-[60vh] w-[min(90vw,25rem)] overflow-y-auto rounded-2xl border-2 border-teal bg-white p-4 text-navy shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-extrabold">{module.title}</h2>
            <button type="button" onClick={() => setOpen(false)} className="min-h-[44px] rounded-xl bg-navy/10 px-3 font-bold">Close</button>
          </div>
          {TIPS[moduleNumber] && <p className="mt-2 rounded-xl bg-teal/10 p-3 text-sm font-semibold">{TIPS[moduleNumber]}</p>}
          <dl className="mt-3 space-y-3">
            {module.terms.map(([word, meaning]) => <div key={word}><dt className="font-extrabold">{word}</dt><dd className="text-sm leading-relaxed">{meaning}</dd></div>)}
          </dl>
          <button type="button" onClick={() => say(module.terms.map(([word, meaning]) => `${word}. ${meaning}`).join(' '))} className="mt-3 min-h-[44px] rounded-xl bg-navy px-3 font-bold text-white">Read aloud</button>
        </aside>
      )}
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="pointer-events-auto min-h-[44px] rounded-xl border border-white/50 bg-navy px-3 text-sm font-extrabold text-white shadow-lg">Money words</button>
    </div>
  )
}
