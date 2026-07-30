import { useMemo } from 'react'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'

export function shouldHideObjectiveChip(state) {
  if (!state.near) return true
  if (state.week === 5 && ['adjust', 'slider'].includes(state.mg?.phase)) return true
  return false
}

export function ObjectiveChip() {
  const state = useGame((current) => current)
  const guidance = useMemo(() => getGuidance(state, usesTouchControls), [state])
  const visibility = coachVisibility(state)

  if (!guidance || !visibility.showGuidance || state.weekComplete || state.gameComplete || shouldHideObjectiveChip(state)) return null

  const spoken = [guidance.title, guidance.action].filter(Boolean).join('. ')
  const replay = () => say(spoken)

  return (
    <button
      type="button"
      onClick={replay}
      aria-label={`Next action: ${spoken}. Tap to hear it.`}
      className="pointer-events-auto fixed bottom-24 left-1/2 z-[485] w-[min(82vw,22rem)] -translate-x-1/2 rounded-2xl border-2 border-teal bg-navy/95 px-4 py-2 text-center text-white shadow-xl transition active:scale-[0.99]"
    >
      <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Next action</span>
      <span className="mt-0.5 block text-sm font-extrabold">{guidance.action || guidance.title}</span>
    </button>
  )
}
