import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { say } from '../services/speech.js'
import { getReadingBand } from '../services/readingPreferences.js'
import { moneyGardenDecision } from '../scenarios/moneyGardenGuidance.js'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'
import { activeFeedbackKey, useFeedbackCoach } from './feedbackCoach.js'
import { coachMessageFromTransient, coachMessageSignature } from './coachMessages.js'
import { LEMONADE_FOCUS_KEYS, focusStepsFor } from './playtestFocus.js'

const MAX_QUEUE = 16

function hintKey(type, value, week, objective) {
  if (!value) return ''
  if (type === 'improvement') return `${type}:${week}:${objective}:${value.sourceKey || value.title}`
  return `${type}:${week}:${objective}:${value.title}:${value.action}`
}

function wasSeen(key) {
  if (!key || typeof sessionStorage === 'undefined') return false
  try { return sessionStorage.getItem(key) === '1' } catch { return false }
}

function markSeen(key) {
  if (!key || typeof sessionStorage === 'undefined') return
  try { sessionStorage.setItem(key, '1') } catch { /* Storage can be blocked. */ }
}

function helperFace(kind) {
  if (kind === 'actor') return '💬'
  if (kind === 'lesson') return '★'
  if (kind === 'improvement' || kind === 'toast') return '!'
  return '•ᴗ•'
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
  const advanceDialog = useGame((s) => s.advanceDialog)
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
  const messageCounter = useRef(0)
  const queuedFocus = useRef(new Set())

  const activeLesson = lessons[0]
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

  // Route short-lived message fields into this one tray before Hud can paint
  // separate toast/banner/NPC/lesson bubbles. Each item stays until the learner
  // advances it, so fast animations cannot make important feedback disappear.
  useLayoutEffect(() => {
    const incoming = []
    const add = (kind, value) => {
      const message = coachMessageFromTransient(kind, value)
      if (!message) return
      messageCounter.current += 1
      incoming.push({ ...message, id: `${kind}-${messageCounter.current}` })
    }

    if (activeLesson) add('lesson', activeLesson)
    if (actorCaption) add('actor', actorCaption)
    if (toast) add('toast', toast)
    if (banner) add('banner', banner)
    if (guide) add('guide', guide)

    if (incoming.length) {
      setQueue((current) => {
        const signatures = new Set(current.map(coachMessageSignature))
        const additions = incoming.filter((message) => {
          const signature = coachMessageSignature(message)
          if (!signature || signatures.has(signature)) return false
          signatures.add(signature)
          return true
        })
        return [...current, ...additions].slice(0, MAX_QUEUE)
      })
    }

    const clear = {}
    if (actorCaption) clear.actorCaption = null
    if (toast) clear.toast = null
    if (banner) clear.banner = null
    if (guide) clear.guide = null
    if (Object.keys(clear).length) useGame.setState(clear)
    if (activeLesson) {
      try { useGame.getState().dismissLesson() } catch { /* Keep the world usable. */ }
    }
  }, [activeLesson, actorCaption, banner, guide, toast])

  // The old Lemonade focus modal taught useful material, but it covered the
  // activity. Preserve its sequence here as small coach messages instead.
  useEffect(() => {
    if (week !== 2 || !['supplies', 'template'].includes(lemPhase)) return
    const storageKey = LEMONADE_FOCUS_KEYS[lemPhase]
    if (!storageKey || wasSeen(storageKey) || queuedFocus.current.has(storageKey)) return

    const steps = focusStepsFor(lemPhase, getReadingBand())
    if (!steps.length) return
    queuedFocus.current.add(storageKey)
    markSeen(storageKey)
    setQueue((current) => {
      const additions = steps.map((step, index) => {
        messageCounter.current += 1
        return {
          id: `lemonade-focus-${messageCounter.current}`,
          kind: 'lesson',
          label: 'One step at a time',
          title: step.title,
          action: step.text,
          helper: 'learn',
          step: index + 1,
          total: steps.length,
        }
      })
      return [...current, ...additions].slice(0, MAX_QUEUE)
    })
  }, [lemPhase, week])

  const visibility = coachVisibility(stateForGuidance)
  const feedbackKey = activeFeedbackKey(stateForGuidance)
  const improvement = !paycheckMode && feedbackKey ? feedbackByModule[feedbackKey] : null
  const gardenGuide = !paycheckMode && week === 5 && mg?.phase === 'adjust'
    ? moneyGardenDecision(mg.week)
    : null
  const queuedMessage = queue[0]
  const dialogLine = dialog?.lines?.[dialog.index]
  const dialogMessage = dialogLine
    ? {
        kind: 'actor',
        label: `${dialog.name || 'TAYU friend'} says`,
        title: dialog.name || 'TAYU friend',
        action: dialogLine,
      }
    : null
  const generatedGuidance = gardenGuide
    ? { title: gardenGuide.title, action: gardenGuide.instruction }
    : guidance

  const type = queuedMessage ? 'queued' : dialogMessage ? 'dialog' : improvement ? 'improvement' : 'guidance'
  const content = queuedMessage || dialogMessage || improvement || (!paycheckMode ? generatedGuidance : null)
  const key = queuedMessage?.id || hintKey(type, content, week, objective)
  const canShow = Boolean(
    content && (type === 'queued' || type === 'dialog' || type === 'improvement' || visibility.showGuidance) &&
    (type === 'queued' || type === 'dialog' || dismissedKey !== key)
  )

  useEffect(() => {
    if (type === 'queued' || type === 'dialog') setDismissedKey('')
  }, [key, type])

  if (!canShow) return null

  const label = queuedMessage?.label || dialogMessage?.label || (improvement ? "Benny's feedback" : 'Next step')
  const title = queuedMessage?.title || dialogMessage?.title || improvement?.title || generatedGuidance?.title
  const diagnosis = improvement?.diagnosis
  const action = queuedMessage?.action || dialogMessage?.action || improvement?.action || generatedGuidance?.action || generatedGuidance?.instruction
  const spoken = [title, diagnosis, action].filter(Boolean).join('. ')
  const queueProgress = dialogMessage
    ? `${dialog.index + 1} of ${dialog.lines.length}`
    : queuedMessage?.total
      ? `${queuedMessage.step} of ${queuedMessage.total}`
      : queue.length > 1
        ? `1 of ${queue.length}`
        : ''
  const positionClass = usesTouchControls
    ? 'bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))]'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:left-3 sm:translate-x-0'
  const emphasized = type === 'queued' || type === 'dialog' || type === 'improvement'

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-layout={usesTouchControls ? 'touch' : 'desktop'}
      data-guidance-lane="primary"
      className={`pointer-events-none fixed left-1/2 z-[560] max-h-[min(62vh,30rem)] w-[min(92vw,27rem)] -translate-x-1/2 overflow-y-auto rounded-2xl border-2 bg-white text-navy shadow-2xl ${emphasized ? 'border-electric ring-4 ring-electric/15' : 'border-navy/15'} ${positionClass}`}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-electric/20 bg-electric/10 text-sm font-black text-electric shadow-sm" aria-hidden="true">
            {helperFace(queuedMessage?.kind || (type === 'dialog' ? 'actor' : type))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-electric">{label}</span>
              {queueProgress && <span className="rounded-full bg-navy/8 px-2 py-0.5 text-[10px] font-extrabold text-navy/60">{queueProgress}</span>}
            </div>
            <div className="mt-0.5 break-words text-base font-extrabold leading-snug text-navy">{title}</div>
            {diagnosis && <div className="mt-2 rounded-xl bg-navy/5 px-3 py-2 text-sm font-semibold leading-relaxed text-navy/85">{diagnosis}</div>}
            <p className="mt-1.5 break-words text-sm font-semibold leading-relaxed text-navy/80">{action}</p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => say(spoken)} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric/10 px-3 text-xs font-extrabold text-electric active:scale-95">
            Read aloud
          </button>
          {queuedMessage ? (
            <button type="button" onClick={() => setQueue((current) => current.slice(1))} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95">
              {queue.length > 1 ? 'Next' : 'Got it'}
            </button>
          ) : dialogMessage ? (
            <button type="button" onClick={advanceDialog} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95">
              {dialog.index + 1 >= dialog.lines.length ? 'Got it' : 'Next'}
            </button>
          ) : (
            <button type="button" onClick={() => setDismissedKey(key)} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95">
              Hide hint
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
