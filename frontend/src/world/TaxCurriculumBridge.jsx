import { useEffect, useMemo, useRef, useState } from 'react'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import {
  FIRST_BRACKET_LIMIT,
  SECOND_BRACKET_LIMIT,
  FIRST_BRACKET_RATE,
  SECOND_BRACKET_RATE,
  THIRD_BRACKET_RATE,
  GAME_STANDARD_DEDUCTION,
  GAME_STUDENT_SUPPLIES_DEDUCTION,
  MUNI_BOND_TAX_CALLBACK,
  TAX_CIVIC_CONNECTION,
  taxReturnMath,
} from '../scenarios/paycheckPlanet.js'
import { playVaultThunk } from '../services/sfx.js'
import { PAYCHECK_MODE_EVENT, isPaycheckWorldActive } from './paycheckMode.js'
import { useTaxLab } from './taxLabStore.js'

const money = (value) => `$${Math.round(Number(value || 0)).toLocaleString('en-US')}`

function Rail({ eyebrow, title, children }) {
  return <section className="pointer-events-auto absolute left-3 top-[calc(6.5rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-8rem)] w-[min(27vw,21rem)] min-w-[17rem] overflow-y-auto rounded-2xl border-2 border-[#ff8a3d] bg-[#fffdf8]/95 p-3 text-navy shadow-2xl backdrop-blur-sm max-[899px]:left-3 max-[899px]:right-3 max-[899px]:top-[calc(5.4rem+env(safe-area-inset-top,0px))] max-[899px]:max-h-[27dvh] max-[899px]:w-auto max-[899px]:min-w-0"><div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c95f14]">{eyebrow}</div><h3 className="mt-1 font-display text-lg font-extrabold">{title}</h3>{children}</section>
}

