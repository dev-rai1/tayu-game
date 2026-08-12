import { useEffect, useState } from 'react'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { INTERACT_RADIUS } from './config.js'
import { playerPos, joystick, moveTarget } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, taxStationForStep } from './taxDistrictLayout.js'
import { BondStreetGate, hasCompletedBondStreet } from './BondStreetGate.jsx'
import { deactivatePaycheckWorld } from './paycheckMode.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'
const distanceTo = (point) => Math.hypot(playerPos.x - point[0], playerPos.z - point[1])
const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))

function placeAtTaxTownEntrance() {
  try {
    if (sessionStorage.getItem(TAX_ORIGIN_KEY) !== 'module-select') return
    playerPos.x = TAX_POINTS.guide[0]
    playerPos.z = TAX_POINTS.guide[1] + 3.2
    joystick.x = 0
    joystick.y = 0
    moveTarget.x = null
    moveTarget.z = null
  } catch { /* storage can be unavailable */ }
}

function nearbyTaxAction() {
  const state = useTaxLab.getState()
  if (state.panel) return null
  if (state.phase === 'intro') {
    if (distanceTo(TAX_POINTS.guide) <= INTERACT_RADIUS) return { kind: 'guide', label: 'Start the Tax Office filing stations' }
    return null
  }
  if (state.phase === 'case') {
    let best = null
    let bestDistance = Infinity
    for (const client of TAX_CLIENTS) {
      const d = distanceTo(client.point)
      if (d <= INTERACT_RADIUS && d < bestDistance) { best = client; bestDistance = d }
    }
    return best ? { kind: 'client', caseId: best.caseId, label: `Inspect ${best.name}'s W-2` } : null
  }
  if (state.phase === 'steps') {
    const station = taxStationForStep(state.stepNumber)
    if (station && distanceTo(station.point) <= INTERACT_RADIUS) return { kind: 'station', stepNumber: state.stepNumber, label: `Use ${station.label}` }
    return null
  }
  if (state.phase === 'complete' && distanceTo(TAX_POINTS.guide) <= INTERACT_RADIUS) return { kind: 'guide', label: 'Review the completed Tax Office return' }
  return null
}

function runTaxAction(action) {
  if (!action) return false
  const lab = useTaxLab.getState()
  if (lab.panel) return false
  if (action.kind === 'guide') { lab.openGuide(); return true }
  if (action.kind === 'client') {
    const taxCase = TAX_CASES.find((item) => item.id === action.caseId)
    if (!taxCase) return false
    lab.previewClient(taxCase); return true
  }
  if (action.kind === 'station') return Boolean(lab.openStation(action.stepNumber))
  return false
}

export function runTaxInteraction() {
  if (!hasCompletedBondStreet()) return false
  const lab = useTaxLab.getState()
  if (lab.panel) return false
  const action = nearbyTaxAction()
  if (action) return runTaxAction(action)
  if (lab.phase === 'intro') { lab.openGuide(); return true }
  return false
}

function RexTaxIntro({ onDone }) {
  const profile = loadProfile() || {}
  const hasMuni = Boolean(profile.muniBondInvested || profile.bondStreet?.investedInMuni)
  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-navy/85 p-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-[2rem] border-4 border-sun bg-[#fffdf8] p-5 text-navy shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="rex-tax-intro-title">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-electric">Module 7 · Tax Office · Rex the Assessor</div>
        <h2 id="rex-tax-intro-title" className="mt-2 font-display text-3xl font-black">Taxes fund things you already used</h2>
        <p className="mt-3 font-semibold leading-relaxed">“Welcome! I’m Rex. Taxes can sound scary, but look around TAYU. The school bus, the clinic, and the ring road all depend on shared public money. A small share of income helps pay for those services.”</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-electric/10 p-4"><div className="text-xs font-black uppercase tracking-wide text-electric">What you will do</div><p className="mt-1 font-semibold">Start with gross income, subtract deductions, use marginal tax brackets, compare withholding, and find a refund or amount due.</p></div>
          <div className="rounded-2xl bg-teal/10 p-4"><div className="text-xs font-black uppercase tracking-wide text-[#08785e]">Rex’s reminder</div><p className="mt-1 font-semibold">A refund means more was prepaid than the final tax bill. Owing means the prepayments were smaller than the final bill.</p></div>
        </div>
        {hasMuni && <div className="mt-4 rounded-2xl border-2 border-teal bg-teal/10 p-4 font-semibold">Rex notices the muni bond from Bond Street, but he will explain its special tax treatment only after you finish the return.</div>}
        <div className="mt-4 rounded-2xl bg-navy p-4 text-sm font-semibold text-white"><strong>Rex’s desk notes:</strong> Taxes help support roads, schools, and public services. April is tax-filing season. And if you chose a muni bond, Rex has one more connection waiting for you.</div>
        <button type="button" onClick={onDone} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">Start the Tax Office →</button>
      </section>
    </div>
  )
}

