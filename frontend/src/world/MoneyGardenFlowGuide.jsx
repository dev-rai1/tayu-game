import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from './store.js'
import {
  moneyGardenDecision,
  moneyGardenPart,
  MONEY_GARDEN_FLOW,
  shouldPauseBetweenGardenParts,
} from '../scenarios/moneyGardenGuidance.js'

// Keeps one short decision prompt visible, opens the portfolio once per week,
// and adds a natural stopping point between the two five-week parts.
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
          <p className="mt-3 text-xs font-bold text-navy/55">Part 2 begins from this same saved point when you resume Module 5.</p>
        </section>
      </div>
    )
  }

  const guide = moneyGardenDecision(decisionWeek)
  const part = moneyGardenPart(decisionWeek)
  const partWeek = part.part === 1 ? decisionWeek : decisionWeek - 5

  return (
    <div className="pointer-events-none fixed inset-0 z-[410]">
      <section className="pointer-events-none absolute left-1/2 top-20 w-[min(92vw,34rem)] -translate-x-1/2 rounded-2xl border-2 border-electric/30 bg-white/95 p-4 text-navy shadow-2xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-electric">Money Garden · Part {part.part}: {part.title}</div>
          <div className="rounded-full bg-navy/10 px-2 py-1 text-[10px] font-extrabold">Decision {partWeek} of 5</div>
        </div>
        <h2 className="mt-1 font-display text-lg font-extrabold">{guide.title}</h2>
        <p className="mt-1 text-sm font-bold leading-snug text-navy/80">{guide.instruction}</p>
        <div className="mt-2 grid gap-1 text-xs font-bold text-navy/65 sm:grid-cols-3">
          {MONEY_GARDEN_FLOW.map((step) => <span key={step}>{step}</span>)}
        </div>
      </section>

      {panelPortfolio && (
        <button
          type="button"
          onClick={() => { closePortfolio(); startTheWeek() }}
          className="pointer-events-auto absolute bottom-5 left-1/2 min-h-[64px] w-[min(90vw,28rem)] -translate-x-1/2 rounded-2xl bg-electric px-6 text-xl font-extrabold text-white shadow-2xl transition hover:bg-teal hover:text-navy active:scale-95"
        >
          Test This Choice
        </button>
      )}
    </div>
  )
}
