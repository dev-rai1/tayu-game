import { useEffect, useMemo, useState } from 'react'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'
import { activeFeedbackKey, useFeedbackCoach } from './feedbackCoach.js'

const ACTOR_NAMES = {
  player: 'You', penny: 'Penny', theo: 'Theo', mia: 'Mia', bea: 'Banker Bea',
  teller: 'Teller Tom', clerk: 'Clerk Cleo', mailer: 'Postal Pat',
  scammer: 'Sneaky Sam', helper: 'Helper Hana', bram: 'Mr. Bram',
  sprout: 'Mr. Sprout', scoop: 'Scoop', wanderer: 'Milo', nea: 'Nea',
}

function messageFrom({ actorCaption, guide, toast, banner }) {
  if (actorCaption?.line) {
    return {
      label: ACTOR_NAMES[actorCaption.actor] || actorCaption.actor || 'Character',
      text: actorCaption.line,
    }
  }
  if (guide?.line) return { label: 'Suggestion', text: guide.line }
  if (toast) return { label: 'Message', text: toast }
  if (banner) return { label: 'Achievement', text: banner }
  return null
}

export function PersistentCoach() {
  const week = useGame((s) => s.week)
  const objective = useGame((s) => s.objective)
  const scenarioLocked = useGame((s) => s.scenarioLocked)
  const scenario = useGame((s) => s.scenario)
  const scenarioState = useGame((s) => s.scenarioState)
  const gameComplete = useGame((s) => s.gameComplete)
  const lemPhase = useGame((s) => s.lemPhase)
  const bramTalked = useGame((s) => s.bramTalked)
  const storeMissionDone = useGame((s) => s.storeMissionDone)
  const bought = useGame((s) => s.bought)
  const mg = useGame((s) => s.mg)
  const bt = useGame((s) => s.bt)
  const bk = useGame((s) => s.bk)
  const weekComplete = useGame((s) => s.weekComplete)
  const cards = useGame((s) => s.cards)
  const lessons = useGame((s) => s.lessons)
  const dialog = useGame((s) => s.dialog)
  const panelJar = useGame((s) => s.panelJar)
  const panelItem = useGame((s) => s.panelItem)
  const btPanel = useGame((s) => s.btPanel)
  const bkPanel = useGame((s) => s.bkPanel)
  const panelPortfolio = useGame((s) => s.panelPortfolio)
  const helpOpen = useGame((s) => s.helpOpen)
  const toast = useGame((s) => s.toast)
  const guide = useGame((s) => s.guide)
  const actorCaption = useGame((s) => s.actorCaption)
  const banner = useGame((s) => s.banner)
  const feedbackByModule = useFeedbackCoach((s) => s.feedbackByModule)

  const [savedMessage, setSavedMessage] = useState(null)

  useEffect(() => {
    const next = messageFrom({ actorCaption, guide, toast, banner })
    // Keep the latest message available, but do not stack it on top of an active
    // decision panel. It reappears as soon as the play area is clear.
    if (next) setSavedMessage(next)
  }, [actorCaption, guide, toast, banner])

  const stateForGuidance = {
    week, objective, scenarioLocked, scenario, scenarioState, gameComplete, lemPhase, bramTalked,
    storeMissionDone, bought, mg, bt, bk, weekComplete, cards, lessons, dialog,
    panelJar, panelItem, btPanel, bkPanel, panelPortfolio, helpOpen,
  }

  const guidance = useMemo(() => getGuidance(stateForGuidance, usesTouchControls), [
    week, objective, scenarioLocked, scenario, scenarioState, gameComplete, lemPhase, bramTalked,
    storeMissionDone, bought, mg, bt, bk, weekComplete, cards, lessons, dialog,
    panelJar, panelItem, btPanel, bkPanel, panelPortfolio, helpOpen,
  ])

  const visibility = coachVisibility(stateForGuidance)
  const feedbackKey = activeFeedbackKey(stateForGuidance)
  const improvement = feedbackKey ? feedbackByModule[feedbackKey] : null
  const showMessage = Boolean(savedMessage && visibility.showSavedMessage)
  const showImprovement = Boolean(improvement && visibility.showGuidance)
  const showGuidance = Boolean(guidance && visibility.showGuidance && !showImprovement)

  if (!showMessage && !showImprovement && !showGuidance) return null

  return (
    <aside
      aria-live="polite"
      className="pointer-events-auto fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[490] max-h-[42vh] w-[min(92vw,28rem)] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl border-2 border-electric bg-white px-4 py-3 text-navy shadow-2xl sm:left-3 sm:translate-x-0"
    >
      {showMessage && (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">{savedMessage.label}</div>
              <p className="mt-1 break-words text-base font-bold leading-snug">{savedMessage.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setSavedMessage(null)}
              className="min-h-[40px] shrink-0 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showMessage && (showImprovement || showGuidance) && <div className="my-3 border-t border-navy/10" />}

      {showImprovement && (
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sun">Try one change</div>
          <div className="mt-1 text-sm font-extrabold leading-snug">{improvement.title}</div>
          <div className="mt-1 text-xs font-semibold leading-snug text-navy/70">{improvement.action}</div>
          <div className="mt-1 text-xs font-extrabold text-electric">{improvement.goal}</div>
        </div>
      )}

      {showGuidance && (
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Next step</div>
          <div className="mt-1 text-sm font-extrabold leading-snug">{guidance.title}</div>
          <div className="mt-1 text-xs font-semibold leading-snug text-navy/70">{guidance.instruction}</div>
          <div className="mt-1 text-xs font-extrabold text-electric">{guidance.action}</div>
        </div>
      )}
    </aside>
  )
}
