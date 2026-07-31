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
      aria-label={`Next action: ${spoken}. Select to hear it.`}
      className="pointer-events-auto fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-[485] hidden w-[min(22rem,calc(100vw-31rem))] rounded-2xl border-2 border-teal bg-navy/95 px-4 py-3 text-left text-white shadow-xl transition active:scale-[0.99] lg:block"
    >
      <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Nearby action</span>
      <span className="mt-1 block break-words text-sm font-extrabold leading-snug">{guidance.action || guidance.title}</span>
      <span className="mt-1 block text-[11px] font-bold text-white/65">Select to hear this instruction</span>
    </button>
  )
}
