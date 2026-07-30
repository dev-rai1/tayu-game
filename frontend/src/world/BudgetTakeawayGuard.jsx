import { useEffect, useRef, useState } from 'react'
import { STOPS } from '../scenarios/budgetTown.js'
import { say } from '../services/speech.js'
import { useGame } from './store.js'

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
  }, [week])

  const message = queue[0]
  if (!message) return null

  const continueGame = () => setQueue((current) => current.slice(1))

  return (
    <div className="pointer-events-auto fixed inset-0 z-[525] flex items-end justify-center bg-navy/25 p-4 sm:items-center" role="presentation">
      <section className="pop-in w-full max-w-md rounded-3xl border-4 border-teal bg-white p-6 text-center text-navy shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="budget-takeaway-title" aria-describedby="budget-takeaway-message">
        <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Budget result</div>
        <h2 id="budget-takeaway-title" className="mt-1 font-display text-2xl font-extrabold">What changed?</h2>
        <p id="budget-takeaway-message" className="mt-3 text-lg font-bold leading-relaxed">{message}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={() => say(message)} className="min-h-[52px] flex-1 rounded-2xl bg-navy/10 px-4 font-extrabold text-navy active:scale-95">Read aloud</button>
          <button type="button" onClick={continueGame} className="btn-primary min-h-[52px] flex-1">Continue</button>
        </div>
      </section>
    </div>
  )
}
