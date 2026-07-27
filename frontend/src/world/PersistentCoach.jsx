import { useEffect, useMemo, useState } from 'react'
import { useGame } from './store.js'
import { getGuidance } from './guidance.js'
import { usesTouchControls } from './controlMode.js'

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
  const gameComplete = useGame((s) => s.gameComplete)
  const lemPhase = useGame((s) => s.lemPhase)
  const bramTalked = useGame((s) => s.bramTalked)
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

  const [savedMessage, setSavedMessage] = useState(null)

  useEffect(() => {
    const next = messageFrom({ actorCaption, guide, toast, banner })
    // Never erase a message merely because its animation timer ended. It stays
    // readable until the player dismisses it or a newer message replaces it.
    if (next) setSavedMessage(next)
  }, [actorCaption, guide, toast, banner])

  const guidance = useMemo(() => getGuidance({
    week, objective, scenarioLocked, scenario, gameComplete, lemPhase, bramTalked,
    bought, mg, bt, bk, weekComplete, cards, lessons, dialog, panelJar, panelItem,
    btPanel, bkPanel, panelPortfolio, helpOpen,
  }, usesTouchControls), [
    week, objective, scenarioLocked, scenario, gameComplete, lemPhase, bramTalked,
    bought, mg, bt, bk, weekComplete, cards, lessons, dialog, panelJar, panelItem,
    btPanel, bkPanel, panelPortfolio, helpOpen,
  ])

  const overlayActive = Boolean(
    helpOpen || dialog || cards.length || lessons.length || panelJar || panelItem ||
    btPanel || bkPanel || panelPortfolio || weekComplete
  )

  return (
    <>
      {overlayActive && (
        <aside className="pointer-events-none fixed right-3 top-3 z-[500] w-[min(78vw,23rem)] rounded-2xl border-2 border-teal bg-navy/95 px-4 py-3 text-white shadow-2xl">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">Next step — stays visible</div>
          <div className="mt-1 text-sm font-extrabold leading-snug">{guidance.title}</div>
          <div className="mt-1 text-xs font-semibold leading-snug text-white/80">{guidance.instruction}</div>
          <div className="mt-1 text-xs font-extrabold text-sun">{guidance.action}</div>
        </aside>
      )}

      {savedMessage && (
        <aside className="pointer-events-auto fixed left-3 z-[490] w-[min(92vw,25rem)] rounded-2xl border-2 border-electric bg-white px-4 py-3 text-navy shadow-2xl sm:bottom-4" style={{ bottom: 'calc(7rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">{savedMessage.label} — saved for reading</div>
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
        </aside>
      )}
    </>
  )
}
