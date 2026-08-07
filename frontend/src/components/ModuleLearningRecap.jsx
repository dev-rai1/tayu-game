import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../world/store.js'

const MODULE_RECAPS = {
  1: {
    title: 'The Market & Jars',
    memory: 'Every dollar needs a job: now, later, or helping.',
    items: [
      'SPEND money is for needs and things you choose to enjoy now.',
      'SAVE money is money you keep for future goals and surprises.',
      'GIVE money is money you intentionally set aside to help others.',
      'Needs come before wants, and money you do not spend can become savings.',
    ],
  },
  2: {
    title: 'The Lemonade Stand',
    memory: 'Sales are not profit. What you keep comes after costs and tax.',
    items: [
      'Revenue is all the money customers pay you before expenses come out.',
      'Business costs include supplies and paying yourself for your work.',
      'Profit is what is left after costs, and taxes can reduce what you finally keep.',
      'Price, hours, demand, and your choices can all change how much profit a business makes.',
    ],
  },
  3: {
    title: 'Budget Town',
    memory: 'Plan the must-haves first, then give the leftover money a job.',
    items: [
      'A budget compares the money coming in with the money going out.',
      'Needs like housing, food, transportation, and health come before optional wants.',
      'Leftover money should be intentionally divided for near-term cash, saving, and longer-term goals.',
      'Keeping an emergency cushion helps one surprise expense avoid wrecking the rest of your plan.',
    ],
  },
  4: {
    title: 'The Bank of TAYU',
    memory: 'Banking is choosing where money lives and how safely you use it.',
    items: [
      'Checking is built for everyday spending, while savings and CDs are designed for money you are keeping.',
      'Debit uses money you already have. Credit means borrowing money that must be paid back.',
      'Paying a credit balance in full can avoid extra interest; paying only a little can make the purchase cost more.',
      'Suspicious messages asking for money or private information are a warning sign for scams.',
    ],
  },
  5: {
    title: 'Paycheck Planet',
    memory: 'Plan with the money that actually reaches you, not just the number you earned.',
    items: [
      'Gross pay is what you earn before taxes and other deductions are removed.',
      'Take-home pay is the amount that actually reaches you after taxes are withheld.',
      'A realistic spending plan should use take-home pay, not gross pay.',
      'Saving for future expenses, and keeping an extra tax reserve for some gig work, can prevent surprises later.',
    ],
  },
  6: {
    title: 'Money Garden',
    memory: 'Do not bet everything on one seed: spread, watch, and stay patient.',
    items: [
      'Diversifying means spreading money across different investments so one bad result hurts less.',
      'Prices move up and down, so one exciting week does not automatically make something a good long-term choice.',
      'Keeping some money in cash or the bank can help you handle surprises without selling investments at a bad time.',
      'Patient investors watch what changes, rebalance when needed, and avoid chasing whatever is suddenly popular.',
    ],
  },
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
        className="pop-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-navy shadow-2xl sm:p-7"
      >
        <div className="text-center">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">Module {module} complete</div>
          <h2 id={`module-${module}-recap-title`} className="mt-1 font-display text-3xl font-extrabold">What you learned</h2>
          <p className="mt-1 text-sm font-bold text-navy/60">{recap.title}</p>
        </div>

        <div className="mt-5 grid gap-2.5">
          {recap.items.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-2xl border-2 border-electric/10 bg-electric/5 p-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric font-display text-sm font-extrabold text-white" aria-hidden>
                {index + 1}
              </span>
              <p className="text-base font-bold leading-snug">{item}</p>
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

  if (!activeModule) return null
  return <ModuleLearningRecap module={activeModule} onClose={() => setActiveModule(null)} />
}

export { MODULE_RECAPS }
