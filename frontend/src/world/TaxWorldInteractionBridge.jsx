import { useEffect } from 'react'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { playerPos } from './store.js'
import { isPaycheckWorldActive } from './paycheckMode.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, taxStationForStep } from './taxDistrictLayout.js'

const INTERACT_RADIUS = 3.7
const distanceTo = (point) => Math.hypot(playerPos.x - point[0], playerPos.z - point[1])
const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))

function nearbyTaxAction() {
  if (!isPaycheckWorldActive()) return null
  const state = useTaxLab.getState()
  if (state.panel) return null

  if (state.phase === 'intro') {
    if (distanceTo(TAX_POINTS.guide) <= INTERACT_RADIUS) {
      return { kind: 'guide', label: 'Talk to Maya · start the Tax Lab' }
    }
    return null
  }

  if (state.phase === 'case') {
    let best = null
    let bestDistance = Infinity
    for (const client of TAX_CLIENTS) {
      const d = distanceTo(client.point)
      if (d <= INTERACT_RADIUS && d < bestDistance) {
        best = client
        bestDistance = d
      }
    }
    return best ? { kind: 'client', caseId: best.caseId, label: `Talk to ${best.name} · inspect this W-2` } : null
  }

  if (state.phase === 'steps') {
    const station = taxStationForStep(state.stepNumber)
    if (station && distanceTo(station.point) <= INTERACT_RADIUS) {
      return { kind: 'station', stepNumber: state.stepNumber, label: `Use ${station.label}` }
    }
    return null
  }

  if (state.phase === 'complete' && distanceTo(TAX_POINTS.guide) <= INTERACT_RADIUS) {
    return { kind: 'guide', label: 'Talk to Maya · review what you learned' }
  }

  return null
}

function runTaxAction(action) {
  if (!action || !isPaycheckWorldActive()) return false
  const lab = useTaxLab.getState()
  if (lab.panel) return false

  if (action.kind === 'guide') {
    lab.openGuide()
    return true
  }
  if (action.kind === 'client') {
    const taxCase = TAX_CASES.find((item) => item.id === action.caseId)
    if (!taxCase) return false
    lab.previewClient(taxCase)
    return true
  }
  if (action.kind === 'station') {
    return Boolean(lab.openStation(action.stepNumber))
  }
  return false
}

export function TaxWorldInteractionBridge() {
  const nearbyAction = useTaxLab((state) => state.nearbyAction)

  useEffect(() => {
    let lastKey = ''
    const refresh = () => {
      const action = nearbyTaxAction()
      const key = action ? `${action.kind}:${action.caseId || action.stepNumber || ''}:${action.label}` : ''
      if (key !== lastKey) {
        lastKey = key
        useTaxLab.getState().setNearbyAction(action)
      }
    }

    const timer = window.setInterval(refresh, 90)
    refresh()

    const interact = () => {
      const action = nearbyTaxAction()
      if (runTaxAction(action)) refresh()
    }
    const onKeyDown = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      const action = nearbyTaxAction()
      if (!action) return
      event.preventDefault()
      runTaxAction(action)
      refresh()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('tayu-interact', interact)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('tayu-interact', interact)
      useTaxLab.getState().setNearbyAction(null)
    }
  }, [])

  if (!nearbyAction) return null

  const activate = () => {
    const currentAction = nearbyTaxAction() || nearbyAction
    runTaxAction(currentAction)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[95] flex justify-center px-4 sm:bottom-8">
      <button
        type="button"
        onClick={activate}
        className="pointer-events-auto flex min-h-[58px] max-w-[min(92vw,34rem)] items-center gap-3 rounded-2xl border-2 border-white/80 bg-navy px-5 py-3 text-left text-white shadow-2xl transition active:scale-[0.98]"
        aria-label={nearbyAction.label}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-electric font-black text-white">E</span>
        <span>
          <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-teal">Tap or press E to interact</span>
          <span className="mt-0.5 block text-sm font-black leading-tight sm:text-base">{nearbyAction.label}</span>
        </span>
      </button>
    </div>
  )
}
