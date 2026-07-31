import { useEffect, useRef, useState } from 'react'
import { STOPS } from '../scenarios/budgetTown.js'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { usesTouchControls } from './controlMode.js'

export const PROTECTED_BUDGET_TAKEAWAYS = Object.freeze([
  STOPS.house.takeaway,
  STOPS.grocery.takeaway,
  STOPS.bus.takeaway,
  STOPS.clinic.takeaway,
  STOPS.fun.takeawayRide,
  STOPS.fun.takeawaySave,
])

const protectedMessages = new Set(PROTECTED_BUDGET_TAKEAWAYS)

export function isProtectedBudgetTakeaway(message) {
  return protectedMessages.has(String(message || ''))
}

export function BudgetTakeawayGuard() {
  const week = useGame((state) => state.week)
  const toast = useGame((state) => state.toast)
  const [queue, setQueue] = useState([])
  const [expanded, setExpanded] = useState(false)
  const seen = useRef(new Set())

  useEffect(() => {
    if (week !== 3 || !isProtectedBudgetTakeaway(toast) || seen.current.has(toast)) return
    seen.current.add(toast)
    setQueue((current) => [...current, toast])
  }, [toast, week])

  useEffect(() => {
    if (week === 3) return
    seen.current.clear()
    setQueue([])
    setExpanded(false)
  }, [week])

  const message = queue[0]
  useEffect(() => setExpanded(false), [message])
  if (!message) return null

  const continueGame = () => setQueue((current) => current.slice(1))
  const position = usesTouchControls
    ? 'bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]'

  return (
    <aside className={`pointer-events-auto fixed left-1/2 z-[525] w-[min(90vw,24rem)] -translate-x-1/2 rounded-2xl border-2 border-teal bg-white text-navy shadow-2xl ${position}`} aria-live="polite">
      {!expanded ? (
        <div className="flex items-center gap-2 p-2">
          <button type="button" onClick={() => setExpanded(true)} className="min-h-[44px] min-w-0 flex-1 rounded-xl bg-teal/10 px-3 text-left active:scale-[0.99]">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-electric">Budget result</span>
            <span className="block truncate text-sm font-extrabold">See what changed</span>
          </button>
          <button type="button" aria-label="Dismiss budget result" onClick={continueGame} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/10 text-lg font-extrabold active:scale-95">×</button>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-electric">Budget result</div>
              <p className="mt-1 break-words text-sm font-bold leading-snug">{message}</p>
            </div>
            <button type="button" onClick={() => setExpanded(false)} className="min-h-[40px] shrink-0 rounded-xl bg-navy/10 px-3 text-xs font-extrabold active:scale-95">Hide</button>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => say(message)} className="min-h-[42px] flex-1 rounded-xl bg-electric/10 px-3 text-xs font-extrabold text-electric active:scale-95">Read aloud</button>
            <button type="button" onClick={continueGame} className="min-h-[42px] flex-1 rounded-xl bg-teal px-3 text-xs font-extrabold text-navy active:scale-95">Continue</button>
          </div>
        </div>
      )}
    </aside>
  )
}
