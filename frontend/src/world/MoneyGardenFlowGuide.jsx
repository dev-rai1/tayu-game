import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from './store.js'
import { weekSpec } from '../scenarios/marketScenarios.js'
import {
  applyStarterInvestingGift,
  MONEY_GARDEN_STARTER_GIFT,
  moneyGardenClues,
  moneyGardenDecision,
  moneyGardenPart,
  shouldPauseBetweenGardenParts,
} from '../scenarios/moneyGardenGuidance.js'

const HIDE_OLD_PINNED_LESSON = `
.tayu-world-declutter [class*="top-[150px]"][class*="z-[160]"][class*="w-[min(92vw,26rem)]"] {
  display: none !important;
}
`

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
  const [clueIndex, setClueIndex] = useState(0)

  const decisionWeek = mg?.week ?? 1
  const partTwoStarted = Boolean(mg?.partTwoStarted)
  const isDecision = week === 5 && mg?.phase === 'adjust'
  const intermission = isDecision && shouldPauseBetweenGardenParts(decisionWeek, partTwoStarted)
  const guide = moneyGardenDecision(decisionWeek)
  const part = moneyGardenPart(decisionWeek)
  const partWeek = part.part === 1 ? decisionWeek : decisionWeek - 5

  const clueSequence = useMemo(() => {
    if (!isDecision) return []
    return [...moneyGardenClues(decisionWeek, mg), guide.instruction]
  }, [decisionWeek, guide.instruction, isDecision, mg])

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
    setClueIndex(0)
  }, [decisionWeek])

  // Use the existing result card as the one post-choice teaching moment instead
  // of creating another overlay that competes with the game world.
  useEffect(() => {
    if (week !== 5 || mg?.phase !== 'results' || !cards.length) return
    const completedWeek = Math.max(1, Number(mg?.week || 2) - 1)
    const lesson = weekSpec(completedWeek)?.lesson
    if (!lesson) return

    const needsLessonLabel = cards.some((card) => card.id === 'fb' && !card.__clearLesson)
    if (!needsLessonLabel) return

    useGame.setState((state) => ({
      cards: state.cards.map((card) => {
        if (card.id !== 'fb' || card.__clearLesson) return card
        return {
          ...card,
          __clearLesson: true,
          speaker: 'Lesson learned',
          text: `${lesson}. ${card.text}`,
        }
      }),
    }))
  }, [cards, mg?.phase, mg?.week, week])

  if (week !== 5 || !mg) return null

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

  if (!isDecision) return null

  const currentIndex = Math.min(clueIndex, Math.max(0, clueSequence.length - 1))
  const currentClue = clueSequence[currentIndex]
  const isLastClue = currentIndex === clueSequence.length - 1
  const canShowClue = !panelPortfolio && cards.length === 0 && !dialog && Boolean(currentClue)

  return (
    <div className="pointer-events-none fixed inset-0 z-[410]">
      <style>{HIDE_OLD_PINNED_LESSON}</style>
      {canShowClue && (
        <section
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-money-garden-clue
          className="pointer-events-auto absolute bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))] left-3 w-[min(90vw,23rem)] rounded-2xl border-2 border-electric/35 bg-white/95 p-4 text-navy shadow-2xl backdrop-blur-sm sm:bottom-4 sm:left-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-electric">One clue at a time</div>
            <div className="rounded-full bg-navy/10 px-2 py-1 text-[10px] font-extrabold text-navy/65">{currentIndex + 1} of {clueSequence.length}</div>
          </div>

          <div className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-teal">
            Money Garden · Part {part.part} · Decision {partWeek} of 5
          </div>
          {decisionWeek === 1 && mg.starterGiftApplied && (
            <div className="mt-2 rounded-xl border border-teal/40 bg-teal/10 px-3 py-2 text-xs font-extrabold text-navy">
              Mr. Sprout's investing gift: ${MONEY_GARDEN_STARTER_GIFT} · Ready to invest: ${Math.round(mg.cash * 100) / 100}
            </div>
          )}
          <h2 className="mt-2 font-display text-lg font-extrabold leading-tight">{guide.title}</h2>

          <div className="mt-3 rounded-2xl border border-sun/50 bg-sun/15 px-4 py-3">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-navy/55">
              {isLastClue ? 'Decision question' : 'Look at this clue'}
            </div>
            <p className="mt-1 text-base font-extrabold leading-snug text-navy">{currentClue}</p>
          </div>

          {[4, 5, 7].includes(Number(decisionWeek)) && !isLastClue && (
            <p className="mt-2 text-xs font-bold leading-snug text-navy/60">
              The storefront stays visible behind this card so you can inspect the evidence.
            </p>
          )}

          <div className="mt-3 flex gap-2">
            {currentIndex > 0 && (
              <button type="button" onClick={() => setClueIndex((index) => Math.max(0, index - 1))} className="min-h-[50px] rounded-xl bg-navy/10 px-4 text-sm font-extrabold text-navy active:scale-95">
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLastClue) openPortfolio()
                else setClueIndex((index) => Math.min(clueSequence.length - 1, index + 1))
              }}
              className="min-h-[50px] flex-1 rounded-xl bg-electric px-4 text-base font-extrabold text-white shadow-lg transition hover:bg-teal hover:text-navy focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun active:scale-95"
            >
              {isLastClue ? 'Make My Choice →' : 'Next Clue →'}
            </button>
          </div>
        </section>
      )}

      {panelPortfolio && (
        <div className="pointer-events-auto absolute bottom-5 left-1/2 w-[min(90vw,28rem)] -translate-x-1/2">
          <p className="mb-2 rounded-xl bg-navy/90 px-3 py-2 text-center text-sm font-extrabold text-white shadow-lg">
            Use the clue you just reviewed. Make one change, then test what happens.
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
