import { useEffect } from 'react'
import { flushTimelines } from '../anim/timeline.js'
import { useGame } from './store.js'
import { SHOPKEEPER, STORE_ITEMS } from './config.js'

const SHOP_LINES_INTRO = [
  "Welcome to the MARKET! I'm Mr. Bram.",
  'Prioritize your needs first. It is okay to enjoy a want too!',
  'Explore the store and choose what feels right, then head to checkout.',
]

const LEMONADE_PANEL_PHASES = new Set([
  'recap', 'supplies', 'pool', 'template', 'recapCard', 'results', 'goalCard', 'tipCard',
])

const MODULE_NAMES = {
  1: 'The Market & Jars',
  2: 'The Lemonade Stand',
  3: 'Budget Town',
  4: 'The Bank of TAYU',
  5: 'The Money Garden',
}

const MODULE_INTROS = {
  1: 'Give every dollar a job, then practice choosing needs before wants.',
  2: 'Build a lemonade business and discover how price, cost, and profit connect.',
  3: 'Make one day of real-life money choices and protect what matters most.',
  4: 'Try bank accounts, cards, interest, and scam spotting in a safe place.',
  5: 'Grow a patient, balanced investment garden through changing weeks.',
}

function Action({ children, onClick, secondary = false }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[60px] w-full rounded-2xl px-5 py-3 text-left text-lg font-extrabold shadow-lg transition active:scale-[0.98] ${
        secondary ? 'border-2 border-white/25 bg-white/10 text-white hover:bg-white/20' : 'bg-electric text-white hover:bg-teal hover:text-navy'
      }`}
    >
      <span aria-hidden="true" className="mr-2 text-teal">→</span>
      {children}
    </button>
  )
}

export function AccessibleWorld() {
  // The choreography is invisible without the 3D scene. Finish it immediately
  // while preserving every state transition and follow-up lesson.
  useEffect(() => {
    const timer = window.setInterval(flushTimelines, 50)
    return () => window.clearInterval(timer)
  }, [])

  const game = useGame()
  const {
    week, objective, mailboxOpened, scenarioState, bramTalked, bought,
    lemPhase, bt, bk, mgPhase, gameComplete, weekComplete,
  } = game

  const actions = []
  if (gameComplete) {
    actions.push(['Enter the Finale Area and get my certificate', () => useGame.setState({ enterParty: true })])
  } else if (week === 1 && objective === 'mailbox') {
    actions.push(['Go to the Allowance Bank and collect $30', game.openMailbox])
  } else if (week === 1 && objective === 'kitchen' && mailboxOpened && scenarioState === 'ALLOCATING') {
    actions.push(['Open the SPEND jar — money for now', () => game.openPanel('spend')])
    actions.push(['Open the SAVE jar — money for later', () => game.openPanel('save')])
    actions.push(['Open the GIVE jar — money to help others', () => game.openPanel('give')])
  } else if (week === 1 && objective === 'store') {
    if (!bramTalked) {
      actions.push([`Talk to ${SHOPKEEPER.name} before shopping`, () => game.openDialog(
        SHOPKEEPER.name,
        SHOP_LINES_INTRO,
        () => game.setBramTalked(),
      )])
    } else {
      STORE_ITEMS.forEach((item) => {
        if (!bought.includes(item.id)) actions.push([`Look at ${item.name} — $${item.price}`, () => game.openItem(item)])
      })
      actions.push([`Check out with ${bought.length} item${bought.length === 1 ? '' : 's'}`, game.confirmCheckout, true])
    }
  } else if (week === 2) {
    if (lemPhase === 'toStand') actions.push(['Go to the Lemonade Stand and meet Penny', game.standIntro])
    else if (lemPhase === 'toMarket') actions.push(['Go to Mr. Bham and buy supplies', game.openSupplies])
    else if (lemPhase === 'toStand2') actions.push(['Return to my stand and make a business plan', game.openTemplate])
  } else if (week === 3 && bt) {
    actions.push([bt.stage === 'intro' ? 'Meet the Budget Keeper and start my day' : 'Continue with the Budget Keeper', game.enterBudget])
  } else if (week === 4 && bk) {
    actions.push([bk.seen?.intro ? 'Continue with Banker Bea' : 'Meet Banker Bea and enter the Bank of TAYU', game.enterBank])
  } else if (week === 5 && mgPhase !== 'done') {
    actions.push([mgPhase === 'toGarden' ? 'Meet Mr. Sprout and enter the Money Garden' : 'Continue with Mr. Sprout', game.enterGarden])
  }

  const busy = !!(
    game.dialog || game.lessons.length || game.cards.length || game.panelJar || game.panelItem ||
    game.btPanel || game.bkPanel || game.panelPortfolio || weekComplete ||
    LEMONADE_PANEL_PHASES.has(lemPhase) || game.scenarioLocked ||
    (week === 5 && ['choices', 'slider', 'summary'].includes(game.mg?.phase))
  )

  return (
    <main className="absolute inset-0 overflow-y-auto bg-gradient-to-b from-[#123a78] via-navy to-[#07112f] px-4 pb-32 pt-24 text-white">
      <div className="mx-auto max-w-xl">
        <div className="pop-in rounded-3xl border-2 border-teal/50 bg-navy/90 p-5 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-full bg-teal px-3 py-1 text-xs font-extrabold text-navy">
              ACCESSIBLE 2D MODE
            </div>
            <div aria-label={`Module ${week} of 5`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white">
              MODULE {week} / 5
            </div>
          </div>
          <h1 aria-live="polite" className="mt-3 font-display text-3xl font-extrabold">{MODULE_NAMES[week] || 'TAYU'}</h1>
          <p className="mt-2 rounded-2xl bg-teal/10 px-4 py-3 text-base font-bold leading-relaxed text-teal">
            {MODULE_INTROS[week]}
          </p>
          <p className="mt-2 text-base font-semibold leading-relaxed text-white/85">
            Walking is replaced with clear destination buttons. Your lessons, choices, money, progress, and rewards work the same way.
          </p>
        </div>

        {!busy && actions.length > 0 && (
          <section aria-labelledby="next-step-title" className="pop-in mt-4 rounded-3xl bg-white/10 p-5">
            <h2 id="next-step-title" className="font-display text-xl font-extrabold text-teal">Your next step</h2>
            <div className="mt-3 flex flex-col gap-3">
              {actions.map(([label, action, secondary]) => (
                <Action key={label} onClick={action} secondary={secondary}>{label}</Action>
              ))}
            </div>
          </section>
        )}

        {!busy && actions.length === 0 && (
          <div role="status" className="mt-4 rounded-3xl bg-white/10 p-5 text-center text-lg font-bold">
            Complete the choice on screen to continue.
          </div>
        )}

        {game.scenarioLocked && (
          <div role="status" aria-live="polite" className="mt-4 rounded-3xl bg-white/10 p-5 text-center text-lg font-bold">
            Finishing this activity… Your next choice will appear automatically.
          </div>
        )}
      </div>
    </main>
  )
}
