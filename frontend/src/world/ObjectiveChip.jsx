import { useMemo } from 'react'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'

export function ObjectiveChip() {
  const state = useGame((current) => current)
  const guidance = useMemo(() => getGuidance(state, usesTouchControls), [state])
  const visibility = coachVisibility(state)

  if (!guidance || !visibility.showGuidance || state.weekComplete || state.gameComplete) return null

  const spoken = [guidance.title, guidance.instruction, guidance.action].filter(Boolean).join('. ')
  const replay = () => {
    say(spoken)
    window.dispatchEvent(new Event('tayu-refocus-objective'))
  }

  return (
    <button
      type="button"
      onClick={replay}
      aria-label={`Current objective: ${spoken}. Tap to hear it again.`}
      className="pointer-events-auto fixed left-1/2 top-3 z-[485] w-[min(88vw,27rem)] -translate-x-1/2 rounded-2xl border-2 border-teal bg-navy/95 px-4 py-2 text-left text-white shadow-xl transition hover:-translate-y-0.5 active:scale-[0.99]"
    >
      <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-teal">Current mission · tap to replay</span>
      <span className="mt-0.5 block truncate text-sm font-extrabold">{guidance.title}</span>
    </button>
  )
}
