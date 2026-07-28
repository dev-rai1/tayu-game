// Week 2 - THE LEMONADE STAND v7.
// The game calculates outcomes normally, but player-facing tips stay short and directional.

export const TAX_RATE = 0.1 // the Town Tax - 10% OF PROFIT
export const PROFIT_GOAL = 40 // cumulative kept profit after tax
export const HOURS_OPTIONS = [2, 3, 4, 5, 6]
export const DEFAULT_HOURS = 4
export const WAGE_RATES = [0.5, 1, 1.5]
export const DEFAULT_WAGE_RATE = 1

export const PRICE_MIN = 0.25
export const PRICE_MAX = 3
export const PRICE_STEP = 0.05
export const PRICE_STEP_BIG = 0.25

const CORE_SUPPLIES = ['cups', 'lemons', 'sugar', 'water', 'table']
export const BUNDLES = [
  { id: 'small', label: 'Test Batch', cost: 4, cups: 6, demandFit: 'Low demand', ingredients: CORE_SUPPLIES },
  { id: 'medium', label: 'Neighborhood Batch', cost: 6, cups: 10, demandFit: 'Normal demand', ingredients: CORE_SUPPLIES },
  { id: 'large', label: 'Busy Day Batch', cost: 9, cups: 18, demandFit: 'High demand', ingredients: CORE_SUPPLIES },
  { id: 'mega', label: 'Festival Batch', cost: 12, cups: 26, demandFit: 'Very high demand', ingredients: CORE_SUPPLIES },
]

export const QUALITY = [
  { id: 'basic', label: 'Basic', addPerCup: 0 },
  { id: 'lemony', label: 'Extra Lemony', addPerCup: 0.25 },
  { id: 'lesssugar', label: 'Less Sugar', addPerCup: -0.05 },
]

export const SIGNS = [
  { id: 'none', label: 'No sign', cost: 0, traffic: 1 },
  { id: 'small', label: 'Small sign', cost: 1, traffic: 1.2 },
  { id: 'big', label: 'Big bright sign', cost: 3, traffic: 1.45 },
]

export const EVENTS = [
  { id: 'normal', line: 'A regular sunny day in town this week.', traffic: 1, appeal: 0, signBoost: 1 },
  { id: 'hot', line: 'HEAT WAVE this week! Everyone is extra thirsty.', traffic: 1.15, appeal: 0.5, signBoost: 1 },
  { id: 'rain', line: 'Rain is coming this week. Fewer kids pass by, so getting noticed matters extra.', traffic: 0.55, appeal: 0, signBoost: 1.3 },
  { id: 'fair', line: 'The town fair is this week! Big crowds on every street.', traffic: 1.5, appeal: 0, signBoost: 1 },
  { id: 'thrifty', line: 'Allowance day is late this week. Kids are watching every penny.', traffic: 1, appeal: -0.35, signBoost: 1 },
]

const EVENT_CYCLE = EVENTS.filter((event) => event.id !== 'normal')

export function nextEventFor(lastId) {
  if (!lastId || lastId === 'normal') return EVENT_CYCLE[0]
  const index = EVENT_CYCLE.findIndex((event) => event.id === lastId)
  return EVENT_CYCLE[(index + 1 + EVENT_CYCLE.length) % EVENT_CYCLE.length]
}

export function rollEvent(unlocked, lastId) {
  if (!unlocked) return EVENTS[0]
  return nextEventFor(lastId)
}

export const FEATURE_QUEUE = ['quality', 'sign', 'events']
export const FEATURE_CARDS = {
  quality: 'NEW CHOICE: recipe quality. A stronger recipe can attract buyers, but it may cost more. Test one option and compare the result.',
  sign: 'NEW CHOICE: promotion sign. A sign costs money but may bring more customers. Decide whether the extra traffic is worth the cost.',
  events: 'NEW CHOICE: Town News. Weather and crowds change demand. Read the news before choosing your batch, hours, and price.',
}

const r2 = (n) => Math.round(n * 100) / 100
const TRAFFIC_K = 9
const money = (n) => `$${r2(n).toFixed(2)}`

function qualityAppeal(quality, event) {
  if (quality.id === 'lemony') return 1.25
  if (quality.id === 'lesssugar') return event.id === 'normal' ? 1.08 : 1.0
  return 1
}

export function estimateDemandSignal(hours = DEFAULT_HOURS, event = EVENTS[0], sign = SIGNS[0]) {
  const safeEvent = event || EVENTS[0]
  const safeSign = sign || SIGNS[0]
  const signTraffic = safeSign.traffic * (safeSign.id !== 'none' ? safeEvent.signBoost : 1)
  const potential = Math.max(1, Math.round(TRAFFIC_K * Math.pow(hours, 0.85) * safeEvent.traffic * signTraffic))
  const label = potential >= 45 ? 'Very high' : potential >= 34 ? 'High' : potential <= 18 ? 'Low' : 'Normal'
  return { potential, label }
}

