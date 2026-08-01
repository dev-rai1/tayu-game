import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'
import { activeFeedbackKey, useFeedbackCoach } from './feedbackCoach.js'

function hintKey(type, value, week, objective) {
  if (!value) return ''
  if (type === 'improvement') return `${type}:${week}:${objective}:${value.sourceKey || value.title}`
  return `${type}:${week}:${objective}:${value.title}:${value.action}`
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
  const [expanded, setExpanded] = useState(false)
  const [dismissedKey, setDismissedKey] = useState('')

  const activeLesson = lessons[0]
  useLayoutEffect(() => {
    // Adding $5 to a jar should feel continuous, not open a blocking lesson
    // after every choice. Keep the result feedback that appears after the
    // complete allocation is evaluated.
    if (activeLesson?.learn === 'jars') useGame.getState().dismissLesson()
  }, [activeLesson?.id, activeLesson?.learn])

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
  const transientMessageVisible = Boolean(toast || guide || actorCaption || banner)
  const type = improvement ? 'improvement' : 'guidance'
  const content = improvement || guidance
  const key = hintKey(type, content, week, objective)
  const canShow = Boolean(
    content && visibility.showGuidance && !transientMessageVisible && dismissedKey !== key,
  )

  useEffect(() => {
    // Corrective feedback should be immediately readable. General hints can
    // remain compact until the player asks to see more.
    setExpanded(type === 'improvement')
  }, [key, type])

  if (!canShow) return null

  const label = improvement ? "Benny's feedback" : 'Show hint'
  const title = improvement ? improvement.title : guidance.title
  const diagnosis = improvement?.diagnosis
  const action = improvement ? improvement.action : (guidance.action || guidance.instruction)
  const spoken = [title, diagnosis, action].filter(Boolean).join('. ')
  const positionClass = usesTouchControls
    ? 'bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:left-3 sm:translate-x-0'
  const sizeClass = improvement
    ? 'w-[min(94vw,30rem)] border-4 ring-4 ring-electric/25'
    : 'w-[min(90vw,23rem)] border-2'

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-layout={usesTouchControls ? 'touch' : 'desktop'}
      className={`pointer-events-auto fixed left-1/2 z-[490] max-h-[min(65vh,32rem)] -translate-x-1/2 overflow-y-auto rounded-2xl border-electric bg-white text-navy shadow-2xl ${sizeClass} ${positionClass}`}
    >
      {!expanded ? (
        <div className={`flex items-center gap-2 ${improvement ? 'p-3' : 'p-2'}`}>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={`min-h-[48px] min-w-0 flex-1 rounded-xl bg-electric/10 px-4 text-left active:scale-[0.99] ${improvement ? 'py-2' : ''}`}
          >
            <span className={`block font-extrabold uppercase tracking-[0.14em] text-electric ${improvement ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
            <span className={`block truncate font-extrabold ${improvement ? 'mt-1 text-lg leading-snug' : 'text-sm'}`}>{title}</span>
          </button>
          <button
            type="button"
            aria-label="Hide this hint"
            onClick={() => setDismissedKey(key)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-xl font-extrabold text-navy active:scale-95"
          >
            ×
          </button>
        </div>
      ) : (
        <div className={improvement ? 'p-4 sm:p-5' : 'p-3'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className={`font-extrabold uppercase tracking-[0.14em] text-electric ${improvement ? 'text-xs' : 'text-[10px]'}`}>{label}</div>
              <div className={`mt-1 break-words font-extrabold leading-snug ${improvement ? 'text-xl' : 'text-sm'}`}>{title}</div>
              {diagnosis && (
                <div className="mt-3 rounded-xl bg-navy/5 px-4 py-3 text-base font-semibold leading-relaxed text-navy/85">
                  {diagnosis}
                </div>
              )}
              {improvement && <div className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-electric">Try this</div>}
              <p className={`break-words font-semibold text-navy/80 ${improvement ? 'mt-1 text-lg leading-relaxed' : 'mt-1 text-sm leading-snug'}`}>{action}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className={`shrink-0 rounded-xl bg-navy/10 px-3 font-extrabold text-navy active:scale-95 ${improvement ? 'min-h-[44px] text-sm' : 'min-h-[40px] text-xs'}`}
            >
              Hide
            </button>
          </div>
          <div className={improvement ? 'mt-4 flex gap-2' : 'mt-2 flex gap-2'}>
            <button
              type="button"
              onClick={() => say(spoken)}
              className={`flex-1 rounded-xl bg-electric/10 px-3 font-extrabold text-electric active:scale-95 ${improvement ? 'min-h-[48px] text-sm' : 'min-h-[42px] text-xs'}`}
            >
              Read aloud
            </button>
            <button
              type="button"
              onClick={() => setDismissedKey(key)}
              className={`flex-1 rounded-xl bg-navy/10 px-3 font-extrabold text-navy active:scale-95 ${improvement ? 'min-h-[48px] text-sm' : 'min-h-[42px] text-xs'}`}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
