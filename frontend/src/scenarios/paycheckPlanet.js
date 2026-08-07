export const TOTAL_PAYCHECK_WEEKS = 6

export const START_JOBS = [
  { id: 'library', label: 'LIBRARY HELPER', gross: 120, rate: 0.10, freeTime: 7, comfort: 5, x: -2.7, note: 'Lower pay · more free time' },
  { id: 'camp', label: 'CAMP ASSISTANT', gross: 160, rate: 0.15, freeTime: 5, comfort: 5, x: 0, note: 'Middle pay · middle schedule' },
  { id: 'design', label: 'DESIGN GIG', gross: 200, rate: 0.20, freeTime: 3, comfort: 4, x: 2.7, note: 'Higher pay · less free time' },
]

export const CAREER_JOBS = [
  { id: 'library-lead', label: 'LIBRARY LEAD', gross: 165, rate: 0.12, freeTime: 6, comfort: 6, x: -2.7, note: 'Steady hours · moderate raise' },
  { id: 'camp-lead', label: 'CAMP SHIFT LEAD', gross: 220, rate: 0.17, freeTime: 4, comfort: 5, x: 0, note: 'Bigger raise · busier week' },
  { id: 'design-contract', label: 'DESIGN CONTRACT', gross: 285, rate: 0.22, freeTime: 2, comfort: 4, x: 2.7, note: 'Highest pay · least free time' },
]

export const BUDGET_PLANS = [
  { id: 'save-first', label: 'SAVE FIRST', needs: 0.55, wants: 0.15, save: 0.30, x: -2.7, comfort: 0, time: 0, note: 'Bigger cushion · fewer wants' },
  { id: 'balanced', label: 'BALANCED', needs: 0.55, wants: 0.25, save: 0.20, x: 0, comfort: 1, time: 0, note: 'Mix today and later' },
  { id: 'spend-more', label: 'SPEND MORE NOW', needs: 0.55, wants: 0.35, save: 0.10, x: 2.7, comfort: 2, time: 0, note: 'More wants · smaller cushion' },
]

export const WEEK_SPECS = [
  {
    week: 1,
    title: 'FIRST PAYCHECK',
    intro: 'Choose your first job. Compare gross pay, the simplified game withholding rate, and free time. Then build a budget from take-home pay.',
    lifeTitle: 'COMMUTE CHOICE',
    choices: [
      { id: 'bike', label: 'BIKE', sublabel: '$8 COST · MORE FREE CASH', cost: 8, comfort: 0, time: 0, x: -2.7, lesson: 'A cheaper commute leaves more money for other goals.' },
      { id: 'bus', label: 'BUS PASS', sublabel: '$18 COST · STEADY OPTION', cost: 18, comfort: 1, time: 0, x: 0, lesson: 'A predictable transportation cost is easier to plan for.' },
      { id: 'rides', label: 'RIDE SHARE', sublabel: '$35 COST · MORE CONVENIENT', cost: 35, comfort: 2, time: 1, x: 2.7, lesson: 'Convenience can improve daily life, but it uses more of the paycheck.' },
    ],
  },
  {
    week: 2,
    title: 'REAL-LIFE COSTS',
    intro: 'Another paycheck arrives, but regular expenses return too. Rebuild your budget and decide how much convenience fits your income.',
    lifeTitle: 'FOOD FOR THE WEEK',
    choices: [
      { id: 'meal-prep', label: 'MEAL PREP', sublabel: '$24 COST · TAKES TIME', cost: 24, comfort: 1, time: -1, x: -2.7, lesson: 'Lower-cost choices can protect savings, but they may take more time.' },
      { id: 'mix-food', label: 'MIX IT UP', sublabel: '$34 COST · BALANCED', cost: 34, comfort: 2, time: 0, x: 0, lesson: 'A middle option can balance convenience and cost.' },
      { id: 'takeout', label: 'TAKEOUT', sublabel: '$48 COST · MOST CONVENIENT', cost: 48, comfort: 3, time: 1, x: 2.7, lesson: 'Spending more can buy convenience now, but leaves less room later.' },
    ],
  },
  {
    week: 3,
    title: 'SAVE FOR A GOAL',
    intro: 'You want something bigger later. Decide whether to move extra cash toward the goal or keep more money available for this week.',
    lifeTitle: 'GOAL DECISION',
    choices: [
      { id: 'goal-40', label: 'SAVE EXTRA $40', sublabel: 'FASTER GOAL · LESS CASH NOW', saveTransfer: 40, comfort: 0, time: 0, x: -2.7, lesson: 'Saving extra now can shorten the wait for a future goal.' },
      { id: 'goal-20', label: 'SAVE EXTRA $20', sublabel: 'STEADY PROGRESS', saveTransfer: 20, comfort: 1, time: 0, x: 0, lesson: 'Smaller repeated deposits still build a goal over time.' },
      { id: 'goal-wait', label: 'WAIT THIS WEEK', sublabel: '$0 EXTRA · MORE CASH NOW', cost: 0, comfort: 2, time: 0, x: 2.7, lesson: 'Keeping cash gives flexibility now, but the goal grows more slowly.' },
    ],
  },
  {
    week: 4,
    title: 'JOB CHANGE',
    intro: 'A few new jobs open up. Higher pay can help the budget, but work hours can also change your free time. Choose what fits your priorities.',
    career: true,
    lifeTitle: 'AFTER-WORK CHOICE',
    choices: [
      { id: 'rest', label: 'REST NIGHT', sublabel: '$0 COST · +2 FREE TIME', cost: 0, comfort: 2, time: 2, x: -2.7, lesson: 'Money is not the only resource. Time and energy matter too.' },
      { id: 'extra-shift', label: 'EXTRA SHIFT', sublabel: '+$35 CASH · -2 FREE TIME', cashDelta: 35, comfort: -1, time: -2, x: 0, lesson: 'Extra work can raise income, but it trades away time and energy.' },
      { id: 'skill-class', label: 'SKILL CLASS', sublabel: '$20 COST · FUTURE PAY +$25', cost: 20, grossBonus: 25, comfort: 0, time: -1, x: 2.7, lesson: 'Training can cost money and time now in exchange for higher future earning power.' },
    ],
  },
  {
    week: 5,
    title: 'SURPRISE WEEK',
    intro: 'A $65 repair shows up. Your earlier saving choices now matter. Choose how to handle the surprise without pretending it disappears.',
    lifeTitle: 'SURPRISE REPAIR · $65',
    choices: [
      { id: 'full-repair', label: 'PAY FULL REPAIR', sublabel: '$65 · USE CASH THEN SAVINGS', cost: 65, comfort: 1, time: 0, x: -2.7, lesson: 'A cash cushion or emergency savings can absorb a surprise without new debt.' },
      { id: 'basic-repair', label: 'BASIC REPAIR', sublabel: '$40 · CHEAPER BUT LESS COMFORT', cost: 40, comfort: -1, time: -1, x: 0, lesson: 'A cheaper solution can protect cash, but tradeoffs may show up elsewhere.' },
      { id: 'borrow-repair', label: 'BORROW $70', sublabel: 'FIX IT NOW · OWE $70 LATER', debtDelta: 70, cashDelta: 5, comfort: 1, time: 0, x: 2.7, lesson: 'Borrowing solves today’s cash problem by creating a future repayment obligation.' },
    ],
  },
  {
    week: 6,
    title: 'ONE MONTH LATER',
    intro: 'Make one final paycheck and budget. Then choose how to use your weekend and look back at the life your repeated decisions created.',
    lifeTitle: 'WEEKEND CHOICE',
    choices: [
      { id: 'free-day', label: 'FREE DAY OUT', sublabel: '$0 COST · +2 COMFORT', cost: 0, comfort: 2, time: 2, x: -2.7, lesson: 'Enjoyment does not always require spending more money.' },
      { id: 'outing', label: 'PAID OUTING', sublabel: '$25 COST · +3 COMFORT', cost: 25, comfort: 3, time: 1, x: 0, lesson: 'A planned want can fit a budget when essentials and future goals are already considered.' },
      { id: 'shopping', label: 'BIG SHOPPING DAY', sublabel: '$50 COST · +3 COMFORT', cost: 50, comfort: 3, time: 0, x: 2.7, lesson: 'A larger want can feel good now, but it reduces the money available for the next goal or surprise.' },
    ],
  },
]

