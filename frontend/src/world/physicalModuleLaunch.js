import { activatePaycheckWorld } from './paycheckMode.js'
import { TAX_DISTRICT } from './config.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { joystick, moveTarget, playerPos, useGame } from './store.js'

export const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
export const BOND_ONLY_KEY = 'tayu-bond-only-entry'
export const PHYSICAL_MODULE_KEY = 'tayu-physical-module-launch'

export const BOND_ENTRY = [TAX_DISTRICT[0] - 10.4, TAX_DISTRICT[1] + 18.2]
export const TAX_ENTRY = [TAX_POINTS.guide[0], TAX_POINTS.guide[1] + 4.2]

export function placePhysicalModuleArrival(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false
  const point = id === 6 ? BOND_ENTRY : TAX_ENTRY
  playerPos.x = point[0]
  playerPos.y = 1
  playerPos.z = point[1]
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
 * launch, the old "game update" appears over Bond Street/Tax Office and tapping
 * Next can immediately send the player to the old completion certificate.
 * Physical modules always start with a clean interaction layer instead.
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
  })
}

/**
 * Modules 6 and 7 are physical 3D destinations only. They must never enter the
 * generic modal/2D module-start path. The pending physical launch survives the
 * route change so GameWorld can place the player again after the Three.js Canvas
 * has actually mounted.
 */
export function preparePhysicalModuleLaunch(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false

  // Do this before navigation so no queued Module 1-5 message/completion layer
  // can render on top of the selected 3D destination, even for one frame.
  clearStalePhysicalModuleUi()

  try {
    // Completely remove the generic 2D/module-entry path for Modules 6 and 7.
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

  // Early retries cover navigation; GameWorld performs the authoritative placement
  // again after the real 3D Canvas is created.
  if (typeof window !== 'undefined') {
    window.setTimeout(() => placePhysicalModuleArrival(id), 80)
    window.setTimeout(() => placePhysicalModuleArrival(id), 220)
  }

  return true
}
