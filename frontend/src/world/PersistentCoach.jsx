import { useEffect, useMemo, useState } from 'react'
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
    setExpanded(false)
  }, [key])

  if (!canShow) return null

  const label = improvement ? 'Try one change' : 'Show hint'
  const title = improvement ? improvement.title : guidance.title
  const action = improvement ? improvement.action : (guidance.action || guidance.instruction)
  const spoken = [title, action].filter(Boolean).join('. ')
  const positionClass = usesTouchControls
    ? 'bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:left-3 sm:translate-x-0'

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-layout={usesTouchControls ? 'touch' : 'desktop'}
      className={`pointer-events-auto fixed left-1/2 z-[490] w-[min(90vw,23rem)] -translate-x-1/2 rounded-2xl border-2 border-electric bg-white text-navy shadow-2xl ${positionClass}`}
    >
      {!expanded ? (
        <div className="flex items-center gap-2 p-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="min-h-[44px] min-w-0 flex-1 rounded-xl bg-electric/10 px-3 text-left active:scale-[0.99]"
          >
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-electric">{label}</span>
            <span className="block truncate text-sm font-extrabold">{title}</span>
          </button>
          <button
            type="button"
            aria-label="Hide this hint"
            onClick={() => setDismissedKey(key)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/10 text-lg font-extrabold text-navy active:scale-95"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-electric">{label}</div>
              <div className="mt-1 break-words text-sm font-extrabold leading-snug">{title}</div>
              <p className="mt-1 break-words text-sm font-semibold leading-snug text-navy/75">{action}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="min-h-[40px] shrink-0 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95"
            >
              Hide
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => say(spoken)}
              className="min-h-[42px] flex-1 rounded-xl bg-electric/10 px-3 text-xs font-extrabold text-electric active:scale-95"
            >
              Read aloud
            </button>
            <button
              type="button"
              onClick={() => setDismissedKey(key)}
              className="min-h-[42px] flex-1 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
