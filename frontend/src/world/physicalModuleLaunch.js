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

  activatePaycheckWorld()

  // Module 6 now behaves like the other town destinations: arrive OUTSIDE,
  // directly in front of the entrance, with the building in view. There is no
  // inside-the-building spawn or special arrival sequence to fight the world init.
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
 * Queue one normal 3D-world arrival. World.jsx reads this marker immediately
 * after initWorld(), so a Module 6 click cannot be overwritten by the default
 * spawn. This replaces the old repeated timeout/re-teleport launch code.
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

  activatePaycheckWorld()
  return true
}