export function recommendedStarterPrice({
  bundle,
  hours = DEFAULT_HOURS,
  quality = QUALITY[0],
  sign = SIGNS[0],
  wageRate = DEFAULT_WAGE_RATE,
  event = EVENTS[0],
}) {
  if (!bundle) return 1
  const totalCost = bundle.cost + quality.addPerCup * bundle.cups + sign.cost + wageRate * hours
  const costPerCup = totalCost / Math.max(1, bundle.cups)
  const signal = estimateDemandSignal(hours, event, sign)
  const demandMargin = signal.label === 'Very high' ? 0.25 : signal.label === 'High' ? 0.18 : signal.label === 'Low' ? 0.06 : 0.12
  const stepped = Math.round((costPerCup + demandMargin) / PRICE_STEP) * PRICE_STEP
  return r2(Math.max(PRICE_MIN, Math.min(PRICE_MAX, stepped)))
}

export function simulateSales(levers, event) {
  const { price, hours, bundle, quality, sign, wageRate } = levers
  const signT = sign.traffic * (sign.id !== 'none' ? event.signBoost : 1)
  const traffic = TRAFFIC_K * Math.pow(hours, 0.85) * event.traffic * signT
  const tol = qualityAppeal(quality, event) + event.appeal * 0.7
  const f = Math.max(0.03, Math.min(1, 1.25 - 0.48 * (price / tol)))
  const buyers = Math.round(traffic * f)
  const sold = Math.min(bundle.cups, buyers)
  const revenue = r2(sold * price)
  const supplies = r2(bundle.cost + quality.addPerCup * bundle.cups + sign.cost)
  const wages = r2(wageRate * hours)
  const profit = r2(revenue - supplies - wages)
  const tax = profit > 0 ? r2(profit * TAX_RATE) : 0
  const keep = r2(profit - tax)
  return {
    sold, revenue, supplies, wages, profit, tax, keep, hours,
    fraction: f, traffic: Math.round(traffic),
    missed: Math.max(0, buyers - bundle.cups),
    leftover: bundle.cups - sold,
    soldOut: sold === bundle.cups,
  }
}

function choicePool(features) {
  return {
    qualities: features >= 1 ? QUALITY : [QUALITY[0]],
    signs: features >= 2 ? SIGNS : [SIGNS[0]],
  }
}

// Keep the ideal-plan calculation for scoring and unlock logic. The UI no longer
// gives this full combination to the player.
export function findProfitablePlan(features, event = EVENTS[0], budget = Infinity, locks = {}) {
  const { qualities, signs } = choicePool(features)
  let best = null
  for (const bundle of BUNDLES) {
    if (locks.bundleId && bundle.id !== locks.bundleId) continue
    for (const hours of HOURS_OPTIONS) {
      if (locks.hours && hours !== locks.hours) continue
      for (const quality of qualities) {
        if (locks.qualityId && quality.id !== locks.qualityId) continue
        for (const sign of signs) {
          if (locks.signId && sign.id !== locks.signId) continue
          const upfront = r2(bundle.cost + quality.addPerCup * bundle.cups + sign.cost)
          if (upfront > budget + 0.001) continue
          for (let raw = PRICE_MIN; raw <= PRICE_MAX + 0.001; raw += PRICE_STEP) {
            const price = r2(raw)
            const sim = simulateSales({ price, hours, bundle, quality, sign, wageRate: DEFAULT_WAGE_RATE }, event)
            if (!best || sim.keep > best.sim.keep) {
              best = { price, hours, bundle, quality, sign, wageRate: DEFAULT_WAGE_RATE, upfront, sim }
            }
          }
        }
      }
    }
  }
  return best || {
    price: PRICE_MIN,
    hours: DEFAULT_HOURS,
    bundle: BUNDLES[0],
    quality: QUALITY[0],
    sign: SIGNS[0],
    wageRate: DEFAULT_WAGE_RATE,
    upfront: BUNDLES[0].cost,
    sim: simulateSales({
      price: PRICE_MIN,
      hours: DEFAULT_HOURS,
      bundle: BUNDLES[0],
      quality: QUALITY[0],
      sign: SIGNS[0],
      wageRate: DEFAULT_WAGE_RATE,
    }, event),
  }
}

export function solveIdeal(features, event) {
  return findProfitablePlan(features, event, Infinity)
}

function exactPlanLine(plan) {
  return `Set the price to ${money(plan.price)}. Use ${plan.bundle.label}, open for ${plan.hours} hours, choose ${plan.quality.label}, and use ${plan.sign.label}.`
}

