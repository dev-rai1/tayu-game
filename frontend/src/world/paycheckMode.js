export const PAYCHECK_MODE_KEY = 'tayu-paycheck-world-mode'
export const PAYCHECK_MODE_EVENT = 'tayu-paycheck-mode-changed'

export function isPaycheckWorldActive() {
  try { return sessionStorage.getItem(PAYCHECK_MODE_KEY) === '1' } catch { return false }
}

export function setPaycheckWorldActive(active) {
  try {
    if (active) sessionStorage.setItem(PAYCHECK_MODE_KEY, '1')
    else sessionStorage.removeItem(PAYCHECK_MODE_KEY)
  } catch { /* storage can be unavailable */ }
  window.dispatchEvent(new CustomEvent(PAYCHECK_MODE_EVENT, { detail: { active: Boolean(active) } }))
}

export function activatePaycheckWorld() {
  setPaycheckWorldActive(true)
}

export function deactivatePaycheckWorld() {
  let returnToModules = false
  try {
    returnToModules = sessionStorage.getItem('tayu-bond-only-entry') === '1' && sessionStorage.getItem('tayu-tax-entry-origin') === 'module-select'
    if (returnToModules) {
      sessionStorage.removeItem('tayu-bond-only-entry')
      sessionStorage.removeItem('tayu-tax-entry-origin')
    }
  } catch { /* storage can be unavailable */ }
  setPaycheckWorldActive(false)
  if (returnToModules && typeof window !== 'undefined') window.location.assign('/modules')
}