export function TaxCurriculumBridge() {
  const [active, setActive] = useState(() => isPaycheckWorldActive())
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)
  const stamped = useRef(false)
  const profile = loadProfile() || {}
  const muni = Boolean(profile.muniBondInvested || profile.muniBondExplored || Number(profile.bondAllocation?.muni || 0) > 0)
  const math = useMemo(() => taxReturnMath(taxCase), [taxCase])

  useEffect(() => {
    const sync = (event) => setActive(event?.detail?.active ?? isPaycheckWorldActive())
    sync()
    window.addEventListener(PAYCHECK_MODE_EVENT, sync)
    return () => window.removeEventListener(PAYCHECK_MODE_EVENT, sync)
  }, [])

  useEffect(() => {
    if (!active || phase !== 'complete' || stamped.current) return
    stamped.current = true
    playVaultThunk()
    saveProfile({ taxPaidStamped: true })
  }, [active, phase])

  if (!active) return null
  if (phase === 'intro') return <div className="pointer-events-none fixed inset-0 z-[610]"><Rail eyebrow="TX1 · Rex the Assessor" title="Taxes fund the town you already used"><p className="mt-2 text-xs font-bold leading-relaxed">Rex: “Taxes sound scary, but look around. The <strong>school bus</strong>, the <strong>clinic</strong>, and the <strong>ring road</strong> all need shared money.”</p><p className="mt-2 rounded-xl bg-sun/15 p-2 text-xs font-bold leading-relaxed">{TAX_CIVIC_CONNECTION}</p><p className="mt-2 text-xs font-bold leading-relaxed">The Tax Office turns that idea into a practice return: gross income → deductions → brackets → withholding → refund, amount due, or zero.</p></Rail></div>
  if (phase === 'steps' && stepNumber === 2) return <div className="pointer-events-none fixed inset-0 z-[610]"><Rail eyebrow="TX4 · Deduction cards" title="Two official reductions in TAYU"><div className="mt-2 grid gap-2"><div className="rounded-xl bg-white p-2 text-xs font-bold"><span className="text-electric">STANDARD DEDUCTION</span><div className="font-display text-xl font-extrabold">−{money(GAME_STANDARD_DEDUCTION)}</div></div><div className="rounded-xl bg-white p-2 text-xs font-bold"><span className="text-[#c95f14]">STUDENT SUPPLIES</span><div className="font-display text-xl font-extrabold">−{money(GAME_STUDENT_SUPPLIES_DEDUCTION)}</div></div></div><p className="mt-2 text-xs font-bold">Taxable income = gross income − deductions. The shrinking income bar represents that reduction.</p></Rail></div>
  if (phase === 'steps' && stepNumber === 3) return <div className="pointer-events-none fixed inset-0 z-[610]"><Rail eyebrow="TX5 · Bracket staircase" title="Fill from the bottom up"><div className="mt-2 space-y-1.5 text-xs font-extrabold"><div className="rounded-xl bg-electric/10 p-2">10% step · first {money(FIRST_BRACKET_LIMIT)} of taxable income</div><div className="rounded-xl bg-teal/15 p-2">12% step · dollars from {money(FIRST_BRACKET_LIMIT)} to {money(SECOND_BRACKET_LIMIT)}</div><div className="rounded-xl bg-brandpurple/10 p-2">22% step · only taxable dollars above {money(SECOND_BRACKET_LIMIT)}</div></div><p className="mt-2 text-xs font-bold leading-relaxed">Rates: {FIRST_BRACKET_RATE * 100}% → {SECOND_BRACKET_RATE * 100}% → {THIRD_BRACKET_RATE * 100}%. Reaching a higher step never makes the whole income use that rate.</p>{taxCase && <p className="mt-2 rounded-xl bg-white p-2 text-xs font-bold">This case’s final tax is about <strong>{math.effectiveRate}% of gross income</strong>. That is the effective rate.</p>}</Rail></div>
  if (phase === 'steps' && stepNumber === 5 && taxCase) {
    const outcome = math.refund > 0 ? 'REFUND' : math.amountDue > 0 ? 'AMOUNT DUE' : 'ZERO'
    return <div className="pointer-events-none fixed inset-0 z-[610]"><Rail eyebrow="TX6–TX7 · Postal Pat + Rex" title="Already paid vs. final bill"><div className="mt-2 rounded-xl bg-white p-2 text-xs font-bold">Postal Pat: “Already delivered! <strong>{money(math.withheld)}</strong> went to Rex during the year as withholding.”</div><div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs font-extrabold"><div className="rounded-xl bg-electric/10 p-2">ALREADY PAID<div className="font-display text-xl">{money(math.withheld)}</div></div><div className="rounded-xl bg-sun/20 p-2">FINAL TAX<div className="font-display text-xl">{money(math.finalTax)}</div></div></div><div className="mt-2 rounded-xl bg-teal/15 p-2 text-xs font-extrabold">Possible result for this case: {outcome}</div><p className="mt-2 text-xs font-bold leading-relaxed">Refund = you prepaid too much. Amount due = you prepaid too little. Zero = withholding matched the final tax exactly.</p></Rail></div>
  }
  if (phase === 'complete') return <div className="pointer-events-none fixed inset-0 z-[910]"><Rail eyebrow="TX8–TX9 · PAID" title="THUNK! Practice return filed"><div className="mt-2 rounded-2xl border-4 border-[#c95f14] bg-white p-3 text-center font-display text-3xl font-black text-[#c95f14] -rotate-2">PAID</div>{muni ? <div className="mt-3 rounded-xl border-2 border-teal/40 bg-teal/10 p-2 text-xs font-bold leading-relaxed"><strong>TAX-FREE MUNI CALLBACK:</strong> Rex recognized the municipal bonds you actually chose earlier. {MUNI_BOND_TAX_CALLBACK}</div> : <p className="mt-3 text-xs font-bold leading-relaxed">You did not put money into a muni bond earlier, so Rex skips the muni-tax callback and sends you straight to the Finale.</p>}<p className="mt-2 text-xs font-bold leading-relaxed">Rex: “The money you sent helped build the road you walked, pay for the school bus, and stock the clinic. Every dollar had a job.”</p><div className="mt-3 border-t border-navy/10 pt-2 text-[11px] font-bold text-navy/65">NPC-Rex-1: “Taxes are not punishment — they pay for shared roads, schools, and services.” · NPC-Rex-2: “Plan ahead for filing deadlines.” {muni ? '· NPC-Rex-3: “Muni interest gets special tax treatment.”' : ''}</div></Rail></div>
  return null
}
