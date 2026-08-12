export const BOND_MODE_EVENT = 'tayu-bond-mode-changed'
let active = false

function emit() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(BOND_MODE_EVENT, { detail: { active } }))
  }
}

export function activateBondStreet() {
  active = true
  emit()
}

export function deactivateBondStreet() {
  active = false
  emit()
}

export function isBondStreetActive() {
  return active
}
