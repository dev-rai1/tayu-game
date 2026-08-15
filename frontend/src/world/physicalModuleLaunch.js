import { activatePaycheckWorld } from './paycheckMode.js'
import { TAX_DISTRICT } from './config.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { joystick, moveTarget, playerPos } from './store.js'

export const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
export const BOND_ONLY_KEY = 'tayu-bond-only-entry'

const BOND_ENTRY = [TAX_DISTRICT[0] - 10.4, TAX_DISTRICT[1] + 18.2]

function placePhysicalModuleArrival(id) {
  const point = id === 6 ? BOND_ENTRY : TAX_POINTS.guide
  playerPos.x = point[0]
  playerPos.y = 1
  playerPos.z = point[1]
  joystick.x = 0
  joystick.y = 0
  moveTarget.x = null
  moveTarget.z = null
}

/**
 * Modules 6 and 7 are physical 3D destinations, not modal-first modules.
 * Selecting either one should enter the world immediately at its building.
 * The learning program itself starts only after the player walks up and presses E.
 *
 * Keep the arrival placement here instead of relying on an entry modal. The old
 * physical-launch path removed that modal intent, which meant World.jsx no longer
 * ran its generic module teleport. Depending on the previous scene/player state,
 * the Canvas could therefore open away from the destination and look blank.
 */
export function preparePhysicalModuleLaunch(moduleNumber) {
  const id = Number(moduleNumber)
  if (id !== 6 && id !== 7) return false

  try {
    localStorage.removeItem('tayu-module-entry-intent')
    localStorage.removeItem('tayu-jump-module')
    localStorage.removeItem('tayu-garden-entry-part')

    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')
    else sessionStorage.removeItem(BOND_ONLY_KEY)
  } catch { /* storage can be unavailable */ }

  // Place immediately, then repeat after route/world initialization. The retry is
  // intentional: initWorld can run just after navigation and previously left the
  // player at a stale scene position, producing the recurring blank-looking frame.
  placePhysicalModuleArrival(id)
  if (typeof window !== 'undefined') {
    window.setTimeout(() => placePhysicalModuleArrival(id), 80)
    window.setTimeout(() => placePhysicalModuleArrival(id), 180)
  }

  activatePaycheckWorld()
  return true
}
