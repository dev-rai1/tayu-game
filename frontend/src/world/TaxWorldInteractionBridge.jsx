import { useEffect } from 'react'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { INTERACT_RADIUS } from './config.js'
import { playerPos, joystick, moveTarget } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, taxStationForStep } from './taxDistrictLayout.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
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
    if (distanceTo(TAX_POINTS.guide) <= INTERACT_RADIUS) {
      return { kind: 'guide', label: 'Talk to Maya · start Module 6 Tax Town' }
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
    return best ? { kind: 'client', caseId: best.caseId, label: `Inspect ${best.name}'s W-2` } : null
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
  if (!action) return false
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

export function runTaxInteraction() {
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
    placeAtTaxTownEntrance()

    let lastKey = ''
    let lastAutoKey = ''
    const refresh = () => {
      const lab = useTaxLab.getState()
      const action = nearbyTaxAction()
      const key = action ? `${action.kind}:${action.caseId || action.stepNumber || ''}:${action.label}` : ''
      if (key !== lastKey) {
        lastKey = key
        lab.setNearbyAction(action)
      }

      // Module 6 should feel like one guided process, not a sequence of tiny E
      // prompts. After the initial Maya interaction, walking up to the active
      // client or station opens that step automatically. E remains available as
      // a backup and for the clear start/review interactions with Maya.
      if (action && (lab.phase === 'case' || lab.phase === 'steps') && key !== lastAutoKey) {
        lastAutoKey = key
        if (runTaxAction(action)) {
          lastKey = ''
          lab.setNearbyAction(null)
        }
      }
      if (!action) lastAutoKey = ''
    }

    const timer = window.setInterval(refresh, 90)
    refresh()

    const interact = () => {
      if (runTaxInteraction()) refresh()
    }
    const onKeyDown = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      event.preventDefault()
      event.stopImmediatePropagation()
      runTaxInteraction()
      refresh()
    }

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
