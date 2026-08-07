import { useLayoutEffect, useMemo, useState } from 'react'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'
import { coachVisibility } from './overlayVisibility.js'
import { activeFeedbackKey, useFeedbackCoach } from './feedbackCoach.js'

const ACTOR_LABELS = {
  player: 'You', penny: 'Penny', theo: 'Theo', mia: 'Mia', bea: 'Banker Bea',
  teller: 'Teller Tom', clerk: 'Clerk Cleo', mailer: 'Postal Pat',
  scammer: 'Sneaky Sam', helper: 'Helper Hana', bram: 'Mr. Bram',
  sprout: 'Mr. Sprout', scoop: 'Scoop', wanderer: 'Milo', nea: 'Nea',
}

function compactText(value, max = 120) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (!text) return ''

  const sentenceEnd = text.search(/[.!?](?:\s|$)/)
  const firstSentence = sentenceEnd >= 0 ? text.slice(0, sentenceEnd + 1) : text
  const candidate = firstSentence.length >= 28 ? firstSentence : text
  if (candidate.length <= max) return candidate

  const clipped = candidate.slice(0, Math.max(1, max - 1)).trimEnd().replace(/[,:;.!?]+$/, '')
  return `${clipped}…`
}

function transientClue({ toast, guide, actorCaption, banner }) {
  if (actorCaption?.line) {
    const name = ACTOR_LABELS[actorCaption.actor] || 'Character'
    return {
      sourceKey: `actor:${actorCaption.actor}:${actorCaption.line}`,
      title: `${name} says`,
      action: actorCaption.line,
      transient: true,
    }
  }
  if (guide?.line) {
    return {
      sourceKey: `guide:${guide.line}`,
      title: "Penny's clue",
      action: guide.line,
      transient: true,
    }
  }
  if (toast) {
    return {
      sourceKey: `toast:${toast}`,
      title: 'Quick update',
      action: toast,
      transient: true,
    }
  }
  if (banner) {
    return {
      sourceKey: `banner:${banner}`,
      title: 'Quick update',
      action: banner,
      transient: true,
    }
  }
  return null
}

function hintKey(type, value, week, objective) {
  if (!value) return ''
  return `${type}:${week}:${objective}:${value.sourceKey || value.title}:${value.action || value.instruction || ''}`
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
  const [dismissedKey, setDismissedKey] = useState('')

  const activeLesson = lessons[0]
  useLayoutEffect(() => {
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
  const transient = transientClue({ toast, guide, actorCaption, banner })
  const type = improvement ? 'improvement' : transient ? 'transient' : 'guidance'
  const content = improvement || transient || guidance
  const key = hintKey(type, content, week, objective)

  // Feedback and short-lived messages may still use the tray while a specialized
  // commerce guide is active. Blocking dialogs/panels remain the only reason to
  // hide the clue so the player never gets two competing text surfaces.
  const canUseTray = !visibility.blocking && (improvement || transient || visibility.showGuidance)
  const canShow = Boolean(content && canUseTray && dismissedKey !== key)
  if (!canShow) return null

  const label = improvement ? 'Try this' : transient ? 'Quick update' : 'Guided clue'
  const rawTitle = improvement ? improvement.title : (content.title || label)
  const rawAction = improvement
    ? (improvement.action || improvement.diagnosis || improvement.goal)
    : (content.action || content.instruction || '')
  const title = compactText(rawTitle, 58)
  const action = compactText(rawAction, 118)
  const spoken = [title, action].filter(Boolean).join('. ')

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-control-layout={usesTouchControls ? 'touch' : 'desktop'}
      data-guided-clue-tray="true"
      style={{
        left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        bottom: usesTouchControls
          ? 'calc(10.75rem + env(safe-area-inset-bottom, 0px))'
          : 'calc(1rem + env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed z-[490] w-[min(88vw,24rem)] rounded-2xl border-2 border-electric bg-white p-3 text-navy shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-electric">{label}</div>
          <div className="mt-0.5 text-lg font-extrabold leading-snug">{title}</div>
          {action && action !== title && (
            <p className="mt-1 text-base font-semibold leading-snug text-navy/80">{action}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Hide this clue"
          onClick={() => setDismissedKey(key)}
          className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 text-lg font-extrabold text-navy active:scale-95"
        >
          ×
        </button>
      </div>
      {spoken && (
        <button
          type="button"
          onClick={() => say(spoken)}
          className="pointer-events-auto mt-2 min-h-[40px] rounded-xl bg-electric/10 px-3 text-sm font-extrabold text-electric active:scale-95"
        >
          Read aloud
        </button>
      )}
    </aside>
  )
}
