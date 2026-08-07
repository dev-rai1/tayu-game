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

function actorName(value = '') {
  const names = {
    penny: 'Penny',
    bram: 'Mr. Bram',
    sprout: 'Mr. Sprout',
    bea: 'Banker Bea',
    theo: 'Theo',
    mia: 'Mia',
    scoop: 'Scoop',
    wanderer: 'Milo',
    nea: 'Nea',
  }
  return names[value] || String(value || 'Character').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function queuedMessage(kind, title, body) {
  const text = String(body || '').trim()
  if (!text) return null
  return {
    id: `${kind}:${text}`,
    kind,
    title,
    body: text,
  }
}

export function PersistentCoach({ paycheckMode = false }) {
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
  const [queue, setQueue] = useState([])
  const [dismissedKey, setDismissedKey] = useState('')

  const activeLesson = lessons[0]
  useLayoutEffect(() => {
    if (activeLesson?.learn === 'jars') useGame.getState().dismissLesson()
  }, [activeLesson?.id, activeLesson?.learn])

  const enqueue = (entry) => {
    if (!entry) return
    setQueue((current) => current.some((item) => item.id === entry.id) ? current : [...current, entry])
  }

  // Short-lived messages used to disappear before younger players could read
  // them. Capture every one here and keep it until the player explicitly moves
  // to the next message. The old visual bubbles are hidden by worldDeclutter.css.
  useEffect(() => {
    enqueue(queuedMessage('feedback', 'Feedback', toast))
  }, [toast])

  useEffect(() => {
    enqueue(queuedMessage('hint', 'Hint', guide?.line))
  }, [guide])

  useEffect(() => {
    enqueue(queuedMessage('update', 'Update', banner))
  }, [banner])

  useEffect(() => {
    enqueue(queuedMessage('character', `${actorName(actorCaption?.actor)} says`, actorCaption?.line))
  }, [actorCaption])

  useEffect(() => {
    setQueue([])
    setDismissedKey('')
  }, [week])

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
  const waiting = queue[0]

  const paycheckGuidance = paycheckMode
    ? {
        title: 'Paycheck Planet',
        action: usesTouchControls
          ? 'Follow the glowing station, then tap the blue action button when you reach it.'
          : 'Follow the glowing station, then press E when you reach it.',
      }
    : null

  const type = waiting ? 'queued' : improvement ? 'improvement' : 'guidance'
  const content = waiting || improvement || paycheckGuidance || guidance
  const key = waiting?.id || hintKey(type, content, week, objective)
  const canShow = Boolean(
    content &&
    (waiting || paycheckMode || visibility.showGuidance) &&
    !visibility.blocking &&
    !visibility.commerce &&
    !visibility.specialized &&
    dismissedKey !== key
  )

  if (!canShow) return null

  const label = waiting
    ? waiting.kind === 'character' ? 'CHARACTER' : waiting.kind === 'feedback' ? 'FEEDBACK' : waiting.kind === 'update' ? 'UPDATE' : 'HINT'
    : improvement ? "Benny's feedback" : 'Show hint'
  const title = waiting ? waiting.title : improvement ? improvement.title : content.title
  const diagnosis = improvement?.diagnosis
  const action = improvement ? improvement.action : (content.action || content.instruction)
  const messageBody = waiting ? waiting.body : action
  const spoken = [title, diagnosis, messageBody].filter(Boolean).join('. ')
  const queueCount = queue.length

  const advance = () => {
    if (waiting) {
      setQueue((current) => current.slice(1))
      return
    }
    setDismissedKey(key)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[490]">
      <aside
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-guidance-rail="true"
        className="pointer-events-auto absolute right-3 top-[5.5rem] w-[min(92vw,27rem)] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border-2 border-electric bg-white p-4 text-navy shadow-2xl sm:right-4 sm:w-[min(32vw,27rem)]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-electric/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-electric">{label}</span>
          {waiting && queueCount > 1 && (
            <span className="text-xs font-extrabold text-navy/45">1 of {queueCount}</span>
          )}
        </div>

        <h2 className="mt-3 break-words font-display text-xl font-extrabold leading-snug text-navy">{title}</h2>
        {diagnosis && (
          <p className="mt-3 rounded-2xl bg-navy/5 px-4 py-3 text-base font-semibold leading-relaxed text-navy/85">{diagnosis}</p>
        )}
        <p className="mt-3 break-words text-lg font-semibold leading-relaxed text-navy/85">{messageBody}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => say(spoken)}
            className="min-h-[50px] rounded-2xl bg-navy/10 px-3 text-sm font-extrabold text-navy active:scale-95"
          >
            Read aloud
          </button>
          <button
            type="button"
            onClick={advance}
            className="min-h-[50px] rounded-2xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95"
          >
            {waiting ? (queueCount > 1 ? 'Next' : 'Got it') : 'Dismiss'}
          </button>
        </div>
      </aside>
    </div>
  )
}
