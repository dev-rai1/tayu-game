import { useEffect, useState } from 'react'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { INTERACT_RADIUS } from './config.js'
import { STATION_REACH } from './PaycheckPlanetWorld.jsx'

// The player spawns ~4.2 units in front of Rex, but INTERACT_RADIUS is only 2.6,
// so "press E to start" did nothing until you walked closer. Give the guide a
// wider reach so the module starts right from the entrance.
const GUIDE_REACH = 5.0
import { playerPos, joystick, moveTarget } from './store.js'
import { cameraRig } from './cameraRig.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, TAX_POINTS, taxStationForStep } from './taxDistrictLayout.js'
import { BondStreetGate, hasCompletedBondStreet } from './BondStreetGate.jsx'
import { deactivatePaycheckWorld } from './paycheckMode.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'
const distanceTo = (point) => Math.hypot(playerPos.x - point[0], playerPos.z - point[1])
const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))

function moduleSelectEntryMode() {
  try {
    const fromModuleSelect = sessionStorage.getItem(TAX_ORIGIN_KEY) === 'module-select'
    const bondOnly = sessionStorage.getItem(BOND_ONLY_KEY) === '1'
    return { bondOnly, taxOnly: fromModuleSelect && !bondOnly }
  } catch { return { bondOnly: false, taxOnly: false } }
}

function canUseTaxOffice() {
  if (hasCompletedBondStreet()) return true
  return moduleSelectEntryMode().taxOnly
}

function placeAtTaxTownEntrance() {
  playerPos.x = TAX_POINTS.guide[0]
  playerPos.y = 1
  playerPos.z = TAX_POINTS.guide[1] + 4.2
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
  // Face the camera toward Rex / the Tax Office on arrival (see Bond Street note).
  cameraRig.azimuth = Math.atan2(-(TAX_POINTS.guide[0] - playerPos.x), -(TAX_POINTS.guide[1] - playerPos.z))
}

function nearbyTaxAction() {
  const state = useTaxLab.getState()
  if (state.panel) return null
  if (state.phase === 'intro') {
    if (distanceTo(TAX_POINTS.guide) <= GUIDE_REACH) return { kind: 'guide', label: 'Talk to Rex and start the Tax Office' }
    return null
  }
  if (state.phase === 'case') {
    let best = null
    let bestDistance = Infinity
    for (const client of TAX_CLIENTS) {
      const d = distanceTo(client.point)
      if (d <= INTERACT_RADIUS && d < bestDistance) { best = client; bestDistance = d }
    }
    return best ? { kind: 'client', caseId: best.caseId, label: `Talk to ${best.name} and inspect the W-2` } : null
  }
  if (state.phase === 'steps') {
    const station = taxStationForStep(state.stepNumber)
    if (station && distanceTo(station.point) <= STATION_REACH) return { kind: 'station', stepNumber: state.stepNumber, label: `Use ${station.label}` }
    return null
  }
  if (state.phase === 'complete' && distanceTo(TAX_POINTS.guide) <= GUIDE_REACH) return { kind: 'guide', label: 'Talk to Rex and finish the Tax Office' }
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
    lab.previewClient(taxCase)
    return true
  }
  if (action.kind === 'station') return Boolean(lab.openStation(action.stepNumber))
  return false
}

export function runTaxInteraction() {
  if (!canUseTaxOffice()) return false
  const lab = useTaxLab.getState()
  if (lab.panel) return false
  const action = nearbyTaxAction()
  return action ? runTaxAction(action) : false
}

export function TaxWorldInteractionBridge() {
  const [entryMode] = useState(() => moduleSelectEntryMode())
  const [bondComplete, setBondComplete] = useState(() => entryMode.bondOnly ? false : (entryMode.taxOnly ? true : hasCompletedBondStreet()))

  useEffect(() => {
    if (!bondComplete) return
    placeAtTaxTownEntrance()
    if (entryMode.taxOnly) useTaxLab.getState().reset()
  }, [bondComplete, entryMode.taxOnly])

  useEffect(() => {
    if (!bondComplete) return undefined
    let lastKey = ''
    const refresh = () => {
      const lab = useTaxLab.getState()
      const action = nearbyTaxAction()
      const key = action ? `${action.kind}:${action.caseId || action.stepNumber || ''}:${action.label}` : ''
      if (key !== lastKey) { lastKey = key; lab.setNearbyAction(action) }
    }
    const timer = window.setInterval(refresh, 90)
    refresh()
    const interact = () => { if (runTaxInteraction()) refresh() }
    const onKeyDown = (event) => {
      if (event.code !== 'KeyE' || isTypingTarget(event.target)) return
      if (!nearbyTaxAction()) return
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
  }, [bondComplete])

  if (!bondComplete) {
    return <BondStreetGate onComplete={() => {
      let bondOnly = false
      try {
        bondOnly = sessionStorage.getItem(BOND_ONLY_KEY) === '1'
        if (bondOnly) sessionStorage.removeItem(BOND_ONLY_KEY)
      } catch { /* storage can be unavailable */ }
      if (bondOnly) { deactivatePaycheckWorld(); return }
      setBondComplete(true)
    }} />
  }

  return null
}
