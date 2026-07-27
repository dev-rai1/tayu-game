import { useEffect, useRef } from 'react'
import { useGame } from './store.js'
import { moneyGardenDecision, MONEY_GARDEN_FLOW } from '../scenarios/moneyGardenGuidance.js'

// Keeps the Money Garden decision sequence visible and opens the portfolio once
// at the start of each week so players do not skip straight to simulation.
export function MoneyGardenFlowGuide() {
  const week = useGame((s) => s.week)
  const mg = useGame((s) => s.mg)
  const cards = useGame((s) => s.cards)
  const dialog = useGame((s) => s.dialog)
  const panelPortfolio = useGame((s) => s.panelPortfolio)
  const openPortfolio = useGame((s) => s.openPortfolio)
  const closePortfolio = useGame((s) => s.closePortfolio)
  const startTheWeek = useGame((s) => s.startTheWeek)
  const openedForWeek = useRef(null)

  const decisionWeek = mg?.week ?? 1
  const isDecision = week === 5 && mg?.phase === 'adjust'
  const canOpen = isDecision && cards.length === 0 && !dialog

  useEffect(() => {
    if (!canOpen || panelPortfolio || openedForWeek.current === decisionWeek) return
    openedForWeek.current = decisionWeek
    openPortfolio()
  }, [canOpen, decisionWeek, openPortfolio, panelPortfolio])

  if (!isDecision) return null
  const guide = moneyGardenDecision(decisionWeek)

  return (
    <div className="pointer-events-none fixed inset-0 z-[410]">
      <section className="pointer-events-none absolute left-1/2 top-20 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border-2 border-electric/30 bg-white/95 p-4 text-navy shadow-2xl backdrop-blur-sm">
        <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-electric">Money Garden · Week {decisionWeek}</div>
        <h2 className="mt-1 font-display text-lg font-extrabold">{guide.title}</h2>
        <p className="mt-1 text-sm font-bold leading-snug text-navy/80">{guide.instruction}</p>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-bold text-navy/65 sm:grid-cols-4">
          {MONEY_GARDEN_FLOW.map((step) => <span key={step}>{step}</span>)}
        </div>
      </section>

      {panelPortfolio && (
        <button
          type="button"
          onClick={() => { closePortfolio(); startTheWeek() }}
          className="pointer-events-auto absolute bottom-5 left-1/2 min-h-[64px] w-[min(90vw,28rem)] -translate-x-1/2 rounded-2xl bg-electric px-6 text-xl font-extrabold text-white shadow-2xl transition hover:bg-teal hover:text-navy active:scale-95"
        >
          Start the Week with This Portfolio
        </button>
      )}
    </div>
  )
}