export function analyzeLemonadeResult(sim, levers, event, features, nextBudget = null) {
  const inferredBudget = Math.max(BUNDLES[0].cost, r2(sim.revenue - sim.tax))
  const available = Number.isFinite(nextBudget) ? Math.max(BUNDLES[0].cost, nextBudget) : inferredBudget
  const plan = findProfitablePlan(features, event, available)
  const actualCost = r2(sim.supplies + sim.wages)
  const priceGap = r2(levers.price - plan.price)
  let lever = 'plan'
  let diagnosis

  if (sim.keep < 0) {
    diagnosis = `You lost ${money(Math.abs(sim.keep))} because costs were higher than revenue.`
  } else if (sim.keep === 0) {
    diagnosis = 'You broke even, so revenue and costs matched.'
  } else {
    diagnosis = `You kept ${money(sim.keep)} after selling ${sim.sold} cups.`
  }

  let priceAction
  if (priceGap > 0.05) {
    lever = 'priceHigh'
    priceAction = 'Lower the price a little so more customers may buy.'
  } else if (priceGap < -0.05) {
    lever = 'priceLow'
    priceAction = 'Raise the price a little so each sale leaves more money after costs.'
  } else {
    priceAction = 'Keep the price close and test one other small change.'
  }

  const supplyNote = sim.missed >= 2
    ? `${sim.missed} customers could not buy because you ran out.`
    : sim.leftover >= 2
      ? `${sim.leftover} cups were left over.`
      : 'Your supply was close to demand.'

  const secondary = sim.missed >= 2
    ? 'Try a larger batch or stay open longer.'
    : sim.leftover >= 2
      ? 'Try a smaller batch or fewer hours.'
      : levers.quality.id !== plan.quality.id || levers.sign.id !== plan.sign.id
        ? 'Try one recipe or sign change at a time.'
        : 'Change only one choice so the result is easy to understand.'

  const perfect = sim.keep >= plan.sim.keep - 1.5
    && Math.abs(priceGap) <= 0.05
    && levers.bundle.id === plan.bundle.id
    && levers.hours === plan.hours
    && levers.quality.id === plan.quality.id
    && levers.sign.id === plan.sign.id

  const action = perfect
    ? 'This setup worked well. Keep it or test one small change.'
    : `${priceAction} ${secondary}`
  const goal = 'Cover your costs, avoid many leftovers, and keep a positive profit.'

  return {
    lever: perfect ? 'perfect' : lever,
    perfect,
    title: perfect ? 'Good plan' : 'Adjust one thing next round',
    diagnosis: `${diagnosis} ${supplyNote}`,
    action,
    goal,
    plan,
    expectedKeep: plan.sim.keep,
    targetEvent: event,
    text: `${diagnosis} ${supplyNote} TRY THIS: ${action}`,
    exactPlan: exactPlanLine(plan),
  }
}

export function nextTip(sim, levers, event, features, history = []) {
  void history
  const currentEvent = event || EVENTS[0]
  const currentAnalysis = analyzeLemonadeResult(sim, levers, currentEvent, features)
  const unlockNext = features < FEATURE_QUEUE.length && (features > 0 || currentAnalysis.perfect)
  const nextFeatures = unlockNext ? features + 1 : features
  const targetEvent = nextFeatures >= 3 ? nextEventFor(currentEvent.id) : currentEvent
  const analysis = analyzeLemonadeResult(sim, levers, targetEvent, nextFeatures)

  const notices = []
  if (nextFeatures > features) notices.push(`NEW CHOICE: ${FEATURE_QUEUE[features].toUpperCase()}.`)
  if (targetEvent.id !== currentEvent.id) notices.push(`NEXT WEEK: ${targetEvent.line}`)
  const notice = notices.join(' ')

  return {
    ...analysis,
    perfect: currentAnalysis.perfect || features > 0,
    currentPerfect: currentAnalysis.perfect,
    nextFeatures,
    diagnosis: notice ? `${analysis.diagnosis} ${notice}` : analysis.diagnosis,
    text: notice
      ? `${analysis.diagnosis} ${notice} TRY THIS: ${analysis.action}`
      : analysis.text,
  }
}

export const INTRO_LINE = (moneyAvailable) =>
  `Welcome to your Lemonade Stand! You have $${moneyAvailable} to start, and your goal is to keep $${PROFIT_GOAL} in profit. Read the demand clue, choose a batch, and set a price that covers costs. After each round, Penny will give one short hint, but you make the final choices.`

export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what remains after supplies and your pay. The order is Revenue, Supplies, Your Pay, Profit, Tax, and You Keep.'

export const PRICE_FORMULA_CARDS = [
  'STEP 1 — ADD COSTS. Include supplies and your pay.',
  'STEP 2 — FIND COST PER CUP. Divide total cost by the number of cups in your batch.',
  'STEP 3 — CHOOSE A PRICE. Set it above cost per cup, but keep it affordable for customers.',
  'STEP 4 — TEST AND ADJUST. Match your batch to demand and change only one or two choices each round.',
]

export const CASHOUT_LINE = (cum) =>
  `You reached the $${PROFIT_GOAL} goal and kept $${cum}! Your stand money now transfers automatically into the next budgeting lesson. Continue to BUDGET TOWN.`

export const BANKRUPTCY_LINE = 'Your stand ran out of money, so this week is resetting. Start with a smaller batch, watch your costs, and use the demand clue before selling again.'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Choosing work gave up pool time, but it allowed the stand to earn money.',
  pool: 'You chose the pool, so the stand stayed closed and earned $0. Choices have tradeoffs. Return to the stand when you are ready to sell.',
}

export const SAVE_DIALOG_START = 'You saved money for a future goal, and now that savings can fund the stand. This is why saving before a big purchase matters.'
export const SAVE_DIALOG_END = 'Money left after your choices remains in savings and can fund the next week. Use the result from each round to make one small adjustment.'
