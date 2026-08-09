import { useEffect, useState } from 'react'
import { flushTimelines } from '../anim/timeline.js'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import { SHOPKEEPER, STORE_ITEMS } from './config.js'
import { WORLD_CHAPTER_COUNT } from '../constants/modules.js'

const SHOP_LINES_INTRO = [
  "Welcome to the MARKET! I'm Mr. Bram.",
  'Prioritize your needs first. It is okay to enjoy a want too!',
  'Explore the store and choose what feels right, then head to checkout.',
]

const LEMONADE_PANEL_PHASES = new Set(['recap', 'supplies', 'pool', 'template', 'recapCard', 'results', 'goalCard', 'tipCard'])

const MODULE_NAMES = {
  1: 'The Market & Jars',
  2: 'The Lemonade Stand',
  3: 'Budget Town',
  4: 'The Bank of TAYU',
  5: 'Money Garden — investing finale',
}

const MODULE_INTROS = {
  1: 'Give every dollar a job, then practice choosing needs before wants.',
  2: 'Build a lemonade business and discover how price, cost, and profit connect.',
  3: 'Make one day of real-life money choices and protect what matters most.',
  4: 'Try bank accounts, cards, interest, and scam spotting in a safe place.',
  5: 'Grow a patient, balanced investment garden through changing weeks. Money Garden is learning Module 6; this is World Chapter 5.',
}

const ACCESSIBLE_HELP = 'Accessible 2D mode does not use walking, WASD, camera dragging, or arrows. Use the large destination buttons under Your next step. Choose a destination, complete the activity that opens, and the next button will appear automatically. Use Read aloud whenever you want help reading.'

