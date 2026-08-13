import { useEffect, useMemo, useState } from 'react'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { BOND_STREET_SCRIPT, BOND_TYPES, allocationTotal, bondOutcome, gardenProfitStake } from '../scenarios/bondStreet.js'
import { BOND_WORLD_EVENT, placeAtBondStreetEntrance } from './BondStreetWorld.jsx'

const money = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`
const stars = (count) => '★'.repeat(count) + '☆'.repeat(Math.max(0, 3 - count))
const cents = (value) => Math.round(Number(value || 0) * 100) / 100

function emitBondWorld(kind, detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent(BOND_WORLD_EVENT, { detail: { kind, ...detail } }))
  } catch { /* custom events may be unavailable in non-browser tests */ }
}

function saveBondCompletion(outcome) {
  const profile = loadProfile() || {}
  const badges = [...new Set([...(profile.badges || []), 'bond'])]
  saveProfile({
    badges,
    bondStreet: {
      completed: true,
      completedAt: new Date().toISOString(),
      principal: outcome.principal,
      interest: outcome.interest,
      ending: outcome.ending,
      allocations: Object.fromEntries(outcome.rows.map((row) => [row.id, row.principal])),
      investedInMuni: outcome.investedInMuni,
    },
    muniBondInvested: outcome.investedInMuni,
  })
  window.dispatchEvent(new Event('tayu-bond-street-complete'))
}

export function BondStreetGate({ onComplete }) {
  const wallet = loadWallet() || {}
  const savedStake = gardenProfitStake(wallet)
  const stake = savedStake > 0 ? savedStake : 100
  const [step, setStep] = useState(0)
  const [allocation, setAllocation] = useState({ treasury: 0, muni: 0, corporate: 0 })
  const total = allocationTotal(allocation)
  const remaining = Math.max(0, cents(stake - total))
  const outcome = useMemo(() => bondOutcome(allocation), [allocation])

  useEffect(() => {
    placeAtBondStreetEntrance()
    emitBondWorld('arrival')
  }, [])

  const advance = (nextStep, effect) => {
    emitBondWorld(effect)
    setStep(nextStep)
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
    emitBondWorld('allocation', { preset: 'even' })
  }

  const putAllInTreasury = () => {
    setAllocation({ treasury: cents(stake), muni: 0, corporate: 0 })
    emitBondWorld('allocation', { preset: 'treasury' })
  }

  const runOutcomes = () => {
    if (stake <= 0 || total <= 0.009) return
    if (remaining > 0.009) {
      setAllocation((current) => ({ ...current, treasury: cents(Number(current.treasury || 0) + remaining) }))
    }
    emitBondWorld('interest')
    setStep(3)
  }

  const finish = () => {
    saveBondCompletion(outcome)
    emitBondWorld('handoff')
    onComplete?.(outcome)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-y-auto p-3 text-white sm:p-5" data-bond-street="true">
      <main className="pointer-events-auto ml-auto w-full max-w-2xl">
        <header className="rounded-[2rem] border-2 border-white/25 bg-[#071737]/92 p-4 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-sun">Module 6 · Bond Street · 3D district</div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div><h1 className="font-display text-3xl font-black sm:text-4xl">Bond Street</h1><p className="mt-2 max-w-xl text-sm font-bold text-white/80">Make a choice here, then watch the Bond Street building react behind this panel.</p></div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right text-navy"><div className="text-[10px] font-black uppercase tracking-wide text-navy/55">{savedStake > 0 ? 'Money Garden stake' : 'Practice stake'}</div><div className="font-display text-2xl font-black">{money(stake)}</div></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-teal transition-all" style={{ width: `${Math.min(100, ((step + 1) / 5) * 100)}%` }} /></div>
        </header>

        <section className="mt-3 rounded-[2rem] border border-white/25 bg-[#fffdf8]/96 p-4 text-navy shadow-2xl backdrop-blur-md sm:p-5">
          {step === 0 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Beau · Bond Guide</div>
            <h2 className="mt-2 font-display text-3xl font-black">Owner or lender?</h2>
            <p className="mt-3 font-semibold leading-relaxed">{BOND_STREET_SCRIPT.beauIntro}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-teal/10 p-4"><div className="font-display text-xl font-black">STOCK = ownership</div><p className="mt-1 text-sm font-semibold">You own a small piece of a company. Its price can move a lot.</p></div><div className="rounded-2xl bg-electric/10 p-4"><div className="font-display text-xl font-black">BOND = loan</div><p className="mt-1 text-sm font-semibold">You lend money. The borrower promises interest and repayment.</p></div></div>
            <button type="button" onClick={() => advance(1, 'borrowers')} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Open the three borrower booths →</button>
          </>}

          {step === 1 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Borrower booths</div>
            <h2 className="mt-2 font-display text-3xl font-black">Safety and interest trade off</h2>
            <p className="mt-2 font-semibold text-navy/70">{BOND_STREET_SCRIPT.allocation}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{BOND_TYPES.map((bond) => <article key={bond.id} className="rounded-2xl border-2 border-navy/10 bg-white p-3 shadow"><div className="text-lg text-sun" aria-label={`${bond.safety} of 3 safety stars`}>{stars(bond.safety)}</div><h3 className="mt-1 font-display text-lg font-black">{bond.title}</h3><div className="text-[10px] font-black uppercase tracking-wide text-electric">{bond.borrower}</div><p className="mt-2 text-xs font-semibold leading-relaxed text-navy/70">{bond.summary}</p><div className="mt-2 rounded-xl bg-navy/5 p-2 text-xs font-black">Practice interest: {Math.round(bond.rate * 100)}%</div></article>)}</div>
            <button type="button" onClick={() => advance(2, 'allocation')} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Walk to the allocation counter →</button>
          </>}

          {step === 2 && <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Allocation counter</div><h2 className="mt-2 font-display text-3xl font-black">Lend every dollar</h2></div><div className={`rounded-xl px-4 py-2 font-black ${remaining === 0 ? 'bg-teal/15 text-[#08785e]' : 'bg-sun/25'}`}>{money(remaining)} left</div></div>
            <p className="mt-2 text-sm font-semibold text-navy/70">{savedStake > 0 ? 'This money carries forward from Money Garden.' : 'TAYU supplied a $100 practice stake so Module 6 works even when opened directly.'}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={splitEvenly} className="min-h-[46px] rounded-xl border-2 border-electric bg-electric/10 px-4 font-black text-electric">Split evenly</button>
              <button type="button" onClick={putAllInTreasury} className="min-h-[46px] rounded-xl border-2 border-navy/15 bg-white px-4 font-black text-navy">All in Treasury</button>
            </div>
            <div className="mt-4 space-y-3">{BOND_TYPES.map((bond) => <label key={bond.id} className="block rounded-2xl border border-navy/10 bg-white p-3"><div className="flex items-center justify-between gap-3"><div><strong>{bond.title}</strong><div className="text-xs font-bold text-navy/55">{stars(bond.safety)} · {Math.round(bond.rate * 100)}% interest</div></div><div className="font-display text-xl font-black">{money(allocation[bond.id])}</div></div><input aria-label={`${bond.title} allocation`} type="range" min="0" max={stake} step="0.01" value={allocation[bond.id]} onChange={(event) => setBond(bond.id, event.target.value)} className="mt-2 w-full" /></label>)}</div>
            <button type="button" disabled={stake <= 0 || total <= 0.009} onClick={runOutcomes} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-35">{remaining > 0.009 && total > 0.009 ? `Run outcomes · place remaining ${money(remaining)} in Treasury →` : 'Run the bond outcomes →'}</button>
          </>}

          {step === 3 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Interest animation</div><h2 className="mt-2 font-display text-3xl font-black">Interest arrives</h2>
            <p className="mt-2 text-sm font-semibold text-navy/70">The coin animation in the Bond Street building shows your lending producing interest.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">{outcome.rows.map((row) => <article key={row.id} className="rounded-2xl border-2 border-teal/25 bg-teal/5 p-3"><div className="text-lg text-sun">{stars(row.safety)}</div><h3 className="mt-1 font-display text-lg font-black">{row.title}</h3><div className="mt-2 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-white p-2"><span className="block text-[10px] font-bold text-navy/50">LENT</span><strong>{money(row.principal)}</strong></div><div className="rounded-xl bg-white p-2"><span className="block text-[10px] font-bold text-navy/50">INTEREST</span><strong>+{money(row.interest)}</strong></div></div></article>)}</div>
            <div className="mt-4 rounded-2xl bg-navy p-4 text-white"><div className="text-xs font-black uppercase tracking-wide text-teal">Bond Street result</div><div className="mt-1 font-display text-3xl font-black">{money(outcome.principal)} → {money(outcome.ending)}</div><p className="mt-1 text-sm font-semibold text-white/75">You earned {money(outcome.interest)} in practice interest.</p></div>
            <button type="button" onClick={() => advance(4, 'rate')} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Watch the rate-risk seesaw →</button>
          </>}

          {step === 4 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Beau · Final lesson</div><h2 className="mt-2 font-display text-3xl font-black">Steadier does not mean risk-free</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-electric/10 p-4"><h3 className="font-display text-xl font-black">Bondholders are ahead</h3><p className="mt-2 text-sm font-semibold leading-relaxed">{BOND_STREET_SCRIPT.seniorityLesson}</p></div><div className="rounded-2xl bg-sun/20 p-4"><h3 className="font-display text-xl font-black">Rates and prices move opposite</h3><p className="mt-2 text-sm font-semibold leading-relaxed">{BOND_STREET_SCRIPT.rateLesson}</p></div></div>
            {outcome.investedInMuni && <div className="mt-4 rounded-2xl border-2 border-teal bg-teal/10 p-4"><div className="font-display text-xl font-black">Muni choice saved ✓</div><p className="mt-1 text-sm font-semibold">Rex will call this choice back in Module 7 at the Tax Office.</p></div>}
            <div className="mt-4 rounded-2xl bg-navy p-4 text-sm font-semibold text-white">{BOND_STREET_SCRIPT.handoff}</div>
            <button type="button" onClick={finish} className="mt-5 min-h-[56px] w-full rounded-2xl bg-teal px-5 font-black text-navy">Leave Bond Street for the Tax Office →</button>
          </>}
        </section>
      </main>
    </div>
  )
}

export function hasCompletedBondStreet() {
  const profile = loadProfile() || {}
  return Boolean(profile.bondStreet?.completed || (profile.badges || []).includes('bond'))
}
