import { useEffect } from 'react'
import { useGame } from './store.js'
import { feedbackModuleForState, useFeedbackCoach } from './feedbackCoach.js'
import { lemonadePrimaryCorrection } from './lemonadeCorrection.js'
import { STORE_ITEMS } from './config.js'
import { checkAllocation } from '../scenarios/jarScenario.js'
import { cartFeedback } from '../scenarios/storeMission.js'
import { BUNDLES, EVENTS, QUALITY, SIGNS, nextTip } from '../scenarios/lemonade.js'
import { weekSpec } from '../scenarios/marketScenarios.js'
import { EMERGENCY_EVENT, EMERGENCY_REPLAY } from '../scenarios/budgetTown.js'
import { BK } from '../scenarios/bankModule.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'

const money = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
const track = (moduleName, type, outcome, detail) => {
  recordLearningEvent({ moduleName, type, outcome, detail }).catch(() => {})
}

function bankRetryAction(week) {
  if (week === 4) {
    return {
      title: 'Compare the credit choices',
      action: 'Look at which option creates an extra charge later. Choose the one that clears the balance without adding a new cost.',
      goal: 'Explain why one payment choice costs less over time.',
    }
  }
  if (week === 6) {
    return {
      title: 'Check the warning signs',
      action: 'Notice the pressure, the unexpected prize, and the request for money or private information. Choose the response that protects both.',
      goal: 'Use the warning signs to protect your money and information.',
    }
  }
  return {
    title: 'Compare the bank outcomes',
    action: 'Retry after identifying which option adds cost or risk and which one protects the plan.',
    goal: 'Complete the lesson using the consequence as evidence.',
  }
}

function removeDuplicateLesson(text) {
  if (!text) return
  queueMicrotask(() => {
    const game = useGame.getState()
    const next = (game.lessons || []).filter((lesson) => lesson.text !== text)
    if (next.length !== (game.lessons || []).length) useGame.setState({ lessons: next })
  })
}

function clearCompetingTransientFeedback(state) {
  const moduleKey = feedbackModuleForState(state)
  if (!moduleKey || !useFeedbackCoach.getState().feedbackByModule[moduleKey]) return

  const patch = {}
  if (state.actorCaption) patch.actorCaption = null
  if (state.guide) patch.guide = null
  if (state.toast) patch.toast = null
  if (state.banner) patch.banner = null

  if (Object.keys(patch).length) useGame.setState(patch)
}

function setEarlyBankRetryFeedback(week, diagnosis) {
  const correction = bankRetryAction(week)
  useFeedbackCoach.getState().setFeedback('bank', {
    sourceKey: `bank-${week}-${Date.now()}`,
    title: correction.title,
    diagnosis,
    action: correction.action,
    goal: correction.goal,
  })
}

