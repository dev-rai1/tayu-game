import { useEffect } from 'react'
import { useGame } from './store.js'
import { useFeedbackCoach } from './feedbackCoach.js'
import { STORE_ITEMS } from './config.js'
import { checkAllocation } from '../scenarios/jarScenario.js'
import { cartFeedback } from '../scenarios/storeMission.js'
import { BUNDLES, EVENTS, QUALITY, SIGNS, nextTip } from '../scenarios/lemonade.js'
import { weekSpec } from '../scenarios/marketScenarios.js'
import { EMERGENCY_EVENT } from '../scenarios/budgetTown.js'

const money = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

function bankRetryAction(week) {
  if (week === 4) {
    return {
      title: 'Pay the credit bill the safer way',
      action: 'Choose “Pay in full” on the retry. Paying only the minimum adds interest, so the same purchase costs more.',
      goal: 'Finish the purchase with $0 added interest.',
    }
  }
  if (week === 6) {
    return {
      title: 'Stop the scam',
      action: 'Choose “Refuse.” Do not send money or private information to someone who pressures you.',
      goal: 'Keep your money and personal information protected.',
    }
  }
  return {
    title: 'Retry the safer bank choice',
    action: 'Choose “Let’s try that again,” reread Bea’s explanation, and select the choice that avoids the extra cost or risk.',
    goal: 'Complete the lesson without losing money or trust.',
  }
}

function activeKeyForState(state) {
  if (state.week === 1 && state.objective === 'kitchen' && state.scenarioState === 'ALLOCATING') return 'jars'
  if (state.week === 1 && state.objective === 'store' && state.bramTalked && !state.storeMissionDone) return 'market'
  if (state.week === 3 && state.bt && (state.bt.stage === 'split' || state.btPanel === 'split')) return 'budget'
  if (state.week === 4 && state.bk) return 'bank'
  if (state.week === 5 && state.mg && ['scenario', 'adjust', 'slider'].includes(state.mg.phase)) return 'garden'
  return null
}

