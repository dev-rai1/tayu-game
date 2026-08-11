import { useEffect, useMemo, useState } from 'react'
import { useGame, moveTarget } from './store.js'
import { clearTimelines } from '../anim/timeline.js'
import { DEBIT_ITEM, TRUST_MAX } from '../scenarios/bankModule.js'

const r2 = (n) => Math.round(n * 100) / 100

export const BANK_DECISIONS = {
  1: {
    step: 'Protect your money',
    question: 'You brought money to the bank. What keeps it protected while it is still yours?',
    choices: [
      { id: 'deposit', label: 'Put it in the bank vault', correct: true },
      { id: 'outside', label: 'Leave it outside the bank', correct: false },
    ],
    retry: 'Money left outside is easier to lose. Try the safer choice.',
  },
  2: {
    step: 'Choose an account plan',
    question: 'You want some money easy to use and some money earning more while you wait. Which plan would you try?',
    choices: [
      { id: 'smart', label: 'Savings + a CD', act: 'bk.w2.smart' },
      { id: 'safe', label: 'Mostly savings', act: 'bk.w2.safe' },
      { id: 'cash', label: 'All checking', act: 'bk.w2.cash' },
    ],
    note: 'There is a tradeoff here. Pick a plan, then watch what happens to your money.',
  },
  3: {
    step: 'Pick the right card',
    question: `A water bottle costs $${DEBIT_ITEM.cost}. Which card takes money you already have directly from checking?`,
    choices: [
      { id: 'debit', label: 'Debit card', correct: true },
      { id: 'credit', label: 'Credit card', correct: false },
      { id: 'same', label: 'They work the same way', correct: false },
    ],
    retry: 'Credit borrows money and makes a bill later. Which one uses your own checking money now?',
  },
  4: {
    step: 'Handle a credit bill',
    question: 'You bought something for $5 on credit. The bill arrives. What do you do?',
    choices: [
      { id: 'full', label: 'Pay the full $5 now', act: 'bk.w4.full' },
      { id: 'little', label: 'Pay only $1 now', act: 'bk.w4.little' },
    ],
    note: 'Choose first. The game will show what each choice does to the debt.',
  },
  5: {
    step: 'Make debt easier to manage',
    question: 'Six bills and six due dates feel confusing. What is the best next move?',
    choices: [
      { id: 'help', label: 'Ask a trusted nonprofit counselor for help', correct: true },
      { id: 'ignore', label: 'Ignore the bills for now', correct: false },
      { id: 'more', label: 'Open more cards to move the debt around', correct: false },
    ],
    retry: 'Ignoring debt or adding more cards can make the problem harder. Look for trustworthy help.',
  },
}

function resolveQuickDeposit() {
  useGame.setState((x) => ({
    scenarioLocked: false,
    bk: {
      ...x.bk,
      vault: r2(x.bk.vault + x.bk.bankAmount),
      bankAmount: 0,
      fx: { ...x.bk.fx, vaultAt: Date.now() },
    },
  }))
  useGame.getState().setToast('Protected in the vault. The money is still yours.')
  window.setTimeout(() => useGame.getState().bkResolve(1, true), 650)
}

function resolveQuickDebit() {
  useGame.setState((x) => {
    let { checking, savings } = x.bk
    if (checking < DEBIT_ITEM.cost) {
      const need = r2(DEBIT_ITEM.cost - checking)
      savings = r2(Math.max(0, savings - need))
      checking = r2(checking + need)
    }
    return {
      scenarioLocked: false,
      bk: {
        ...x.bk,
        checking: r2(checking - DEBIT_ITEM.cost),
        savings,
        fx: { ...x.bk.fx, swipeAt: Date.now() },
      },
    }
  })
  useGame.getState().setToast(`Debit used $${DEBIT_ITEM.cost} from checking right away.`)
  window.setTimeout(() => useGame.getState().bkResolve(3, true), 700)
}

function resolveQuickDebtHelp() {
  useGame.setState((x) => ({
    scenarioLocked: false,
    bk: {
      ...x.bk,
      fx: { ...x.bk.fx, debtAt: Date.now(), debtMergeAt: Date.now() },
    },
  }))
  useGame.getState().setToast('One organized payment plan is easier to understand than six separate bills.')
  window.setTimeout(() => useGame.getState().bkResolve(5, true), 800)
}

