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

const MODULE_5_NO_OVERLAY_CSS = `
/* Module 5 has one rule: instructional/story text lives in the side rail and
   never covers the playable world or an open Money Garden workspace. */
.tayu-world-declutter [class*="top-[150px]"][class*="z-[160]"][class*="w-[min(92vw,26rem)]"] {
  display: none !important;
}

/* The centered Module 5A/5B banner duplicates the side-rail module label and
   can cover the money readout, so do not render it while Money Garden is active. */
.tayu-world-declutter:has([data-money-garden-flow]) [class*="top-3"][class*="z-[210]"][class*="w-[min(92vw,32rem)]"] {
  display: none !important;
}

/* MoneyGardenFlowGuide owns ordinary investing instructions. Hide only the
   duplicate generated hint; keep dialogue, lessons, feedback, and queued text. */
.tayu-world-declutter:has([data-money-garden-flow]) [data-guidance-lane="side-hint"][data-guidance-kind="guidance"] {
  display: none !important;
}

/* Module 5 never uses the centered "important" popup treatment. The same
   content stays readable/clickable in the established side rail instead. */
.tayu-world-declutter:has([data-money-garden-flow]) [data-important-message-scrim="true"] {
  display: none !important;
}

.tayu-world-declutter:has([data-money-garden-flow]) [data-guidance-lane="important-popup"] {
  left: auto !important;
  right: max(1rem, env(safe-area-inset-right, 0px)) !important;
  top: calc(7.25rem + env(safe-area-inset-top, 0px)) !important;
  bottom: auto !important;
  width: min(30vw, 22rem) !important;
  min-width: 18rem !important;
  max-height: calc(100dvh - 8.5rem - env(safe-area-inset-bottom, 0px)) !important;
  transform: none !important;
}

/* Hud story/result cards (z-320) are also routed to the same side zone instead
   of appearing as a centered overlay. */
.tayu-world-declutter:has([data-money-garden-flow]) [class*="z-[320]"] {
  inset: auto !important;
  left: auto !important;
  right: max(1rem, env(safe-area-inset-right, 0px)) !important;
  top: calc(7.25rem + env(safe-area-inset-top, 0px)) !important;
  bottom: auto !important;
  width: min(30vw, 22rem) !important;
  max-width: 22rem !important;
  max-height: calc(100dvh - 8.5rem - env(safe-area-inset-bottom, 0px)) !important;
  padding: 0 !important;
  background: transparent !important;
  backdrop-filter: none !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  overflow-y: auto !important;
}

.tayu-world-declutter:has([data-money-garden-flow]) [class*="z-[320]"] > .pop-in {
  width: 100% !important;
  max-width: 22rem !important;
  margin: 0 !important;
}

@media (max-width: 899px) {
  .tayu-world-declutter:has([data-money-garden-flow]) [data-guidance-lane="important-popup"],
  .tayu-world-declutter:has([data-money-garden-flow]) [class*="z-[320]"] {
    left: auto !important;
    right: max(0.65rem, env(safe-area-inset-right, 0px)) !important;
    top: calc(5.25rem + env(safe-area-inset-top, 0px)) !important;
    bottom: auto !important;
    width: min(90vw, 22rem) !important;
    min-width: 0 !important;
    max-width: 22rem !important;
    max-height: min(34dvh, 16rem) !important;
    transform: none !important;
  }
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
  const ownedCompanyCount = mg ? Object.values(mg.companies || {}).filter((company) => company.owned > 0).length : 0
  const firstDiversificationIncomplete = Number(decisionWeek) === 1 && ownedCompanyCount < 2

  const clueSequence = useMemo(() => {
    if (!isDecision) return []
    return [...moneyGardenClues(decisionWeek, mg), guide.instruction]
  }, [decisionWeek, guide.instruction, isDecision, mg])

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

  // Reuse the existing result card as the single post-choice teaching moment.
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
      <div className="pointer-events-none fixed inset-0 z-[620]" data-money-garden-flow>
        <style>{MODULE_5_NO_OVERLAY_CSS}</style>
        <section
          role="region"
          aria-labelledby="garden-intermission-title"
          className="pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right,0px))] top-[calc(7.25rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-8.5rem)] w-[min(30vw,22rem)] min-w-[18rem] overflow-y-auto rounded-2xl border-2 border-teal bg-white p-4 text-navy shadow-2xl max-[899px]:right-[max(0.65rem,env(safe-area-inset-right,0px))] max-[899px]:top-[calc(5.25rem+env(safe-area-inset-top,0px))] max-[899px]:max-h-[60dvh] max-[899px]:w-[min(90vw,22rem)] max-[899px]:min-w-0"
        >
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module 5A complete</div>
          <h2 id="garden-intermission-title" className="mt-2 font-display text-2xl font-extrabold">Investing Foundations complete</h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/75">You learned what stock ownership means, built a diversified portfolio, researched businesses, and separated business evidence from price alone.</p>
          <div className="mt-3 rounded-2xl border-2 border-brandpurple/30 bg-brandpurple/10 p-3 text-left">
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-brandpurple">Next: Module 5B</div>
            <div className="mt-1 font-display text-lg font-extrabold text-navy">Markets, Risk &amp; Patience</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-navy/70">Continue with the same saved portfolio while you practice time horizon, ready cash, warning signs, hype, patience, and rebalancing.</p>
          </div>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => {
                useGame.setState((state) => ({
                  mg: state.mg ? { ...state.mg, partTwoStarted: true } : state.mg,
                }))
                persist()
              }}
              className="min-h-[52px] rounded-2xl bg-brandpurple px-4 text-base font-extrabold text-white active:scale-95"
            >
              Start Module 5B →
            </button>
            <button
              type="button"
              onClick={() => {
                persist()
                navigate('/modules')
              }}
              className="min-h-[48px] rounded-2xl bg-navy/10 px-4 text-sm font-extrabold text-navy active:scale-95"
            >
              Save &amp; return to modules
            </button>
          </div>
        </section>
      </div>
    )
  }

  /* Keep the Module 5 marker and CSS active during results/dialogue/non-decision
     phases too, so nothing can fall back to a centered text overlay. */
  if (!isDecision) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[1]" data-money-garden-flow aria-hidden="true">
        <style>{MODULE_5_NO_OVERLAY_CSS}</style>
      </div>
    )
  }

  const currentIndex = Math.min(clueIndex, Math.max(0, clueSequence.length - 1))
  const currentClue = clueSequence[currentIndex]
  const isLastClue = currentIndex === clueSequence.length - 1
  const canShowClue = !panelPortfolio && cards.length === 0 && !dialog && Boolean(currentClue)

  return (
    <div className="pointer-events-none fixed inset-0 z-[410]" data-money-garden-flow>
      <style>{MODULE_5_NO_OVERLAY_CSS}</style>

      {canShowClue && (
        <section
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-money-garden-clue
          className="pointer-events-auto absolute bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))] left-3 w-[min(86vw,20rem)] rounded-2xl border-2 bg-white/95 p-3 text-navy shadow-2xl backdrop-blur-sm sm:bottom-4 sm:left-4 sm:w-[min(30vw,20rem)]"
          style={{ borderColor: `${part.color}77` }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.16em]" style={{ color: part.color }}>One clue at a time</div>
            <div className="rounded-full bg-navy/10 px-2 py-1 text-[10px] font-extrabold text-navy/65">{currentIndex + 1} of {clueSequence.length}</div>
          </div>
          <div className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em]" style={{ color: part.color }}>
            {part.moduleLabel} · {part.title} · Decision {partWeek} of 5
          </div>
          {decisionWeek === 1 && mg.starterGiftApplied && (
            <div className="mt-2 rounded-xl border border-teal/40 bg-teal/10 px-3 py-2 text-xs font-extrabold text-navy">
              Mr. Sprout's investing gift: ${MONEY_GARDEN_STARTER_GIFT} · Ready to invest: ${Math.round(mg.cash * 100) / 100}
            </div>
          )}
          <h2 className="mt-2 font-display text-lg font-extrabold leading-tight">{guide.title}</h2>
          {currentIndex === 0 && guide.why && (
            <p className="mt-1 text-xs font-bold leading-snug text-navy/65">Why it matters: {guide.why}</p>
          )}
          <div className="mt-3 rounded-2xl border border-sun/50 bg-sun/15 px-4 py-3">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-navy/55">{isLastClue ? 'Do this now' : 'Look at this clue'}</div>
            <p className="mt-1 text-base font-extrabold leading-snug text-navy">{currentClue}</p>
          </div>
          {[4, 5, 7].includes(Number(decisionWeek)) && !isLastClue && (
            <p className="mt-2 text-xs font-bold leading-snug text-navy/60">The storefront stays visible behind this card so you can inspect the evidence.</p>
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
              className="min-h-[50px] flex-1 rounded-xl px-4 text-base font-extrabold text-white shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun active:scale-95"
              style={{ background: part.color }}
            >
              {isLastClue ? 'Make My Choice →' : 'Next Clue →'}
            </button>
          </div>
        </section>
      )}

      {panelPortfolio && (
        <div className="pointer-events-auto absolute bottom-4 left-3 w-[min(88vw,20rem)] sm:bottom-4 sm:left-4 sm:w-[20rem]">
          <div className="mb-2 rounded-2xl border-2 border-sun/50 bg-navy/95 px-4 py-3 text-white shadow-2xl">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sun">{part.moduleLabel} · Do this now</div>
            <p className="mt-1 text-sm font-extrabold leading-snug">
              {firstDiversificationIncomplete
                ? `You own shares in ${ownedCompanyCount} of 2 needed companies. Use READY TO INVEST cash to buy at least 1 share in ${2 - ownedCompanyCount} more ${2 - ownedCompanyCount === 1 ? 'company' : 'companies'}.`
                : guide.instruction}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[11px] font-bold">
              <div className="rounded-xl bg-teal/20 px-2 py-1.5"><span className="block text-teal">READY TO INVEST</span>${Math.round(Number(mg?.cash || 0) * 100) / 100}<span className="block text-white/65">buys shares</span></div>
              <div className="rounded-xl bg-white/10 px-2 py-1.5"><span className="block text-white">POCKET</span>${Math.round(Number(mg?.pocket || 0) * 100) / 100}<span className="block text-white/65">for surprises</span></div>
              <div className="rounded-xl bg-electric/25 px-2 py-1.5"><span className="block text-white">BANK SPROUT</span>${Math.round(Number(mg?.bank || 0) * 100) / 100}<span className="block text-white/65">slow + steady</span></div>
            </div>
            <p className="mt-2 text-xs font-bold text-white/75">Take $1 moves Pocket/Bank money to READY TO INVEST. Tuck $1 or Put in $1 moves READY TO INVEST cash into Pocket/Bank. Sell returns money to READY TO INVEST.</p>
          </div>
          <button
            type="button"
            disabled={firstDiversificationIncomplete}
            onClick={() => { closePortfolio(); startTheWeek() }}
            className="min-h-[64px] w-full rounded-2xl px-6 text-xl font-extrabold text-white shadow-2xl transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun active:scale-95 disabled:cursor-not-allowed disabled:bg-navy/50 disabled:text-white/70"
            style={firstDiversificationIncomplete ? undefined : { background: part.color }}
          >
            {firstDiversificationIncomplete ? `Buy from ${2 - ownedCompanyCount} more ${2 - ownedCompanyCount === 1 ? 'company' : 'companies'} first` : 'Test This Choice and Continue →'}
          </button>
        </div>
      )}
    </div>
  )
}