// This component observes game outcomes and stores one concise retry clue. It does
// not render a second card; PersistentCoach displays the clue in the shared tray.
export function PersistentImprovementCoach() {
  useEffect(() => {
    const setFeedback = useFeedbackCoach.getState().setFeedback
    const clearFeedback = useFeedbackCoach.getState().clearFeedback

    const unsubscribe = useGame.subscribe((state, previous) => {
      if (state.week !== previous.week) {
        const entered = { 2: 'lemonade', 3: 'budget', 4: 'bank', 5: 'garden' }[state.week]
        if (entered) clearFeedback(entered)
      }
      if (state.objective === 'kitchen' && previous.objective !== 'kitchen') clearFeedback('jars')
      if (state.objective === 'store' && previous.objective !== 'store') clearFeedback('market')

      if (
        previous.objective === 'kitchen'
        && previous.scenarioState === 'ALLOCATING'
        && state.scenarioState === 'ACTING_OUT'
        && previous.scenario
      ) {
        const result = checkAllocation(previous.allocations, previous.scenario)
        track('jars', 'choice_attempt', result.ok ? 'effective' : 'incorrect', previous.scenario.id)
        if (!result.ok) {
          setFeedback('jars', {
            sourceKey: `jars-${previous.scenario.id}-${previous.attempt}`,
            title: 'Adjust the jars',
            diagnosis: previous.scenario.recap(previous.allocations),
            action: result.hint || 'Compare what each jar is for, then change the jar that does not match the story’s biggest priority.',
            goal: 'Use all three jars and make the largest jar match the story’s priority.',
          })
          track('jars', 'retry_prompt', 'directional', result.scene)
        }
      }
      if (state.scenarioState === 'SUCCESS' && previous.scenarioState !== 'SUCCESS') clearFeedback('jars')

      if (state.storeAttempt > previous.storeAttempt) {
        const basket = previous.bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
        const diagnosis = cartFeedback(basket)
        setFeedback('market', {
          sourceKey: `market-${state.storeAttempt}`,
          title: 'Recheck your basket',
          diagnosis,
          action: 'Use the red and green basket checks as clues. Change the category that is still missing, then decide whether an optional item still fits.',
          goal: 'Build a complete basket without spending beyond the limit.',
        })
        removeDuplicateLesson(diagnosis)
        track('market', 'choice_attempt', 'incorrect', `attempt-${state.storeAttempt}`)
        track('market', 'retry_prompt', 'directional', 'basket-checks')
      }
      if (state.storeMissionDone && !previous.storeMissionDone) clearFeedback('market')

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
        const analysis = nextTip(result, levers, result.event || EVENTS[0], state.lemFeatures, state.lemTipHistory)
        const correction = lemonadePrimaryCorrection(result, levers, analysis)
        track('lemonade', 'choice_attempt', analysis.currentPerfect ? 'effective' : 'revise', `round-${result.round}`)

        if (analysis.currentPerfect) {
          clearFeedback('lemonade')
        } else {
          setFeedback('lemonade', {
            sourceKey: `lemonade-${result.round}`,
            title: analysis.title,
            diagnosis: analysis.diagnosis,
            action: correction.action,
            goal: analysis.goal,
          })
          track('lemonade', 'retry_prompt', 'directional', correction.lever)
        }
      }

      const previousLogs = previous.mg?.weekLog?.length || 0
      const currentLogs = state.mg?.weekLog?.length || 0
      if (currentLogs > previousLogs) {
        const log = state.mg.weekLog.at(-1)
        const spec = weekSpec(log.week)
        track('garden', 'choice_attempt', log.judged ? 'effective' : 'incorrect', `decision-${log.week}`)
        if (log.judged) {
          clearFeedback('garden')
        } else {
          setFeedback('garden', {
            sourceKey: `garden-${log.week}`,
            title: `Reconsider Decision ${log.week}`,
            diagnosis: `Your garden ended at ${money(log.total)}.`,
            action: spec.nudge || spec.intro,
            goal: 'Use the week’s evidence to change one part of the plan.',
          })
          track('garden', 'retry_prompt', 'directional', `decision-${log.week}`)
        }
      }

      if (
        previous.bt?.stage === 'emergency'
        && state.bt?.stage === 'split'
        && state.btPanel === 'split'
      ) {
        const pocket = previous.bt?.split?.pocket ?? previous.split?.pocket ?? 0
        setFeedback('budget', {
          sourceKey: `budget-emergency-${Date.now()}`,
          title: 'Protect ready cash',
          diagnosis: `Pocket had ${money(pocket)}, and the surprise could not be covered.`,
          action: 'Make Pocket large enough for the surprise before dividing what remains between Bank and Money Garden.',
          goal: 'Keep enough money ready for an unexpected cost.',
        })
        removeDuplicateLesson(EMERGENCY_REPLAY)
        track('budget', 'choice_attempt', 'incorrect', 'emergency-cash')
        track('budget', 'retry_prompt', 'directional', 'protect-ready-cash')
      }
      if (state.bt?.stage === 'handoff' && previous.bt?.stage !== 'handoff') clearFeedback('budget')

      // Detect the two incorrect Bank choices as soon as their consequence starts.
      // This lets us silence the rapid NPC captions before they ever compete with
      // the persistent correction popup.
      if (
        state.week === 4
        && state.bk?.week === 4
        && state.bk?.fx?.billGrowAt
        && state.bk?.fx?.billGrowAt !== previous.bk?.fx?.billGrowAt
      ) {
        setEarlyBankRetryFeedback(4, BK.w4.doneLittle)
      }

      const newestBatch = state.coinBatches?.at(-1)
      const previousBatch = previous.coinBatches?.at(-1)
      if (
        state.week === 4
        && state.bk?.week === 6
        && newestBatch?.id !== previousBatch?.id
        && newestBatch?.id?.startsWith('sc-')
      ) {
        setEarlyBankRetryFeedback(6, BK.w6.coach)
      }

      const currentCard = state.cards.at(-1)
      const previousCard = previous.cards.at(-1)
      if (currentCard && currentCard !== previousCard && currentCard.id === 'bkfb') {
        const mustRetry = currentCard.buttons?.some((button) => button.act === 'bk.retry')
        track('bank', 'choice_attempt', mustRetry ? 'incorrect' : 'effective', `week-${state.bk?.week || 0}`)
        if (mustRetry) {
          const correction = bankRetryAction(state.bk?.week)
          const existing = useFeedbackCoach.getState().feedbackByModule.bank
          setFeedback('bank', {
            sourceKey: existing?.sourceKey || `bank-${state.bk?.week}-${Date.now()}`,
            title: correction.title,
            diagnosis: currentCard.text,
            action: correction.action,
            goal: correction.goal,
          })
          track('bank', 'retry_prompt', 'directional', `week-${state.bk?.week || 0}`)

          // The old bank feedback card is redundant now. Trigger its retry action
          // automatically so the child sees the actual decision plus one coach.
          queueMicrotask(() => {
            const game = useGame.getState()
            const retryCard = game.cards?.[0]
            if (retryCard?.id === 'bkfb' && retryCard.buttons?.some((button) => button.act === 'bk.retry')) {
              game.cardAct('bk.retry')
            }
          })
        } else {
          clearFeedback('bank')
        }
      }

      clearCompetingTransientFeedback(useGame.getState())
    })

    return unsubscribe
  }, [])

  return null
}
