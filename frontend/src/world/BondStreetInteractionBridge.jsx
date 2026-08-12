import { useEffect } from 'react'
import { INTERACT_RADIUS } from './config.js'
import { playerPos, joystick, moveTarget } from './store.js'
import { BOND_GUIDE_POINT } from './BondStreetWorld.jsx'
import { useBondStreet } from './bondStreetStore.js'

const ORIGIN_KEY = 'tayu-bond-entry-origin'
const distanceToGuide = () => Math.hypot(playerPos.x - BOND_GUIDE_POINT[0], playerPos.z - BOND_GUIDE_POINT[1])
const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))
function placeAtEntrance() {
  try {
    if (sessionStorage.getItem(ORIGIN_KEY) !== 'module-select') return
    playerPos.x = BOND_GUIDE_POINT[0]; playerPos.z = BOND_GUIDE_POINT[1] + 3.2
    joystick.x = 0; joystick.y = 0; moveTarget.x = null; moveTarget.z = null
  } catch { /* optional storage */ }
}
export function BondStreetInteractionBridge() {
  useEffect(() => {
    placeAtEntrance()
    const refresh = () => useBondStreet.getState().setNearby(distanceToGuide() <= INTERACT_RADIUS)
    const interact = () => { const store = useBondStreet.getState(); if (!store.panelOpen && (distanceToGuide() <= INTERACT_RADIUS || store.phase === 'intro')) store.open() }
    const onKeyDown = (event) => { if (event.code !== 'KeyE' || isTypingTarget(event.target)) return; if (distanceToGuide() > INTERACT_RADIUS && useBondStreet.getState().phase !== 'intro') return; event.preventDefault(); event.stopImmediatePropagation(); interact() }
    const timer = window.setInterval(refresh, 100); refresh(); window.addEventListener('keydown', onKeyDown, true); window.addEventListener('tayu-interact', interact)
    return () => { window.clearInterval(timer); window.removeEventListener('keydown', onKeyDown, true); window.removeEventListener('tayu-interact', interact); useBondStreet.getState().setNearby(false) }
  }, [])
  return null
}
export function BondActionPrompt() {
  const nearby = useBondStreet((s) => s.nearby), panelOpen = useBondStreet((s) => s.panelOpen)
  if (!nearby || panelOpen) return null
  return <div className="pointer-events-none fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[640] -translate-x-1/2 rounded-2xl border-2 border-white/40 bg-navy/95 px-4 py-2 text-center text-sm font-extrabold text-white shadow-2xl">Press E / tap interact to talk to Beau at Bond Street</div>
}
