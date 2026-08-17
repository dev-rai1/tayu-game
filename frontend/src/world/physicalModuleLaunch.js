import { activatePaycheckWorld } from './paycheckMode.js'
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

  // Both Module 6 (Bond Street) and Module 7 (Tax Office) run in the shared
  // interaction world so their gate/station UI mounts. (Bond previously reused
  // the plain town map, which left its interaction bridge unmounted and made the
  // module impossible to start.)
  activatePaycheckWorld()

  try {
    // Face the follow camera TOWARD the district building on arrival. The camera
    // sits at offset (sin(az), cos(az)) from the player and looks back at them,
    // so to look along (dx,dz) the camera must sit at -(dx,dz): az = atan2(-dx,-dz).
    // (The old atan2(dx,dz) pointed the camera away from the building - the
    // "Module 7 orientation" bug where you spawned looking at the entrance side-on.)
    const dx = center[0] - point[0]
    const dz = center[1] - point[1]
    cameraRig.azimuth = Math.atan2(-dx, -dz)
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

  // Both Module 6 (Bond Street) and Module 7 (Tax Office) run in the shared
  // interaction world so their gate/station UI mounts. (Bond previously reused
  // the plain town map, which left its interaction bridge unmounted and made the
  // module impossible to start.)
  activatePaycheckWorld()
  return true
}