export function paycheckMath(job, grossBonus = 0) {
  if (!job) return { gross: 0, tax: 0, takeHome: 0 }
  const gross = Math.max(0, Math.round(job.gross + grossBonus))
  const tax = Math.round(gross * job.rate)
  return { gross, tax, takeHome: gross - tax }
}

export function budgetAmounts(takeHome, plan) {
  if (!plan) return { needs: 0, wants: 0, save: 0 }
  const needs = Math.round(takeHome * plan.needs)
  const wants = Math.round(takeHome * plan.wants)
  const save = Math.max(0, takeHome - needs - wants)
  return { needs, wants, save }
}

const clamp = (value) => Math.max(0, Math.min(10, value))

export function applyLifeChoice(state, choice) {
  const next = {
    cash: Math.max(0, Number(state.cash || 0)),
    savings: Math.max(0, Number(state.savings || 0)),
    debt: Math.max(0, Number(state.debt || 0)),
    comfort: clamp(Number(state.comfort ?? 5)),
    freeTime: clamp(Number(state.freeTime ?? 5)),
    grossBonus: Math.max(0, Number(state.grossBonus || 0)),
  }

  next.cash += Number(choice.cashDelta || 0)
  next.debt += Number(choice.debtDelta || 0)
  next.grossBonus += Number(choice.grossBonus || 0)

  const transfer = Math.min(next.cash, Math.max(0, Number(choice.saveTransfer || 0)))
  next.cash -= transfer
  next.savings += transfer

  let cost = Math.max(0, Number(choice.cost || 0))
  const fromCash = Math.min(next.cash, cost)
  next.cash -= fromCash
  cost -= fromCash
  const fromSavings = Math.min(next.savings, cost)
  next.savings -= fromSavings
  cost -= fromSavings
  if (cost > 0) next.debt += cost

  next.comfort = clamp(next.comfort + Number(choice.comfort || 0))
  next.freeTime = clamp(next.freeTime + Number(choice.time || 0))
  return next
}

export function lifeSummary({ savings = 0, debt = 0, comfort = 5, freeTime = 5 }) {
  if (debt >= 70) return 'DEBT IS PRESSURING FUTURE PAY'
  if (savings >= 180 && comfort >= 6 && freeTime >= 4) return 'PREPARED AND BALANCED'
  if (savings >= 180) return 'STRONG CUSHION · TIGHTER LIFESTYLE'
  if (comfort >= 8 && savings < 80) return 'COMFORTABLE NOW · SMALLER CUSHION'
  if (freeTime <= 2) return 'MORE INCOME · VERY LITTLE FREE TIME'
  return 'BUILDING STABILITY WEEK BY WEEK'
}
