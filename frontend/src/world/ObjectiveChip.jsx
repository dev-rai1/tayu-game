import { useMemo } from 'react'
import { say } from '../services/speech.js'
import { moveTarget, playerPos, useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { getObjectiveTarget } from './objective.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'

export function shouldHideObjectiveChip(state) {
  if (state.week === 5 && ['adjust', 'slider'].includes(state.mg?.phase)) return true
  return false
}

export function ObjectiveChip() {
  const state = useGame((current) => current)
  const guidance = useMemo(() => getGuidance(state, usesTouchControls), [state])
  const visibility = coachVisibility(state)
  const target = getObjectiveTarget(state)

  if (!guidance || !visibility.showGuidance || state.weekComplete || state.gameComplete || shouldHideObjectiveChip(state)) return null

  const spoken = [guidance.title, guidance.action].filter(Boolean).join('. ')
  const replay = () => say(spoken)
  const guideMe = () => {
    if (!target) return
    moveTarget.x = target[0]
    moveTarget.z = target[1]
  }

  return (
    <section className="pointer-events-auto fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-3 z-[485] hidden w-[min(24rem,calc(100vw-31rem))] rounded-2xl border-2 border-teal bg-navy/95 px-4 py-3 text-left text-white shadow-xl lg:block" aria-label="Current objective">
      <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Nearby action</span>
      <span className="mt-1 block break-words text-sm font-extrabold leading-snug">{guidance.action || guidance.title}</span>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={replay} aria-label={`Hear next action: ${spoken}`} className="min-h-[44px] rounded-xl bg-white/10 px-3 text-xs font-extrabold text-white">Read aloud</button>
        {target && Math.hypot(target[0] - playerPos.x, target[1] - playerPos.z) > 3 && <button type="button" onClick={guideMe} className="min-h-[44px] rounded-xl bg-teal px-3 text-xs font-extrabold text-navy">Take me there</button>}
      </div>
    </section>
  )
}
