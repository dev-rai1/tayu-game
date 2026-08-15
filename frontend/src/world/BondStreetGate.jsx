import { useEffect, useMemo, useState } from 'react'
import { loadProfile, loadWallet, saveProfile } from '../services/walletStore.js'
import { BOND_STREET_SCRIPT, BOND_TYPES, allocationTotal, bondOutcome, gardenProfitStake } from '../scenarios/bondStreet.js'
import { BOND_INTERACT_EVENT, BOND_POINTS, BOND_WORLD_EVENT, placeAtBondStreetEntrance } from './BondStreetWorld.jsx'
import { INTERACT_RADIUS } from './config.js'
import { playerPos } from './store.js'

const money = (value) => `$${Number(value || 0).toFixed(2).replace(/\.00$/, '')}`
const cents = (value) => Math.round(Number(value || 0) * 100) / 100
const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))

function emitBondWorld(kind, progress) {
  try { window.dispatchEvent(new CustomEvent(BOND_WORLD_EVENT, { detail: { kind, progress } })) } catch { /* browser-only */ }
}

function saveBondCompletion(outcome) {
  const profile = loadProfile() || {}
  saveProfile({
    badges: [...new Set([...(profile.badges || []), 'bond'])],
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

function nearestExpected(stage) {
  const candidates = stage === 0
    ? [['guide', BOND_POINTS.guide]]
    : stage === 1 || stage === 2
      ? [['treasury', BOND_POINTS.treasury], ['muni', BOND_POINTS.muni], ['corporate', BOND_POINTS.corporate]]
      : stage === 3
        ? [['interest', BOND_POINTS.interest]]
        : stage === 4
          ? [['rate', BOND_POINTS.rate]]
          : []
  let best = null
  let distance = Infinity
  for (const [kind, point] of candidates) {
    const d = Math.hypot(point[0] - playerPos.x, point[1] - playerPos.z)
    if (d < distance) { best = kind; distance = d }
  }
  return distance <= INTERACT_RADIUS + 0.8 ? best : null
}

export function BondStreetGate({ onComplete }) {
  const wallet = loadWallet() || {}
  const savedStake = gardenProfitStake(wallet)
  const stake = savedStake > 0 ? savedStake : 90
  const [stage, setStage] = useState(0)
  const [visited, setVisited] = useState([])
  const [selectedBond, setSelectedBond] = useState(null)
  const [card, setCard] = useState(null)
  const [allocation, setAllocation] = useState({ treasury: 0, muni: 0, corporate: 0 })
  const total = allocationTotal(allocation)
  const remaining = Math.max(0, cents(stake - total))
  const outcome = useMemo(() => bondOutcome(allocation), [allocation])
  const progress = { stage, visited }

  // Module 6 is now 3D-only. There is deliberately no fullscreen arrival layer.
  // The player sees the real Bond Street building immediately and walks to Beau.
  useEffect(() => {
    placeAtBondStreetEntrance()
    emitBondWorld('arrival', progress)
  }, [])
  useEffect(() => { emitBondWorld('progress', progress) }, [stage, visited.join('|')])

  const describeBooth = (bondId) => {
    const bond = BOND_TYPES.find((item) => item.id === bondId)
    if (!bond) return
    setVisited((current) => current.includes(bondId) ? current : [...current, bondId])
    setSelectedBond(bondId)
    setCard({ title: bond.title, text: `${bond.borrower}: ${bond.summary} Practice interest: ${Math.round(bond.rate * 100)}%.` })
    emitBondWorld('borrowers', { ...progress, visited: [...new Set([...visited, bondId])] })
  }

  const interact = (kind, bondId = null) => {
    if (kind === 'guide' && stage === 0) {
      setStage(1)
      setCard({ title: 'Beau · Bond Guide', text: BOND_STREET_SCRIPT.beauIntro })
      emitBondWorld('borrowers', { stage: 1, visited })
      return
    }
    if (kind === 'booth' && (stage === 1 || stage === 2)) {
      describeBooth(bondId)
      if (stage === 1 && new Set([...visited, bondId]).size === 3) setStage(2)
      return
    }
    if (kind === 'interest' && stage === 3) {
      emitBondWorld('interest', progress)
      setStage(4)
      setCard({ title: 'Interest arrives', text: `Your ${money(outcome.principal)} of lending produced ${money(outcome.interest)} in practice interest. Walk to the blue rate-risk seesaw next.` })
      return
    }
    if (kind === 'rate' && stage === 4) {
      emitBondWorld('rate', progress)
      setStage(5)
      setCard({ title: 'Rates and bond prices', text: `${BOND_STREET_SCRIPT.rateLesson} ${BOND_STREET_SCRIPT.seniorityLesson}` })
    }
  }

  useEffect(() => {
    const onWorldInteract = (event) => interact(event?.detail?.kind, event?.detail?.bondId)
    const keyboard = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      const target = nearestExpected(stage)
      if (!target) return
      event.preventDefault(); event.stopImmediatePropagation()
      interact(target === 'guide' || target === 'interest' || target === 'rate' ? target : 'booth', target === 'treasury' || target === 'muni' || target === 'corporate' ? target : null)
    }
    window.addEventListener(BOND_INTERACT_EVENT, onWorldInteract)
    window.addEventListener('keydown', keyboard, true)
    return () => { window.removeEventListener(BOND_INTERACT_EVENT, onWorldInteract); window.removeEventListener('keydown', keyboard, true) }
  }, [stage, visited, total, remaining, outcome])

  const allocate = (bondId, amount) => {
    setAllocation((current) => {
      const otherTotal = Object.entries(current).reduce((sum, [id, value]) => id === bondId ? sum : sum + Number(value || 0), 0)
      return { ...current, [bondId]: Math.min(cents(amount), cents(stake - otherTotal)) }
    })
    emitBondWorld('allocation', progress)
  }

  const addChunk = (bondId) => {
    const chunk = Math.max(10, cents(stake / 3))
    allocate(bondId, Number(allocation[bondId] || 0) + Math.min(chunk, remaining))
  }

  const finishAllocation = () => {
    if (remaining > 0.009) setAllocation((current) => ({ ...current, treasury: cents(Number(current.treasury || 0) + remaining) }))
    setCard(null)
    setStage(3)
    emitBondWorld('allocation', { stage: 3, visited })
  }

  const finish = () => {
    saveBondCompletion(outcome)
    emitBondWorld('handoff', progress)
    onComplete?.(outcome)
  }

  const objective = stage === 0
    ? 'Walk inside and talk to Beau.'
    : stage === 1
      ? `Visit all three borrower booths (${visited.length}/3).`
      : stage === 2
        ? `Choose where to lend your ${money(stake)} stake by interacting with the booths.`
        : stage === 3
          ? 'Walk to the glowing coin table and interact to collect interest.'
          : stage === 4
            ? 'Walk to the blue rate-risk seesaw and interact.'
            : 'Talk with Beau’s lesson complete. Finish Module 6.'

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] text-navy" data-bond-street="true">
      <div className="absolute left-3 top-3 w-[min(92vw,28rem)] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:left-5 sm:top-5">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5d8b3d]">Module 6 · Bond Street</div>
        <div className="mt-1 font-display text-xl font-black">{objective}</div>
        <div className="mt-2 text-xs font-bold text-navy/60">Walk around the building. Get close, then click or press E to interact.</div>
      </div>

      {card && (
        <section className="pointer-events-auto absolute bottom-4 left-1/2 w-[min(94vw,34rem)] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white/97 p-4 shadow-2xl backdrop-blur-md sm:p-5">
          <div className="font-display text-2xl font-black">{card.title}</div>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/75">{card.text}</p>
          {stage === 2 && selectedBond && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3"><strong>{BOND_TYPES.find((item) => item.id === selectedBond)?.title}</strong><span className="font-display text-xl font-black">{money(allocation[selectedBond])}</span></div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => addChunk(selectedBond)} disabled={remaining <= 0.009} className="min-h-[44px] flex-1 rounded-xl bg-electric px-3 font-black text-white disabled:opacity-35">Lend more here</button>
                <button type="button" onClick={() => allocate(selectedBond, 0)} className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-4 font-black">Reset</button>
              </div>
              <div className="mt-2 text-xs font-bold text-navy/60">{money(remaining)} left to place.</div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => setCard(null)} className="min-h-[44px] flex-1 rounded-xl border border-slate-300 bg-white px-4 font-black">Back to the building</button>
            {stage === 2 && total > 0.009 && <button type="button" onClick={finishAllocation} className="min-h-[44px] flex-1 rounded-xl bg-[#5d8b3d] px-4 font-black text-white">Lock in lending</button>}
            {stage === 5 && <button type="button" onClick={finish} className="min-h-[44px] flex-1 rounded-xl bg-teal px-4 font-black text-navy">Finish Module 6</button>}
          </div>
        </section>
      )}

      {stage === 2 && !card && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-navy/92 px-4 py-2 text-sm font-black text-white shadow-xl">{money(total)} lent · {money(remaining)} left</div>
      )}
      {stage === 5 && !card && (
        <button type="button" onClick={finish} className="pointer-events-auto absolute bottom-5 left-1/2 min-h-[50px] -translate-x-1/2 rounded-2xl bg-teal px-6 font-black text-navy shadow-2xl">Finish Module 6</button>
      )}
    </div>
  )
}

export function hasCompletedBondStreet() {
  const profile = loadProfile() || {}
  return Boolean(profile.bondStreet?.completed || (profile.badges || []).includes('bond'))
}
