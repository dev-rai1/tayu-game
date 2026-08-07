import { useEffect, useMemo, useRef, useState } from 'react'
import { loadProfile } from '../services/walletStore.js'
import { isPaycheckWorldActive } from '../world/paycheckMode.js'
import { useGame } from '../world/store.js'

function makeRecap({ title, memory, steps }) {
  return {
    title,
    memory,
    steps,
    // Keep `items` for the legacy standalone Module 5 completion screen.
    items: steps.map((step) => step.lesson),
  }
}

const MODULE_RECAPS = {
  1: makeRecap({
    title: 'The Market & Jars',
    memory: 'Every dollar needs a job: now, later, or helping.',
    steps: [
      {
        activity: 'Sort the jars',
        lesson: 'SPEND is for needs and choices now, SAVE is for later, and GIVE is money you choose to use to help others.',
      },
      {
        activity: 'Shop the market',
        lesson: 'When money is limited, needs should come before wants.',
      },
      {
        activity: 'Keep some money',
        lesson: 'Money you do not spend can become savings for a goal or an unexpected expense.',
      },
    ],
  }),
  2: makeRecap({
    title: 'The Lemonade Stand',
    memory: 'Sales are not profit. What you keep comes after costs and tax.',
    steps: [
      {
        activity: 'Make sales',
        lesson: 'Revenue is all the money customers pay the business before any expenses come out.',
      },
      {
        activity: 'Pay the costs',
        lesson: 'Supplies and the work needed to run the stand reduce how much of the revenue you actually keep.',
      },
      {
        activity: 'Cash out',
        lesson: 'Profit is what remains after costs, and taxes can reduce the final amount you take home.',
      },
      {
        activity: 'Change your choices',
        lesson: 'Price, hours, demand, and other business decisions can change how much profit you make.',
      },
    ],
  }),
  3: makeRecap({
    title: 'Budget Town',
    memory: 'Plan the must-haves first, then give the leftover money a job.',
    steps: [
      {
        activity: 'Build the budget',
        lesson: 'A budget compares the money coming in with the money going out so you know what you can afford.',
      },
      {
        activity: 'Pay the must-haves',
        lesson: 'Needs like housing, food, transportation, and health come before optional wants.',
      },
      {
        activity: 'Split the leftover',
        lesson: 'Money left after needs should be intentionally divided between near-term cash, savings, and longer-term goals.',
      },
      {
        activity: 'Handle a surprise',
        lesson: 'An emergency cushion helps one unexpected expense avoid wrecking the rest of your plan.',
      },
    ],
  }),
  4: makeRecap({
    title: 'The Bank of TAYU',
    memory: 'Banking is choosing where money lives and how safely you use it.',
    steps: [
      {
        activity: 'Pick an account',
        lesson: 'Checking is built for everyday spending, while savings and CDs are designed for money you are keeping.',
      },
      {
        activity: 'Use debit or credit',
        lesson: 'Debit uses money you already have. Credit means borrowing money that must be paid back.',
      },
      {
        activity: 'Pay the card bill',
        lesson: 'Paying a credit balance in full can avoid extra interest; paying only a little can make the purchase cost more.',
      },
      {
        activity: 'Spot the scam',
        lesson: 'Unexpected messages asking for money or private information are a warning sign to stop and verify first.',
      },
    ],
  }),
  5: makeRecap({
    title: 'Paycheck Planet',
    memory: 'Plan with the money that actually reaches you, not just the number you earned.',
    steps: [
      {
        activity: 'Choose a job',
        lesson: 'Gross pay is the full amount you earn before taxes and other deductions are removed.',
      },
      {
        activity: 'Watch taxes come out',
        lesson: 'Gross pay minus the tax withheld equals your take-home pay.',
      },
      {
        activity: 'Plan your take-home pay',
        lesson: 'A realistic spending and saving plan should use the money you actually receive, not the larger gross number.',
      },
      {
        activity: 'Face the bike repair',
        lesson: 'Setting money aside for future expenses gives you a cushion when an unexpected cost appears.',
      },
    ],
  }),
  6: makeRecap({
    title: 'Money Garden',
    memory: 'Strong investing is a plan: own carefully, diversify, research, protect near-term cash, think long term, and rebalance.',
    steps: [
      {
        activity: 'Buy company shares',
        lesson: 'A stock is a small ownership interest in a company, and a share is one unit of that ownership. Its return can be a gain or a loss, so investing always involves uncertainty.',
      },
      {
        activity: 'Spread your investments',
        lesson: 'Diversification spreads money across investments so one company has less control over the result. It can reduce concentration risk, but it cannot eliminate every loss.',
      },
      {
        activity: 'Research the businesses',
        lesson: 'Credible business evidence matters more than a low price, a recent jump, or hype. Price alone does not tell you whether a company is healthy.',
      },
      {
        activity: 'Keep some money ready',
        lesson: 'Your time horizon is how long until you need the money. Keeping near-term needs in ready cash can keep a surprise from forcing a sale at a bad time.',
      },
      {
        activity: 'Watch several weeks',
        lesson: 'One dramatic week can reverse. Patient investing means comparing new evidence over time instead of chasing a short-term move.',
      },
      {
        activity: 'Rebalance the garden',
        lesson: 'Rebalancing means adjusting holdings after prices change so the portfolio moves back toward its intended mix and risk level.',
      },
    ],
  }),
}

