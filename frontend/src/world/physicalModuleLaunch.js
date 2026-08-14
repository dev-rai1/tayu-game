import { activatePaycheckWorld } from './paycheckMode.js'

export const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
export const BOND_ONLY_KEY = 'tayu-bond-only-entry'

/**
 * Modules 6 and 7 are physical 3D destinations, not modal-first modules.
 * Selecting either one should enter the world immediately at its building.
 * The learning program itself starts only after the player walks up and presses E.
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

  activatePaycheckWorld()
  return true
}
