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

// Module 6 must never be impossible to start because the player spawned a few
// steps away from Maya. During the intro only, E / ACTION opens Maya's guide
// even when the proximity detector has not produced a nearbyAction yet. Once
// the intro is dismissed, all taxpayer/station interactions still require
// proximity as normal.
export function runTaxInteraction() {
  if (!isPaycheckWorldActive()) return false
  const lab = useTaxLab.getState()
  if (lab.panel) return false

  const action = nearbyTaxAction()
  if (action) return runTaxAction(action)

  if (lab.phase === 'intro') {
    lab.openGuide()
    return true
  }

  return false
}

export function TaxWorldInteractionBridge() {
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
      if (runTaxInteraction()) refresh()
    }
    const onKeyDown = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      if (!isPaycheckWorldActive()) return
      event.preventDefault()
      event.stopImmediatePropagation()
      runTaxInteraction()
      refresh()
    }

    // Capture phase plus stopImmediatePropagation guarantees Module 6 owns the
    // E key while Paycheck Planet is active instead of competing with the
    // generic world interaction listener registered by Player.jsx.
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('tayu-interact', interact)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('tayu-interact', interact)
      useTaxLab.getState().setNearbyAction(null)
    }
  }, [])

  return null
}
