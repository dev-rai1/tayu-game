import { activatePaycheckWorld } from './paycheckMode.js'
import { BOND_ENTRY } from './BondStreetWorld.jsx'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { joystick, moveTarget, playerPos, useGame } from './store.js'

export const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
export const BOND_ONLY_KEY = 'tayu-bond-only-entry'
export const PHYSICAL_MODULE_KEY = 'tayu-physical-module-launch'

export const TAX_ENTRY = [TAX_POINTS.guide[0], TAX_POINTS.guide[1] + 4.2]

export function placePhysicalModuleArrival(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false
  const point = id === 6 ? BOND_ENTRY : TAX_ENTRY

  // Keep the physical district authoritative. Old module-entry state used to
  // reset the player to an unrelated/default position after route navigation.
  activatePaycheckWorld()
  try {
    const game = useGame.getState()
    if (typeof game.adminTeleport === 'function') game.adminTeleport(point)
    else {
      playerPos.x = point[0]
      playerPos.y = 1
      playerPos.z = point[1]
    }
  } catch {
    playerPos.x = point[0]
    playerPos.y = 1
    playerPos.z = point[1]
  }
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
  return true
}

export function readPhysicalModuleLaunch() {
  try {
    const id = Number(sessionStorage.getItem(PHYSICAL_MODULE_KEY))
    return id === 6 || id === 7 ? id : null
  } catch {
    return null
  }
}

export function clearPhysicalModuleLaunch() {
  try { sessionStorage.removeItem(PHYSICAL_MODULE_KEY) } catch { /* storage can be unavailable */ }
}

/**
 * A completed earlier module can leave queued lessons/cards and the
 * pendingWeekComplete flag in Zustand. If those survive a direct Module 6/7
 * launch, the old game update appears over Bond Street/Tax Office and tapping
 * Next can immediately send the player to the old completion certificate.
 */
export function clearStalePhysicalModuleUi() {
  useGame.setState({
    dialog: null,
    lessons: [],
    cards: [],
    pendingWeekComplete: false,
    weekComplete: false,
    enterParty: false,
    near: null,
    panelJar: null,
    panelItem: null,
    btPanel: null,
    bkPanel: null,
    toast: null,
    guide: null,
    actorCaption: null,
    banner: null,
    tint: null,
    helpOpen: false,
    scenarioLocked: false,
    playerSpeedMult: 1,
    playerPose: 'idle',
  })
}

/**
 * Modules 6 and 7 are physical 3D destinations only. They must never enter the
 * generic modal/2D module-start path. The launch marker survives navigation and
 * Canvas creation so later initialization cannot strand the player on an empty
 * background.
 */
export function preparePhysicalModuleLaunch(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false

  clearStalePhysicalModuleUi()

  try {
    // Completely remove every legacy generic-module jump for these destinations.
    localStorage.removeItem('tayu-module-entry-intent')
    localStorage.removeItem('tayu-jump-module')
    localStorage.removeItem('tayu-garden-entry-part')

    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(PHYSICAL_MODULE_KEY, String(id))
    if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')
    else sessionStorage.removeItem(BOND_ONLY_KEY)
  } catch { /* storage can be unavailable */ }

  activatePaycheckWorld()
  placePhysicalModuleArrival(id)

  // Route/Canvas/player initialization can happen in several passes. Reassert
  // the physical destination through all of them rather than trusting one timer.
  if (typeof window !== 'undefined') {
    ;[60, 140, 300, 650, 1200, 1800].forEach((delay) => {
      window.setTimeout(() => placePhysicalModuleArrival(id), delay)
    })
  }

  return true
}