export function ModuleLearningRecap({ module, onClose }) {
  const recap = MODULE_RECAPS[module]
  if (!recap) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-[380] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`module-${module}-recap-title`}
        className="pop-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-navy shadow-2xl sm:p-7"
      >
        <div className="text-center">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module {module} complete</div>
          <h2 id={`module-${module}-recap-title`} className="mt-1 font-display text-3xl font-extrabold">What each part taught you</h2>
          <p className="mt-1 text-sm font-bold text-navy/60">{recap.title}</p>
          <p className="mt-2 text-sm font-semibold text-navy/70">Connect what you just did to the money idea behind it.</p>
        </div>

        <div className="mt-5 grid gap-2.5">
          {recap.steps.map((step, index) => (
            <div key={step.activity} className="flex gap-3 rounded-2xl border-2 border-electric/10 bg-electric/5 p-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric font-display text-sm font-extrabold text-white" aria-hidden>
                {index + 1}
              </span>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-wide text-electric">You did: {step.activity}</div>
                <p className="mt-1 text-base font-bold leading-snug">You learned: {step.lesson}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-sun/25 p-4 text-center">
          <div className="text-xs font-extrabold uppercase tracking-wide text-navy/60">Remember this</div>
          <p className="mt-1 text-lg font-extrabold leading-snug">{recap.memory}</p>
        </div>

        <button type="button" onClick={onClose} className="btn-primary mt-5 min-h-[58px] w-full text-lg">
          Got it — keep going
        </button>
      </section>
    </div>
  )
}

export function WorldModuleLearningRecap() {
  const week = useGame((state) => state.week)
  const weekComplete = useGame((state) => state.weekComplete)
  const cards = useGame((state) => state.cards)
  const [activeModule, setActiveModule] = useState(null)
  const previousTrigger = useRef(null)
  const taxCompletionRef = useRef(loadProfile()?.taxLab?.completedAt || null)

  const triggerModule = useMemo(() => {
    if (week === 1 && weekComplete) return 1
    if (week === 2 && weekComplete) return 2
    if (week === 3 && cards[0]?.id === 'bt4') return 3
    if (week === 4 && cards[0]?.id === 'bkhand') return 4
    // Internal world week 5 is public Module 6 (Money Garden).
    if (week === 5 && cards[0]?.id === 'bridge') return 6
    return null
  }, [cards, week, weekComplete])

  useEffect(() => {
    if (triggerModule && triggerModule !== previousTrigger.current) {
      setActiveModule(triggerModule)
    }
    previousTrigger.current = triggerModule
  }, [triggerModule])

  // Module 5 now completes inside the 3D world. saveProfile() emits this event
  // when Paycheck Planet stores its fresh completion timestamp and tax badge.
  useEffect(() => {
    const handleProgressSaved = () => {
      const profile = loadProfile() || {}
      const completedAt = profile.taxLab?.completedAt || null
      if (!completedAt || completedAt === taxCompletionRef.current) return

      taxCompletionRef.current = completedAt
      if (isPaycheckWorldActive() && (profile.badges || []).includes('tax')) {
        setActiveModule(5)
      }
    }

    window.addEventListener('tayu-progress-saved', handleProgressSaved)
    return () => window.removeEventListener('tayu-progress-saved', handleProgressSaved)
  }, [])

  if (!activeModule) return null
  return <ModuleLearningRecap module={activeModule} onClose={() => setActiveModule(null)} />
}

export { MODULE_RECAPS }
