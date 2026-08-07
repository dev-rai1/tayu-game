import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from './store.js'
import {
  applyStarterInvestingGift,
  MONEY_GARDEN_STARTER_GIFT,
  moneyGardenDecision,
  moneyGardenPart,
  MONEY_GARDEN_FLOW,
  shouldPauseBetweenGardenParts,
} from '../scenarios/moneyGardenGuidance.js'

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

  // Give every player enough room to experiment with investing. This runs for
  // new games and older saved gardens, but the persisted flag prevents a
  // second gift on reload or React StrictMode re-renders.
  useEffect(() => {
    if (week !== 5 || !mg || mg.starterGiftApplied) return
    useGame.setState((state) => {
      if (!state.mg || state.mg.starterGiftApplied) return {}
      return { mg: applyStarterInvestingGift(state.mg) }
    })
    persist()
  }, [week, mg?.starterGiftApplied, persist])

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
      <section
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none absolute left-1/2 top-20 max-h-[42vh] w-[min(92vw,34rem)] -translate-x-1/2 overflow-y-auto rounded-2xl border-2 border-electric/30 bg-white/95 p-4 text-navy shadow-2xl backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-electric">Money Garden · Part {part.part}: {part.title}</div>
          <div className="rounded-full bg-navy/10 px-2 py-1 text-[10px] font-extrabold">Decision {partWeek} of 5</div>
        </div>
        {decisionWeek === 1 && mg.starterGiftApplied && (
          <div className="mt-2 rounded-xl border border-teal/40 bg-teal/10 px-3 py-2 text-sm font-extrabold text-navy">
            Mr. Sprout's investing gift: ${MONEY_GARDEN_STARTER_GIFT} · Ready to invest: ${Math.round(mg.cash * 100) / 100}
          </div>
        )}
        <h2 className="mt-1 font-display text-lg font-extrabold">{guide.title}</h2>
        <div className="mt-2 rounded-xl border border-sun/40 bg-sun/15 px-3 py-2">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-navy/55">Do this now</div>
          <p className="mt-0.5 text-sm font-extrabold leading-snug text-navy">{guide.instruction}</p>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1 text-xs font-bold text-navy/65" aria-label={`Money Garden flow: ${MONEY_GARDEN_FLOW.join(', then ')}`}>
          {MONEY_GARDEN_FLOW.map((step, index) => (
            <span key={step} className="inline-flex items-center gap-1">
              <span className="rounded-full bg-navy/8 px-2 py-1">{step}</span>
              {index < MONEY_GARDEN_FLOW.length - 1 && <span aria-hidden="true" className="text-electric">→</span>}
            </span>
          ))}
        </div>
      </section>

      {panelPortfolio && (
        <div className="pointer-events-auto absolute bottom-5 left-1/2 w-[min(90vw,28rem)] -translate-x-1/2">
          <p className="mb-2 rounded-xl bg-navy/90 px-3 py-2 text-center text-sm font-extrabold text-white shadow-lg">
            Choose or adjust an investment above, then continue.
          </p>
          <button
            type="button"
            onClick={() => { closePortfolio(); startTheWeek() }}
            className="min-h-[64px] w-full rounded-2xl bg-electric px-6 text-xl font-extrabold text-white shadow-2xl transition hover:bg-teal hover:text-navy focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun active:scale-95"
          >
            Test This Choice and Continue →
          </button>
        </div>
      )}
    </div>
  )
}
