import { activatePaycheckWorld, setPaycheckWorldActive } from './paycheckMode.js'
import { BOND_ENTRY, BOND_DISTRICT } from './BondStreetWorld.jsx'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { TAX_DISTRICT } from './config.js'
import { cameraRig } from './cameraRig.js'
import { joystick, moveTarget, playerPos, useGame } from './store.js'

export const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
export const BOND_ONLY_KEY = 'tayu-bond-only-entry'
export const PHYSICAL_MODULE_KEY = 'tayu-physical-module-launch'

export const TAX_ENTRY = [TAX_POINTS.guide[0], TAX_POINTS.guide[1] + 4.2]

export function placePhysicalModuleArrival(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false

  const point = id === 6 ? BOND_ENTRY : TAX_ENTRY
  const center = id === 6 ? BOND_DISTRICT : TAX_DISTRICT

  // Module 6 lives in the normal shared TAYU map. Only Module 7 uses the
  // separate paycheck/tax mode. This prevents Bond Street from opening a
  // different-looking scene instead of behaving like the earlier modules.
  if (id === 6) setPaycheckWorldActive(false)
  else activatePaycheckWorld()

  try {
    const dx = center[0] - point[0]
    const dz = center[1] - point[1]
    cameraRig.azimuth = Math.atan2(dx, dz)
  } catch { /* browser-only camera state */ }

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
 * Queue a deterministic arrival after the world Canvas initializes. Module 6
 * remains in the normal TAYU town and is placed at Bond Street's front door;
 * Module 7 retains the separate tax-world mode.
 */
export function preparePhysicalModuleLaunch(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false

  clearStalePhysicalModuleUi()

  try {
    localStorage.removeItem('tayu-module-entry-intent')
    localStorage.removeItem('tayu-jump-module')
    localStorage.removeItem('tayu-garden-entry-part')

    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(PHYSICAL_MODULE_KEY, String(id))
    if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')
    else sessionStorage.removeItem(BOND_ONLY_KEY)
  } catch { /* storage can be unavailable */ }

  if (id === 6) setPaycheckWorldActive(false)
  else activatePaycheckWorld()
  return true
}