function Action({ children, onClick, secondary = false }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-[64px] w-full rounded-2xl px-5 py-3 text-left text-lg font-extrabold leading-snug shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal active:scale-[0.98] ${secondary ? 'border-2 border-white/25 bg-white/10 text-white hover:bg-white/20' : 'bg-electric text-white hover:bg-teal hover:text-navy'}`}>
      <span aria-hidden="true" className="mr-2 text-teal">→</span>{children}
    </button>
  )
}

export function AccessibleWorld() {
  const [introExpanded, setIntroExpanded] = useState(true)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(flushTimelines, 50)
    return () => window.clearInterval(timer)
  }, [])

  const game = useGame()
  const { week, objective, mailboxOpened, scenarioState, bramTalked, bought, lemPhase, bt, bk, mgPhase, gameComplete, weekComplete } = game

  // The shared HUD owns the ? button, but its default controls describe the 3D
  // world. In 2D, immediately consume that request and replace it with this
  // destination-button help dialog so contradictory WASD/camera instructions
  // are never left open behind the accessible experience.
  useEffect(() => {
    if (!game.helpOpen) return
    setHelpDialogOpen(true)
    game.setHelpOpen(false)
  }, [game.helpOpen, game.setHelpOpen])

  const actions = []
  if (gameComplete) {
    actions.push(['Final step: Enter the celebration area and get my certificate', () => useGame.setState({ enterParty: true })])
  } else if (week === 1 && objective === 'mailbox') {
    actions.push(['Step 1: Collect my $30 allowance from the Allowance Bank', game.openMailbox])
  } else if (week === 1 && objective === 'kitchen' && mailboxOpened && scenarioState === 'ALLOCATING') {
    actions.push(['Choose the SPEND jar — money I can use now', () => game.openPanel('spend')])
    actions.push(['Choose the SAVE jar — money I keep for later', () => game.openPanel('save')])
    actions.push(['Choose the GIVE jar — money I use to help others', () => game.openPanel('give')])
  } else if (week === 1 && objective === 'store') {
    if (!bramTalked) {
      actions.push([`Step 1: Talk to ${SHOPKEEPER.name} to unlock the Market`, () => game.openDialog(SHOPKEEPER.name, SHOP_LINES_INTRO, () => game.setBramTalked())])
    } else {
      STORE_ITEMS.forEach((item) => { if (!bought.includes(item.id)) actions.push([`Inspect ${item.name}. It costs $${item.price}.`, () => game.openItem(item)]) })
      actions.push([`Finish shopping: Check out with ${bought.length} item${bought.length === 1 ? '' : 's'}`, game.confirmCheckout, true])
    }
  } else if (week === 2) {
    if (lemPhase === 'toStand') actions.push(['Step 1 of 3: Go to the Lemonade Stand and meet Penny', game.standIntro])
    else if (lemPhase === 'toMarket') actions.push(['Step 2 of 3: Open the Shopping List and choose lemons, sweetener, and cups', game.openSupplies])
    else if (lemPhase === 'toStand2') actions.push(['Step 3 of 3: Set my recipe, banner, and price, then open the stand', game.openTemplate])
  } else if (week === 3 && bt) {
    actions.push([bt.stage === 'intro' ? 'Step 1: Meet the Budget Keeper and start my day' : 'Continue: Open the next highlighted Budget Town decision', game.enterBudget])
  } else if (week === 4 && bk) {
    actions.push([bk.seen?.intro ? 'Continue: Open the next Bank of TAYU activity' : 'Step 1: Meet Banker Bea and enter the Bank of TAYU', game.enterBank])
  } else if (week === 5 && mgPhase !== 'done') {
    actions.push([mgPhase === 'toGarden' ? 'Step 1: Meet Mr. Sprout and enter the Money Garden' : 'Continue: Open my portfolio, make one choice, and test it', game.enterGarden])
  }

  const busy = !!(game.dialog || game.lessons.length || game.cards.length || game.panelJar || game.panelItem || game.btPanel || game.bkPanel || game.panelPortfolio || weekComplete || LEMONADE_PANEL_PHASES.has(lemPhase) || game.scenarioLocked || (week === 5 && ['choices', 'slider', 'summary'].includes(game.mg?.phase)))

  return (
    <>
      <main className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-[#123a78] via-navy to-[#07112f] px-4 pb-32 pt-24 text-white">
        <div className="mx-auto max-w-xl">
          {introExpanded ? (
            <div className="pop-in rounded-3xl border-2 border-teal/50 bg-navy/95 p-5 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-navy">ACCESSIBLE 2D MODE</div>
                <div aria-label={`World chapter ${week} of ${WORLD_CHAPTER_COUNT}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white">WORLD CHAPTER {week} / {WORLD_CHAPTER_COUNT}</div>
              </div>
              <h1 aria-live="polite" className="mt-3 font-display text-3xl font-extrabold">{MODULE_NAMES[week] || 'TAYU'}</h1>
              <p className="mt-2 rounded-2xl bg-teal/10 px-4 py-3 text-base font-bold leading-relaxed text-teal">{MODULE_INTROS[week]}</p>
              <p className="mt-2 text-base font-semibold leading-relaxed text-white/85">Walking is replaced with clear destination buttons. Each button says exactly what it opens and what to do next. Your lessons, choices, money, progress, and rewards work the same way.</p>
              <button type="button" onClick={() => setIntroExpanded(false)} className="mt-4 w-full rounded-2xl bg-teal px-4 py-3 font-extrabold text-navy">Got it — show my next step</button>
            </div>
          ) : (
            <button type="button" onClick={() => setIntroExpanded(true)} className="rounded-2xl border border-teal/40 bg-navy/90 px-4 py-2 text-sm font-extrabold text-teal shadow-lg">2D mode info</button>
          )}

          {!busy && actions.length > 0 && <section aria-labelledby="next-step-title" aria-live="polite" aria-atomic="true" className="pop-in mt-4 rounded-3xl bg-navy/95 p-5 shadow-xl"><div className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">Do this now</div><h2 id="next-step-title" className="mt-1 font-display text-xl font-extrabold text-teal">Your next step</h2><div className="mt-3 flex flex-col gap-3">{actions.map(([label, action, secondary]) => <Action key={label} onClick={action} secondary={secondary}>{label}</Action>)}</div></section>}
          {!busy && actions.length === 0 && <div role="status" aria-live="polite" className="mt-4 rounded-3xl bg-navy/95 p-5 text-center text-lg font-bold shadow-xl">Complete the choice currently shown on screen. The next step will appear here automatically.</div>}
          {game.scenarioLocked && <div role="status" aria-live="polite" className="mt-4 rounded-3xl bg-navy/95 p-5 text-center text-lg font-bold shadow-xl">Finishing this activity… Your next choice will appear automatically.</div>}
        </div>
      </main>

      {helpDialogOpen && (
        <div className="fixed inset-0 z-[1200] grid place-items-center bg-navy/80 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="accessible-how-to-play-title" className="w-full max-w-lg rounded-3xl border-2 border-teal/50 bg-navy p-5 text-white shadow-2xl">
            <div className="text-xs font-extrabold uppercase tracking-[0.16em] text-teal">Accessible 2D mode</div>
            <h2 id="accessible-how-to-play-title" className="mt-1 font-display text-2xl font-extrabold">How to Play</h2>
            <div className="mt-4 grid gap-2">
              <div className="rounded-2xl bg-white/10 p-3"><span aria-hidden="true" className="mr-2 text-xl">①</span><b>Choose a destination.</b> Use the large buttons under “Your next step.”</div>
              <div className="rounded-2xl bg-white/10 p-3"><span aria-hidden="true" className="mr-2 text-xl">②</span><b>Make the choice that opens.</b> No walking or camera controls are needed.</div>
              <div className="rounded-2xl bg-white/10 p-3"><span aria-hidden="true" className="mr-2 text-xl">③</span><b>Follow the next button.</b> It appears automatically after each activity.</div>
            </div>
            <p className="mt-3 rounded-2xl bg-teal/10 p-3 text-sm font-bold leading-relaxed text-teal">No WASD, right-click camera movement, or 3D arrows are used in this mode.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => say(ACCESSIBLE_HELP)} className="min-h-[48px] rounded-2xl bg-white/10 px-4 font-extrabold text-teal">🔊 Read aloud</button>
              <button type="button" data-dialog-close onClick={() => setHelpDialogOpen(false)} className="min-h-[48px] rounded-2xl bg-teal px-4 font-extrabold text-navy">Got it</button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