export function PersistentImprovementCoach() {
  const week = useGame((state) => state.week)
  const objective = useGame((state) => state.objective)
  const scenarioState = useGame((state) => state.scenarioState)
  const bramTalked = useGame((state) => state.bramTalked)
  const storeMissionDone = useGame((state) => state.storeMissionDone)
  const bt = useGame((state) => state.bt)
  const btPanel = useGame((state) => state.btPanel)
  const bk = useGame((state) => state.bk)
  const mg = useGame((state) => state.mg)
  const weekComplete = useGame((state) => state.weekComplete)
  const feedbackByModule = useFeedbackCoach((state) => state.feedbackByModule)

  useEffect(() => {
    const setFeedback = useFeedbackCoach.getState().setFeedback
    const clearFeedback = useFeedbackCoach.getState().clearFeedback

    const unsubscribe = useGame.subscribe((state, previous) => {
      // A fresh module begins with fresh coaching. Reloaded sessions keep their
      // saved pinned feedback because this transition only runs in live play.
      if (state.week !== previous.week) {
        const entered = { 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }[state.week]
        if (entered) clearFeedback(entered)
      }
      if (state.objective === 'kitchen' && previous.objective !== 'kitchen') clearFeedback('jars')
      if (state.objective === 'store' && previous.objective !== 'store') clearFeedback('market')

      // JARS: capture the actual failed split before the animation resets it.
      if (
        previous.objective === 'kitchen'
        && previous.scenarioState === 'ALLOCATING'
        && state.scenarioState === 'ACTING_OUT'
        && previous.scenario
      ) {
        const result = checkAllocation(previous.allocations, previous.scenario)
        if (!result.ok) {
          const target = previous.scenario.target
          setFeedback('jars', {
            sourceKey: `jars-${previous.scenario.id}-${previous.attempt}`,
            title: 'Fix your jar plan',
            diagnosis: `${previous.scenario.recap(previous.allocations)} That split did not match this situation. ${result.hint}`,
            action: `On this retry, set SPEND to about ${money(target.spend)}, SAVE to about ${money(target.save)}, and GIVE to about ${money(target.give)}.`,
            goal: `Use all three jars. Each amount can be within ${money(target.tolerance)} of the suggested amount.`,
          })
        }
      }
      if (state.scenarioState === 'SUCCESS' && previous.scenarioState !== 'SUCCESS') clearFeedback('jars')

      // MARKET: retain the exact cart diagnosis after the basket is refunded.
      if (state.storeAttempt > previous.storeAttempt) {
        const basket = previous.bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
        setFeedback('market', {
          sourceKey: `market-${state.storeAttempt}`,
          title: 'Fix your basket',
          diagnosis: cartFeedback(basket),
          action: 'Buy exactly one healthy food and one healthy drink first. Only add a want after both needs are covered and you still have enough SPEND money.',
          goal: 'The Food and Drink checks should both turn green before checkout.',
        })
      }
      if (state.storeMissionDone && !previous.storeMissionDone) clearFeedback('market')

      // LEMONADE: use the same nextTip calculation as the end-of-round card.
      // That guarantees the exact recommendation shown at the end is the one
      // saved and pinned throughout the following selection screen.
      if (state.lemResult && state.lemResult !== previous.lemResult) {
        const result = state.lemResult
        const levers = {
          price: result.price,
          hours: result.hours,
          bundle: result.bundle || BUNDLES[1],
          quality: result.quality || QUALITY[0],
          sign: result.sign || SIGNS[0],
          wageRate: result.wageRate ?? 1,
        }
        const analysis = nextTip(
          result,
          levers,
          result.event || EVENTS[0],
          state.lemFeatures,
          state.lemTipHistory,
        )
        setFeedback('lemonade', {
          sourceKey: `lemonade-${result.round}`,
          title: analysis.title,
          diagnosis: analysis.diagnosis,
          action: analysis.action,
          goal: analysis.goal,
          recommended: {
            price: analysis.plan.price,
            hours: analysis.plan.hours,
            bundleId: analysis.plan.bundle.id,
            bundleLabel: analysis.plan.bundle.label,
            qualityId: analysis.plan.quality.id,
            qualityLabel: analysis.plan.quality.label,
            signId: analysis.plan.sign.id,
            signLabel: analysis.plan.sign.label,
            wageRate: analysis.plan.wageRate,
            expectedKeep: analysis.plan.sim.keep,
            expectedSold: analysis.plan.sim.sold,
            eventId: analysis.targetEvent?.id,
            eventLine: analysis.targetEvent?.line,
          },
        })
      }

      // MONEY GARDEN: the week log records whether the lesson was followed.
      const previousLogs = previous.mg?.weekLog?.length || 0
      const currentLogs = state.mg?.weekLog?.length || 0
      if (currentLogs > previousLogs) {
        const log = state.mg.weekLog.at(-1)
        const spec = weekSpec(log.week)
        if (log.judged) {
          clearFeedback('garden')
        } else {
          setFeedback('garden', {
            sourceKey: `garden-${log.week}`,
            title: `Fix Week ${log.week}'s decision`,
            diagnosis: `${spec.coach} Your garden ended the week at ${money(log.total)}.`,
            action: spec.intro,
            goal: spec.nudge || 'Follow the pinned lesson before starting the next week.',
          })
        }
      }

      // BUDGET TOWN: a failed emergency test returns the player to the split.
      if (
        previous.bt?.stage === 'emergency'
        && state.bt?.stage === 'split'
        && state.btPanel === 'split'
      ) {
        const pocket = previous.bt?.split?.pocket ?? previous.split?.pocket ?? 0
        setFeedback('budget', {
          sourceKey: `budget-emergency-${Date.now()}`,
          title: 'Put enough money in Pocket',
          diagnosis: `Your Pocket had ${money(pocket)}, but the surprise cost ${money(EMERGENCY_EVENT.cost)}. The plan could not cover the emergency.`,
          action: `Move at least ${money(EMERGENCY_EVENT.cost)} into Pocket before confirming the split. Then divide the rest between Bank and Money Garden.`,
          goal: `Pocket must be ${money(EMERGENCY_EVENT.cost)} or more so the surprise can be paid without undoing the plan.`,
        })
      }
      if (state.bt?.stage === 'handoff' && previous.bt?.stage !== 'handoff') clearFeedback('budget')

      // BANK: failed choices create a feedback card with a retry button.
      const currentCard = state.cards.at(-1)
      const previousCard = previous.cards.at(-1)
      if (currentCard && currentCard !== previousCard && currentCard.id === 'bkfb') {
        const mustRetry = currentCard.buttons?.some((button) => button.act === 'bk.retry')
        if (mustRetry) {
          const correction = bankRetryAction(state.bk?.week)
          setFeedback('bank', {
            sourceKey: `bank-${state.bk?.week}-${Date.now()}`,
            title: correction.title,
            diagnosis: currentCard.text,
            action: correction.action,
            goal: correction.goal,
          })
        } else {
          clearFeedback('bank')
        }
      }
    })

    return unsubscribe
  }, [])

  const currentState = { week, objective, scenarioState, bramTalked, storeMissionDone, bt, btPanel, bk, mg }
  const activeKey = activeKeyForState(currentState)
  const feedback = activeKey ? feedbackByModule[activeKey] : null

  // Lemonade owns a larger combination coach inside its decision panel.
  if (!feedback || weekComplete) return null

  return (
    <aside
      aria-live="polite"
      className="pointer-events-none fixed left-3 top-[92px] z-[485] max-h-[calc(100vh-7rem)] w-[min(92vw,27rem)] overflow-y-auto rounded-3xl border-2 border-sun bg-navy/95 p-4 text-white shadow-2xl"
    >
      <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sun">
        Pinned improvement guide — stays until corrected
      </div>
      <h2 className="mt-1 font-display text-lg font-extrabold text-white">{feedback.title}</h2>

      <div className="mt-3 rounded-2xl bg-white/10 p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal">What happened</div>
        <p className="mt-1 text-sm font-bold leading-snug text-white/85">{feedback.diagnosis}</p>
      </div>

      <div className="mt-2 rounded-2xl bg-sun p-3 text-navy">
        <div className="text-[10px] font-extrabold uppercase tracking-wide">Change this now</div>
        <p className="mt-1 text-sm font-extrabold leading-snug">{feedback.action}</p>
      </div>

      <div className="mt-2 rounded-2xl border border-teal/60 bg-teal/10 p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal">Goal before continuing</div>
        <p className="mt-1 text-sm font-bold leading-snug text-white/85">{feedback.goal}</p>
      </div>
    </aside>
  )
}
