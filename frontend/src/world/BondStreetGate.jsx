import { useMemo, useState } from 'react'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { BOND_STREET_SCRIPT, BOND_TYPES, allocationTotal, bondOutcome, gardenProfitStake } from '../scenarios/bondStreet.js'

const money = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`
const stars = (count) => '★'.repeat(count) + '☆'.repeat(Math.max(0, 3 - count))
const cents = (value) => Math.round(Number(value || 0) * 100) / 100

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
  // A stale/incomplete save can reach Bond Street without the module-select
  // session flag or a usable Money Garden balance. Never strand the learner
  // with three $0 sliders; use the same clearly labelled practice stake that a
  // direct Module 6 launch receives.
  const stake = savedStake > 0 ? savedStake : 100
  const [step, setStep] = useState(0)
  const [allocation, setAllocation] = useState({ treasury: 0, muni: 0, corporate: 0 })
  const total = allocationTotal(allocation)
  const remaining = Math.max(0, cents(stake - total))
  const outcome = useMemo(() => bondOutcome(allocation), [allocation])

  const setBond = (id, raw) => {
    const next = Math.max(0, cents(raw))
    setAllocation((current) => {
      const others = Object.entries(current).reduce((sum, [key, value]) => key === id ? sum : sum + Number(value || 0), 0)
      return { ...current, [id]: Math.min(next, Math.max(0, cents(stake - others))) }
    })
  }

  const splitEvenly = () => {
    const totalCents = Math.max(0, Math.round(stake * 100))
    const base = Math.floor(totalCents / 3)
    const extra = totalCents - (base * 3)
    setAllocation({ treasury: (base + extra) / 100, muni: base / 100, corporate: base / 100 })
  }

  const putAllInTreasury = () => setAllocation({ treasury: cents(stake), muni: 0, corporate: 0 })

  const runOutcomes = () => {
    if (stake <= 0 || total <= 0.009) return
    if (remaining > 0.009) {
      setAllocation((current) => ({ ...current, treasury: cents(Number(current.treasury || 0) + remaining) }))
    }
    setStep(3)
  }

  const finish = () => {
    saveBondCompletion(outcome)
    onComplete?.(outcome)
  }

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-[#071737]/96 p-4 text-white backdrop-blur-md sm:p-7" data-bond-street="true">
      <main className="mx-auto max-w-5xl">
        <header className="rounded-[2rem] border-2 border-white/20 bg-white/10 p-5 shadow-2xl sm:p-7">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-sun">Module 6 · Bond Street</div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div><h1 className="font-display text-3xl font-black sm:text-5xl">Bond Street</h1><p className="mt-2 max-w-3xl font-bold text-white/80">{BOND_STREET_SCRIPT.arrival}</p></div>
            <div className="rounded-2xl bg-white px-4 py-3 text-right text-navy"><div className="text-[10px] font-black uppercase tracking-wide text-navy/55">{savedStake > 0 ? 'Money Garden stake' : 'Practice Bond Street stake'}</div><div className="font-display text-2xl font-black">{money(stake)}</div></div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-teal transition-all" style={{ width: `${Math.min(100, ((step + 1) / 5) * 100)}%` }} /></div>
        </header>

        <section className="mt-5 rounded-[2rem] bg-[#fffdf8] p-5 text-navy shadow-2xl sm:p-7">
          {step === 0 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Beau · Bond Guide</div>
            <h2 className="mt-2 font-display text-3xl font-black">Owner or lender?</h2>
            <p className="mt-3 text-lg font-semibold leading-relaxed">{BOND_STREET_SCRIPT.beauIntro}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-teal/10 p-4"><div className="font-display text-xl font-black">STOCK = ownership</div><p className="mt-1 font-semibold">You own a small piece of a company. Its price can move a lot.</p></div><div className="rounded-2xl bg-electric/10 p-4"><div className="font-display text-xl font-black">BOND = loan</div><p className="mt-1 font-semibold">You lend money. The borrower promises interest and repayment.</p></div></div>
            <button type="button" onClick={() => setStep(1)} className="mt-6 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Meet the three borrowers →</button>
          </>}

          {step === 1 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">BN · Borrower cards</div>
            <h2 className="mt-2 font-display text-3xl font-black">Safety and interest trade off</h2>
            <p className="mt-2 font-semibold text-navy/70">{BOND_STREET_SCRIPT.allocation}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">{BOND_TYPES.map((bond) => <article key={bond.id} className="rounded-2xl border-2 border-navy/10 bg-white p-4 shadow"><div className="text-lg text-sun" aria-label={`${bond.safety} of 3 safety stars`}>{stars(bond.safety)}</div><h3 className="mt-2 font-display text-xl font-black">{bond.title}</h3><div className="text-xs font-black uppercase tracking-wide text-electric">{bond.borrower}</div><p className="mt-2 text-sm font-semibold leading-relaxed text-navy/70">{bond.summary}</p><div className="mt-3 rounded-xl bg-navy/5 p-2 text-sm font-black">Practice interest: {Math.round(bond.rate * 100)}%</div></article>)}</div>
            <button type="button" onClick={() => setStep(2)} className="mt-6 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Split my Bond Street stake →</button>
          </>}

          {step === 2 && <>
            <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-[0.18em] text-electric">BN · Allocation</div><h2 className="mt-2 font-display text-3xl font-black">Lend every dollar</h2></div><div className={`rounded-xl px-4 py-2 font-black ${remaining === 0 ? 'bg-teal/15 text-[#08785e]' : 'bg-sun/25'}`}>{money(remaining)} left to allocate</div></div>
            <p className="mt-2 font-semibold text-navy/70">{savedStake > 0 ? 'Your stake comes from money already carried forward from the Money Garden. Nothing resets between modules.' : 'Because you opened Module 6 directly, TAYU supplied a $100 practice stake so every Bond Street control can be used without completing another module first.'}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={splitEvenly} className="min-h-[46px] rounded-xl border-2 border-electric bg-electric/10 px-4 font-black text-electric">Split evenly</button>
              <button type="button" onClick={putAllInTreasury} className="min-h-[46px] rounded-xl border-2 border-navy/15 bg-white px-4 font-black text-navy">Put all in Treasury</button>
            </div>
            <div className="mt-5 space-y-4">{BOND_TYPES.map((bond) => <label key={bond.id} className="block rounded-2xl border border-navy/10 bg-white p-4"><div className="flex items-center justify-between gap-3"><div><strong>{bond.title}</strong><div className="text-xs font-bold text-navy/55">{stars(bond.safety)} · {Math.round(bond.rate * 100)}% practice interest</div></div><div className="font-display text-2xl font-black">{money(allocation[bond.id])}</div></div><input aria-label={`${bond.title} allocation`} type="range" min="0" max={stake} step="0.01" value={allocation[bond.id]} onChange={(event) => setBond(bond.id, event.target.value)} className="mt-3 w-full" /></label>)}</div>
            <button type="button" disabled={stake <= 0 || total <= 0.009} onClick={runOutcomes} className="mt-6 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white disabled:cursor-not-allowed disabled:opacity-35">{remaining > 0.009 && total > 0.009 ? `Run outcomes · put the remaining ${money(remaining)} in Treasury →` : 'Run the bond outcomes →'}</button>
          </>}

          {step === 3 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">BN · Outcome cards</div><h2 className="mt-2 font-display text-3xl font-black">Interest arrives</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">{outcome.rows.map((row) => <article key={row.id} className="rounded-2xl border-2 border-teal/25 bg-teal/5 p-4"><div className="text-lg text-sun">{stars(row.safety)}</div><h3 className="mt-2 font-display text-xl font-black">{row.title}</h3><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-white p-2"><span className="block text-xs font-bold text-navy/50">LENT</span><strong>{money(row.principal)}</strong></div><div className="rounded-xl bg-white p-2"><span className="block text-xs font-bold text-navy/50">INTEREST</span><strong>+{money(row.interest)}</strong></div></div><p className="mt-3 text-sm font-semibold text-navy/70">{row.outcome}</p></article>)}</div>
            <div className="mt-5 rounded-2xl bg-navy p-4 text-white"><div className="text-xs font-black uppercase tracking-wide text-teal">Bond Street result</div><div className="mt-1 font-display text-3xl font-black">{money(outcome.principal)} → {money(outcome.ending)}</div><p className="mt-1 font-semibold text-white/75">You earned {money(outcome.interest)} in practice interest.</p></div>
            <button type="button" onClick={() => setStep(4)} className="mt-6 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Learn the two bond twists →</button>
          </>}

          {step === 4 && <>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Beau · Final lesson</div><h2 className="mt-2 font-display text-3xl font-black">Steadier does not mean risk-free</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-electric/10 p-4"><h3 className="font-display text-xl font-black">Bondholders are ahead</h3><p className="mt-2 font-semibold leading-relaxed">{BOND_STREET_SCRIPT.seniorityLesson}</p></div><div className="rounded-2xl bg-sun/20 p-4"><h3 className="font-display text-xl font-black">Rates and prices move opposite</h3><p className="mt-2 font-semibold leading-relaxed">{BOND_STREET_SCRIPT.rateLesson}</p></div></div>
            {outcome.investedInMuni && <div className="mt-4 rounded-2xl border-2 border-teal bg-teal/10 p-4"><div className="font-display text-xl font-black">Muni choice saved ✓</div><p className="mt-1 font-semibold">You invested in a municipal bond. Rex will call that choice back in the Tax Office and explain the tax treatment there.</p></div>}
            <div className="mt-4 rounded-2xl bg-navy p-4 font-semibold text-white">{BOND_STREET_SCRIPT.handoff}</div>
            <button type="button" onClick={finish} className="mt-6 min-h-[56px] w-full rounded-2xl bg-teal px-5 font-black text-navy">To the Tax Office →</button>
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