function RexPaidReview({ onDone }) {
  const profile = loadProfile() || {}
  const hasMuni = Boolean(profile.muniBondInvested || profile.bondStreet?.investedInMuni)
  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center overflow-y-auto bg-navy/85 p-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl rounded-[2rem] border-4 border-sun bg-[#fffdf8] p-5 text-navy shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="rex-paid-title">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-electric">Module 7 · Rex · Tax Office</div>
        <h2 id="rex-paid-title" className="mt-2 font-display text-3xl font-black">Review, stamp, and connect the dots</h2>
        <p className="mt-3 font-semibold leading-relaxed">You worked from gross income to taxable income, used marginal brackets, accounted for withholding, and found the refund or amount due. Taxes help pay for the school bus, clinic, roads, and other shared services you already used around TAYU.</p>
        {hasMuni && <div className="mt-4 rounded-2xl border-2 border-teal bg-teal/10 p-4"><div className="font-display text-xl font-black">TAX-FREE MUNI CALLBACK ✓</div><p className="mt-1 font-semibold">Remember the municipal bond you chose on Bond Street? Municipal-bond interest can receive special tax treatment. That is one reason munis may pay less stated interest than riskier corporate bonds while still being attractive to investors.</p></div>}
        <div className="mt-5 rotate-[-2deg] rounded-2xl border-8 border-[#c9302c] bg-white p-5 text-center text-[#c9302c] shadow-inner"><div className="text-sm font-black uppercase tracking-[0.28em]">THUNK</div><div className="font-display text-5xl font-black sm:text-6xl">PAID</div><div className="mt-1 font-black">Practice tax return completed</div></div>
        <p className="mt-4 rounded-2xl bg-navy p-4 font-semibold text-white">“The money you sent? It helped build the road you walked, pay for the school bus, and stock the clinic. Every dollar had a job.”</p>
        <button type="button" onClick={onDone} className="mt-5 min-h-[54px] w-full rounded-2xl bg-electric px-5 font-black text-white">To the Finale →</button>
      </section>
    </div>
  )
}

export function TaxWorldInteractionBridge() {
  const [bondComplete, setBondComplete] = useState(() => hasCompletedBondStreet())
  const phase = useTaxLab((state) => state.phase)
  const [rexIntroSeen, setRexIntroSeen] = useState(() => Boolean(loadProfile()?.rexTaxIntroSeen))
  const [rexReviewSeen, setRexReviewSeen] = useState(() => Boolean(loadProfile()?.rexTaxReviewSeen))

  useEffect(() => {
    if (!bondComplete || !rexIntroSeen) return undefined
    placeAtTaxTownEntrance()
    let lastKey = ''
    let lastAutoKey = ''
    const refresh = () => {
      const lab = useTaxLab.getState(); const action = nearbyTaxAction(); const key = action ? `${action.kind}:${action.caseId || action.stepNumber || ''}:${action.label}` : ''
      if (key !== lastKey) { lastKey = key; lab.setNearbyAction(action) }
      if (action && (lab.phase === 'case' || lab.phase === 'steps') && key !== lastAutoKey) {
        lastAutoKey = key
        if (runTaxAction(action)) { lastKey = ''; lab.setNearbyAction(null) }
      }
      if (!action) lastAutoKey = ''
    }
    const timer = window.setInterval(refresh, 90); refresh()
    const interact = () => { if (runTaxInteraction()) refresh() }
    const onKeyDown = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      event.preventDefault(); event.stopImmediatePropagation(); runTaxInteraction(); refresh()
    }
    window.addEventListener('keydown', onKeyDown, true); window.addEventListener('tayu-interact', interact)
    return () => { window.clearInterval(timer); window.removeEventListener('keydown', onKeyDown, true); window.removeEventListener('tayu-interact', interact); useTaxLab.getState().setNearbyAction(null) }
  }, [bondComplete, rexIntroSeen])

  if (!bondComplete) {
    return <BondStreetGate onComplete={() => {
      let bondOnly = false
      try { bondOnly = sessionStorage.getItem(BOND_ONLY_KEY) === '1'; if (bondOnly) sessionStorage.removeItem(BOND_ONLY_KEY) } catch { /* storage can be unavailable */ }
      if (bondOnly) { deactivatePaycheckWorld(); return }
      setBondComplete(true)
    }} />
  }

  if (!rexIntroSeen) return <RexTaxIntro onDone={() => { saveProfile({ rexTaxIntroSeen: true }); setRexIntroSeen(true) }} />
  if (phase === 'complete' && !rexReviewSeen) return <RexPaidReview onDone={() => { saveProfile({ rexTaxReviewSeen: true }); setRexReviewSeen(true) }} />
  return null
}
