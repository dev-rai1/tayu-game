import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from './store.js'
import { shouldPauseBetweenGardenParts } from '../scenarios/moneyGardenGuidance.js'

export function MoneyGardenFlowGuide() {
  const navigate = useNavigate()
  const week = useGame((state) => state.week)
  const mg = useGame((state) => state.mg)
  const cards = useGame((state) => state.cards)
  const dialog = useGame((state) => state.dialog)
  const panelPortfolio = useGame((state) => state.panelPortfolio)
  const openPortfolio = useGame((state) => state.openPortfolio)
  const closePortfolio = useGame((state) => state.closePortfolio)
  const startTheWeek = useGame((state) => state.startTheWeek)
  const persist = useGame((state) => state.persist)
  const openedForWeek = useRef(null)

  const decisionWeek = mg?.week ?? 1
  const partTwoStarted = Boolean(mg?.partTwoStarted)
  const isDecision = week === 5 && mg?.phase === 'adjust'
  const intermission = isDecision && shouldPauseBetweenGardenParts(decisionWeek, partTwoStarted)
  const canOpen = isDecision && !intermission && cards.length === 0 && !dialog

  useEffect(() => {
    if (!canOpen || panelPortfolio || openedForWeek.current === decisionWeek) return
    openedForWeek.current = decisionWeek
    openPortfolio()
  }, [canOpen, decisionWeek, openPortfolio, panelPortfolio])

  if (!isDecision) return null

  // This is a real module transition with choices, so it remains in the module
  // workspace. The repeated Money Garden explanation/next-step card was moved
  // into PersistentCoach instead.
  if (intermission) {
    return (
      <div className="pointer-events-auto fixed inset-0 z-[620] grid place-items-center bg-navy/75 p-4 backdrop-blur-sm">
        <section role="dialog" aria-modal="true" aria-labelledby="garden-intermission-title" className="w-full max-w-lg rounded-3xl border-2 border-teal bg-white p-6 text-center text-navy shadow-2xl">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Part 1 complete</div>
          <h2 id="garden-intermission-title" className="mt-2 font-display text-3xl font-extrabold">Investing Foundations</h2>
          <p className="mt-3 font-semibold leading-relaxed text-navy/75">You researched businesses, spread risk, and used evidence instead of price alone. Part 2 adds surprises, warning signs, hype, patience, and rebalancing.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                useGame.setState((state) => ({
                  mg: state.mg ? { ...state.mg, partTwoStarted: true } : state.mg,
                }))
                persist()
              }}
              className="min-h-[58px] rounded-2xl bg-electric px-5 text-lg font-extrabold text-white active:scale-95"
            >
              Start Part 2
            </button>
            <button
              type="button"
              onClick={() => {
                persist()
                navigate('/modules')
              }}
              className="min-h-[58px] rounded-2xl bg-navy/10 px-5 text-lg font-extrabold text-navy active:scale-95"
            >
              Save and exit
            </button>
          </div>
          <p className="mt-3 text-xs font-bold text-navy/55">Part 2 begins from this same saved point when you resume Module 6.</p>
        </section>
      </div>
    )
  }

  if (!panelPortfolio) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[410]">
      <div className="pointer-events-auto absolute bottom-5 left-1/2 w-[min(90vw,28rem)] -translate-x-1/2">
        <button
          type="button"
          onClick={() => { closePortfolio(); startTheWeek() }}
          className="min-h-[64px] w-full rounded-2xl bg-electric px-6 text-xl font-extrabold text-white shadow-2xl transition hover:bg-teal hover:text-navy focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun active:scale-95"
        >
          Test This Choice and Continue →
        </button>
      </div>
    </div>
  )
}
