import { useEffect, useMemo, useRef, useState } from 'react'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { BOND_STREET_SCRIPT, BOND_TYPES, allocationTotal, bondOutcome, gardenProfitStake } from '../scenarios/bondStreet.js'
import { BOND_WORLD_EVENT, placeAtBondStreetEntrance } from './BondStreetWorld.jsx'

const money = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`
const stars = (count) => '★'.repeat(count) + '☆'.repeat(Math.max(0, 3 - count))
const cents = (value) => Math.round(Number(value || 0) * 100) / 100

function emitBondWorld(kind, detail = {}) {
  try { window.dispatchEvent(new CustomEvent(BOND_WORLD_EVENT, { detail: { kind, ...detail } })) } catch { /* tests */ }
}

function saveBondCompletion(outcome) {
  const profile = loadProfile() || {}
  const badges = [...new Set([...(profile.badges || []), 'bond'])]
  saveProfile({
    badges,
    bondStreet: { completed: true, completedAt: new Date().toISOString(), principal: outcome.principal, interest: outcome.interest, ending: outcome.ending, allocations: Object.fromEntries(outcome.rows.map((row) => [row.id, row.principal])), investedInMuni: outcome.investedInMuni },
    muniBondInvested: outcome.investedInMuni,
  })
  window.dispatchEvent(new Event('tayu-bond-street-complete'))
}

function CompactShell({ eyebrow, title, children }) {
  return (
    <section className="pointer-events-auto max-h-[48dvh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] border-2 border-white/70 bg-[#fffdf8]/97 p-4 text-navy shadow-2xl backdrop-blur-sm sm:p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-electric">{eyebrow}</div>
      <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{title}</h2>
      {children}
    </section>
  )
}

export function BondStreetGate({ onComplete }) {
  const wallet = loadWallet() || {}
  const savedStake = gardenProfitStake(wallet)
  const stake = savedStake > 0 ? savedStake : 100
  const [step, setStep] = useState(0)
  const [allocation, setAllocation] = useState({ treasury: 0, muni: 0, corporate: 0 })
  const [watching, setWatching] = useState(null)
  const timerRef = useRef(null)
  const total = allocationTotal(allocation)
  const remaining = Math.max(0, cents(stake - total))
  const outcome = useMemo(() => bondOutcome(allocation), [allocation])

  useEffect(() => {
    placeAtBondStreetEntrance()
    emitBondWorld('arrival')
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [])

  const watchThen = (label, effect, nextStep, detail = {}, ms = 1450) => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setWatching(label)
    emitBondWorld(effect, detail)
    timerRef.current = window.setTimeout(() => {
      setWatching(null)
      if (typeof nextStep === 'number') setStep(nextStep)
    }, ms)
  }

  const setBond = (id, raw) => {
    const next = Math.max(0, cents(raw))
    setAllocation((current) => {
      const others = Object.entries(current).reduce((sum, [key, value]) => key === id ? sum : sum + Number(value || 0), 0)
      return { ...current, [id]: Math.min(next, Math.max(0, cents(stake - others))) }
    })
    emitBondWorld('allocation', { bondId: id })
  }

  const splitEvenly = () => {
    const totalCents = Math.max(0, Math.round(stake * 100))
    const base = Math.floor(totalCents / 3)
    const extra = totalCents - (base * 3)
    setAllocation({ treasury: (base + extra) / 100, muni: base / 100, corporate: base / 100 })
    watchThen('The three borrowers react to your split.', 'allocation', 2, { preset: 'even' }, 1100)
  }

  const putAllInTreasury = () => {
    setAllocation({ treasury: cents(stake), muni: 0, corporate: 0 })
    watchThen('The Treasury borrower reacts to your choice.', 'allocation', 2, { preset: 'treasury', bondId: 'treasury' }, 1100)
  }

  const runOutcomes = () => {
    if (stake <= 0 || total <= 0.009) return
    if (remaining > 0.009) setAllocation((current) => ({ ...current, treasury: cents(Number(current.treasury || 0) + remaining) }))
    watchThen('Watch interest coins move through Bond Street.', 'interest', 3, {}, 1800)
  }

  const finish = () => {
    saveBondCompletion(outcome)
    setWatching('Beau waves you toward the separate Module 7 Tax Office.')
    emitBondWorld('handoff')
    timerRef.current = window.setTimeout(() => onComplete?.(outcome), 1500)
  }

  if (watching) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1000] flex justify-center px-3">
        <div className="rounded-2xl border-2 border-teal/60 bg-navy/92 px-5 py-3 text-center text-white shadow-xl backdrop-blur-sm">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-teal">Module 6 · Watch the building</div>
          <div className="mt-1 font-display text-lg font-black">{watching}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex justify-end p-3 sm:p-5" data-bond-street="true">
      {step === 0 && <CompactShell eyebrow="Module 6 · Bond Street · Beau" title="Walk into the exchange and meet Beau"><p className="mt-2 text-sm font-semibold leading-relaxed text-navy/70">{BOND_STREET_SCRIPT.beauIntro}</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm font-bold"><div className="rounded-xl bg-teal/10 p-3">Stock = ownership</div><div className="rounded-xl bg-electric/10 p-3">Bond = lending</div></div><button type="button" onClick={() => watchThen('Beau introduces the three borrower NPCs.', 'borrowers', 1)} className="mt-4 min-h-[48px] w-full rounded-2xl bg-electric px-4 font-black text-white">Talk to Beau → watch the borrowers react</button></CompactShell>}

      {step === 1 && <CompactShell eyebrow="Module 6 · Borrower booths" title="Who should get your loan?"><p className="mt-2 text-sm font-semibold text-navy/70">{BOND_STREET_SCRIPT.allocation}</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{BOND_TYPES.map((bond) => <button key={bond.id} type="button" onClick={() => watchThen(`${bond.borrower} reacts as you inspect the booth.`, 'borrowers', 2, { bondId: bond.id }, 1100)} className="rounded-xl border-2 border-navy/10 bg-white p-3 text-left transition hover:border-electric"><div className="text-sm text-sun">{stars(bond.safety)}</div><div className="font-black">{bond.title}</div><div className="text-[10px] font-bold uppercase text-electric">{bond.borrower}</div><div className="mt-1 text-xs font-semibold text-navy/60">{Math.round(bond.rate * 100)}% practice interest</div></button>)}</div><button type="button" onClick={() => watchThen('All three borrower desks light up for your allocation decision.', 'allocation', 2)} className="mt-4 min-h-[48px] w-full rounded-2xl bg-electric px-4 font-black text-white">Go to the allocation counter →</button></CompactShell>}

      {step === 2 && <CompactShell eyebrow="Module 6 · Allocation counter" title={`Lend your ${money(stake)} stake`}><div className="mt-2 flex items-center justify-between rounded-xl bg-navy/5 p-3 text-sm font-bold"><span>Still unallocated</span><strong>{money(remaining)}</strong></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={splitEvenly} className="min-h-[44px] rounded-xl border-2 border-electric bg-electric/10 px-3 font-black text-electric">Split evenly</button><button type="button" onClick={putAllInTreasury} className="min-h-[44px] rounded-xl border-2 border-navy/15 bg-white px-3 font-black">All Treasury</button></div><div className="mt-3 space-y-2">{BOND_TYPES.map((bond) => <label key={bond.id} className="block rounded-xl border border-navy/10 bg-white p-3"><div className="flex justify-between gap-3 text-sm"><strong>{bond.title}</strong><strong>{money(allocation[bond.id])}</strong></div><input aria-label={`${bond.title} allocation`} type="range" min="0" max={stake} step="0.01" value={allocation[bond.id]} onChange={(event) => setBond(bond.id, event.target.value)} className="mt-2 w-full" /></label>)}</div><button type="button" disabled={stake <= 0 || total <= 0.009} onClick={runOutcomes} className="mt-4 min-h-[48px] w-full rounded-2xl bg-electric px-4 font-black text-white disabled:opacity-35">Lock decision → watch interest animation</button></CompactShell>}

      {step === 3 && <CompactShell eyebrow="Module 6 · Interest result" title="Your lending produced interest"><div className="mt-3 grid gap-2 sm:grid-cols-3">{outcome.rows.map((row) => <div key={row.id} className="rounded-xl bg-teal/10 p-3 text-sm"><strong className="block">{row.title}</strong><span>{money(row.principal)} → +{money(row.interest)}</span></div>)}</div><div className="mt-3 rounded-xl bg-navy p-3 text-white"><strong>{money(outcome.principal)} → {money(outcome.ending)}</strong><div className="text-xs text-white/70">Practice interest earned: {money(outcome.interest)}</div></div><button type="button" onClick={() => watchThen('Beau demonstrates rate risk on the seesaw.', 'rate', 4, {}, 1700)} className="mt-4 min-h-[48px] w-full rounded-2xl bg-electric px-4 font-black text-white">Make the rate-risk decision → watch the seesaw</button></CompactShell>}

      {step === 4 && <CompactShell eyebrow="Module 6 · Beau" title="Bonds are steadier, not risk-free"><p className="mt-2 text-sm font-semibold text-navy/70">{BOND_STREET_SCRIPT.rateLesson}</p><div className="mt-3 rounded-xl bg-sun/20 p-3 text-sm font-semibold">{BOND_STREET_SCRIPT.seniorityLesson}</div><button type="button" onClick={finish} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-4 font-black text-navy">Finish Module 6 → walk to Module 7 Tax Office</button></CompactShell>}
    </div>
  )
}

export function hasCompletedBondStreet() {
  const profile = loadProfile() || {}
  return Boolean(profile.bondStreet?.completed || (profile.badges || []).includes('bond'))
}
