import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { say } from '../services/speech.js'
import { getReadingBand } from '../services/readingPreferences.js'
import { LEARN } from '../scenarios/learnLinks.js'
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
  const dismissLesson = useGame((s) => s.dismissLesson)
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
  const bankWatching = week === 4 && scenarioLocked

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

  useEffect(() => {
    if (!bankWatching || typeof window === 'undefined') return undefined
    const blockBankE = (event) => {
      if (event.code !== 'KeyE') return
      event.preventDefault()
      event.stopPropagation()
      if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation()
    }
    window.addEventListener('keydown', blockBankE, true)
    return () => window.removeEventListener('keydown', blockBankE, true)
  }, [bankWatching])

  useLayoutEffect(() => {
    const incoming = []
    const add = (kind, value) => {
      const message = coachMessageFromTransient(kind, value)
      if (!message) return
      messageCounter.current += 1
      incoming.push({ ...message, id: `${kind}-${messageCounter.current}` })
    }

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
  }, [actorCaption, banner, guide, toast])

  // Lemonade's short instructional sequence is useful, but these are hints,
  // not blocking decisions. Keep them in the side lane after any important
  // story/lesson popup is finished.
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
          kind: 'guide',
          label: 'Hint',
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
  const lessonMessage = activeLesson ? coachMessageFromTransient('lesson', activeLesson) : null
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

  const type = dialogMessage
    ? 'dialog'
    : lessonMessage
      ? 'lesson'
      : queuedMessage
        ? 'queued'
        : improvement
          ? 'improvement'
          : 'guidance'
  const content = dialogMessage || lessonMessage || queuedMessage || improvement || (!paycheckMode ? generatedGuidance : null)
  const key = queuedMessage?.id || activeLesson?.id || hintKey(type, content, week, objective)
  const canShow = Boolean(
    content && (['queued', 'dialog', 'lesson', 'improvement'].includes(type) || visibility.showGuidance) &&
    (['queued', 'dialog', 'lesson'].includes(type) || dismissedKey !== key)
  )

  useEffect(() => {
    if (['queued', 'dialog', 'lesson'].includes(type)) setDismissedKey('')
  }, [key, type])

  if (!canShow) return null

  const label = dialogMessage?.label || lessonMessage?.label || queuedMessage?.label || (bankWatching ? 'Bank animation' : improvement ? "Benny's feedback" : 'Hint')
  const title = dialogMessage?.title || lessonMessage?.title || queuedMessage?.title || improvement?.title || generatedGuidance?.title
  const diagnosis = improvement?.diagnosis
  const action = dialogMessage?.action || lessonMessage?.action || queuedMessage?.action || improvement?.action || generatedGuidance?.action || generatedGuidance?.instruction
  const spoken = [title, diagnosis, action].filter(Boolean).join('. ')
  const queueProgress = dialogMessage
    ? `${dialog.index + 1} of ${dialog.lines.length}`
    : lessonMessage && lessons.length > 1
      ? `1 of ${lessons.length}`
      : queuedMessage?.total
        ? `${queuedMessage.step} of ${queuedMessage.total}`
        : queue.length > 1
          ? `1 of ${queue.length}`
          : ''

  // Whole-game rule: decisions, lessons, corrections, and story dialogue are
  // important and appear in front. Ordinary guidance, reminders, and requested
  // hints stay out of the gameplay area in a compact side lane.
  const important = bankWatching || ['dialog', 'lesson', 'improvement'].includes(type) || queuedMessage?.kind === 'actor'
  const positionClass = important
    ? 'left-1/2 top-1/2 w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2'
    : usesTouchControls
      ? 'right-[max(0.65rem,env(safe-area-inset-right,0px))] bottom-[calc(10.75rem+env(safe-area-inset-bottom,0px))] w-[min(86vw,22rem)]'
      : 'right-[max(0.75rem,env(safe-area-inset-right,0px))] top-[calc(7.25rem+env(safe-area-inset-top,0px))] w-[min(30vw,22rem)] min-w-[18rem]'
  const frameClass = bankWatching
    ? 'border-4 border-electric ring-8 ring-electric/20'
    : important
      ? 'border-2 border-electric ring-4 ring-electric/15'
      : 'border border-navy/15'
  const learnResource = type === 'lesson' && activeLesson?.learn ? LEARN[activeLesson.learn] : null

  return (
    <>
      {important && (
        <div
          className="pointer-events-none fixed inset-0 z-[559] bg-navy/25 backdrop-blur-[1px]"
          data-important-message-scrim="true"
          aria-hidden="true"
        />
      )}
      <aside
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-control-layout={usesTouchControls ? 'touch' : 'desktop'}
        data-guidance-lane={important ? 'important-popup' : 'side-hint'}
        data-guidance-kind={type}
        data-bank-watching={bankWatching ? 'true' : 'false'}
        className={`pointer-events-none fixed z-[560] max-h-[min(72vh,34rem)] overflow-y-auto rounded-2xl bg-white text-navy shadow-2xl ${frameClass} ${positionClass}`}
      >
        <div className={important ? 'p-5 sm:p-6' : 'p-3'}>
          <div className="flex items-start gap-3">
            <div className={`${important ? 'h-12 w-12 text-base' : 'h-9 w-9 text-xs'} grid shrink-0 place-items-center rounded-2xl border-2 border-electric/20 bg-electric/10 font-black text-electric shadow-sm`} aria-hidden="true">
              {bankWatching ? '▶' : helperFace(dialogMessage ? 'actor' : lessonMessage ? 'lesson' : queuedMessage?.kind || type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`${important ? 'text-xs' : 'text-[10px]'} font-extrabold uppercase tracking-[0.14em] text-electric`}>{important ? label : (label || 'Hint')}</span>
                {queueProgress && <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-extrabold text-navy/60">{queueProgress}</span>}
              </div>
              <div className={`${important ? 'mt-1 text-xl sm:text-2xl' : 'mt-0.5 text-base'} break-words font-extrabold leading-snug text-navy`}>{title}</div>
              {diagnosis && <div className="mt-2 rounded-xl bg-navy/5 px-3 py-2 text-sm font-semibold leading-relaxed text-navy/85">{diagnosis}</div>}
              <p className={`${important ? 'mt-2 text-base' : 'mt-1.5 text-sm'} break-words font-semibold leading-relaxed text-navy/80`}>{action}</p>
              {bankWatching && (
                <div className="mt-3 rounded-2xl border-2 border-electric/20 bg-electric/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-electric">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-electric" aria-hidden="true" />
                    Bank animation playing
                  </div>
                  <p className="mt-1 text-base font-extrabold leading-snug text-navy">Watch the scene. You do not need to press E while this is moving.</p>
                  <div className="mt-3 flex gap-2" aria-hidden="true">
                    <span className="h-2 flex-1 animate-pulse rounded-full bg-electric/30" />
                    <span className="h-2 flex-1 animate-pulse rounded-full bg-electric/50 [animation-delay:180ms]" />
                    <span className="h-2 flex-1 animate-pulse rounded-full bg-electric/70 [animation-delay:360ms]" />
                  </div>
                </div>
              )}
              {learnResource && (
                <a
                  href={learnResource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto mt-2 block rounded-xl bg-electric/10 px-3 py-2 text-center text-xs font-extrabold text-electric active:scale-95"
                >
                  Learn more: {learnResource.label}
                </a>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => say(spoken)} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric/10 px-3 text-xs font-extrabold text-electric active:scale-95">
              Read aloud
            </button>
            {dialogMessage ? (
              <button type="button" onClick={advanceDialog} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95">
                {dialog.index + 1 >= dialog.lines.length ? 'Got it' : 'Next'}
              </button>
            ) : lessonMessage ? (
              <button type="button" onClick={dismissLesson} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95">
                {lessons.length > 1 ? 'Next' : 'Got it'}
              </button>
            ) : queuedMessage ? (
              <button type="button" onClick={() => setQueue((current) => current.slice(1))} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-electric px-3 text-sm font-extrabold text-white active:scale-95">
                {bankWatching ? (queue.length > 1 ? 'Next message' : 'Keep watching') : (queue.length > 1 ? 'Next' : 'Got it')}
              </button>
            ) : bankWatching ? (
              <div className="grid min-h-[44px] flex-1 place-items-center rounded-xl bg-navy/10 px-3 text-center text-sm font-extrabold text-navy/70" aria-live="polite">
                Waiting for the scene…
              </div>
            ) : (
              <button type="button" onClick={() => setDismissedKey(key)} className="pointer-events-auto min-h-[44px] flex-1 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy active:scale-95">
                Hide hint
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