export function BankDecisionCoach() {
  const week = useGame((s) => s.week)
  const bk = useGame((s) => s.bk)
  const [releasedWeek, setReleasedWeek] = useState(null)
  const [feedback, setFeedback] = useState('')

  const bankWeek = bk?.week || 0
  const decision = useMemo(() => BANK_DECISIONS[bankWeek] || null, [bankWeek])
  const introStarted = Boolean(bk?.seen?.intro)

  useEffect(() => {
    if (week !== 4 || !bk || !introStarted || !decision || releasedWeek === bankWeek) return

    // The old Module 4 flow could start a long speech/timeline before a child
    // ever made a choice. Stop that pre-lesson sequence and put the decision
    // first. The consequence/feedback still comes after the student's choice.
    clearTimelines()
    moveTarget.x = null
    moveTarget.z = null
    useGame.setState({ cards: [], scenarioLocked: false, near: null })
    setFeedback('')
  }, [week, bk, introStarted, decision, releasedWeek, bankWeek])

  useEffect(() => {
    setFeedback('')
    if (releasedWeek !== null && releasedWeek !== bankWeek) setReleasedWeek(null)
  }, [bankWeek, releasedWeek])

  if (week !== 4 || !bk || !introStarted || !decision || releasedWeek === bankWeek) return null

  const choose = (choice) => {
    if (choice.correct === false) {
      setFeedback(decision.retry)
      return
    }

    setFeedback('')
    setReleasedWeek(bankWeek)

    if (choice.act) {
      useGame.getState().bkAct(choice.act)
      return
    }
    if (bankWeek === 1 && choice.id === 'deposit') {
      resolveQuickDeposit()
      return
    }
    if (bankWeek === 3 && choice.id === 'debit') {
      resolveQuickDebit()
      return
    }
    if (bankWeek === 5 && choice.id === 'help') {
      resolveQuickDebtHelp()
    }
  }

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-4 z-[325] flex justify-center px-4 sm:bottom-6">
      <section
        aria-label={`Module 4 decision ${bankWeek}`}
        className="w-full max-w-xl rounded-3xl border-2 border-white/80 bg-white p-4 text-navy shadow-2xl sm:p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-electric">Module 4 · Decision {bankWeek} of 6</div>
            <div className="mt-0.5 font-display text-lg font-black sm:text-xl">{decision.step}</div>
          </div>
          <div className="rounded-xl bg-teal/15 px-3 py-1 text-xs font-black text-[#08785e]">Choose first</div>
        </div>

        <p className="mt-3 text-base font-extrabold leading-snug sm:text-lg">{decision.question}</p>
        {decision.note && <p className="mt-1 text-sm font-semibold text-navy/60">{decision.note}</p>}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {decision.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => choose(choice)}
              className="min-h-[58px] rounded-2xl border-2 border-navy/10 bg-navy/[0.03] px-4 py-3 text-left text-sm font-extrabold transition hover:border-electric hover:bg-electric/5 active:scale-[0.98] sm:text-base"
            >
              {choice.label}
            </button>
          ))}
        </div>

        {feedback && (
          <div role="status" aria-live="polite" className="mt-3 rounded-2xl border border-[#e46a3a]/30 bg-[#fff0e8] px-4 py-3 text-sm font-bold text-[#8a3b1e]">
            Try again: {feedback}
          </div>
        )}
      </section>
    </div>
  )
}

export function TrustMeter() {
  const bk = useGame((s) => s.bk)
  const week = useGame((s) => s.week)
  if (week !== 4 || !bk) return null
  return (
    <>
      <BankDecisionCoach />
      <div
        role="progressbar"
        aria-label="Credit habits practice meter"
        aria-valuemin={0}
        aria-valuemax={TRUST_MAX}
        aria-valuenow={bk.trust}
        aria-valuetext={`${bk.trust} of ${TRUST_MAX} credit-habit practice points. This is not a real credit score.`}
        className="glass--navy absolute left-4 top-44 z-[155] max-w-[calc(100vw-2rem)] rounded-2xl px-3 py-2 shadow-lg sm:top-28"
      >
        <div className="text-[10px] font-extrabold tracking-wide text-teal">CREDIT HABITS</div>
        <div className="text-[9px] font-bold text-white/70">Practice meter — not a real score</div>
        <div className="mt-1 flex gap-1">
          {Array.from({ length: TRUST_MAX }, (_, i) => (
            <div key={i} className="h-3 w-4 rounded-sm transition-all duration-500"
              style={{ background: i < bk.trust ? 'linear-gradient(90deg,#00DCA0,#FFD700)' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      </div>
    </>
  )
}
