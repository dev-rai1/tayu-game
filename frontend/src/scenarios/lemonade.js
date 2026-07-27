// Week 2 - THE LEMONADE STAND v7 (pinned, specific profit coaching).
// Every round produces a structured diagnosis and an exact profitable next plan.
// Price is always explained first, then supply, hours, recipe, and promotion.

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
  // Keep the stable id for saved games, but replace the oversized "Mega" framing.
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

// Predictable Town News lets Penny calculate the next week's exact plan before
// the player leaves the result screen. rollEvent and nextTip use this same helper.
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
  quality: 'NEW TEST: recipe quality. Extra Lemony costs more per cup but may support a stronger price. Less Sugar is cheaper and healthier. Penny will keep the exact recipe suggestion pinned while you decide.',
  sign: 'NEW TEST: a promotion sign. A sign costs money but may increase demand. Penny will compare the extra sign cost with the extra sales and tell you whether to use it.',
  events: 'NEW TEST: Town News. Weather and crowds change demand. Penny previews the next news and pins the exact price, supply, hours, recipe, and promotion plan before you choose.',
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

// Find the highest-profit plan the player can actually afford. Optional locks let
// the coach respect a batch that has already been purchased.
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
  // A normal game balance always has an affordable plan, but retain a safe
  // deterministic fallback for admin/demo states with unusual money values.
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

// Analyze the player's actual combination and return a pinned, structured repair.
// The recommendation is simulated, affordable from the minimum money created by
// the previous sales result, and projects positive profit whenever the game can.
export function analyzeLemonadeResult(sim, levers, event, features, nextBudget = null) {
  const inferredBudget = Math.max(BUNDLES[0].cost, r2(sim.revenue - sim.tax))
  const available = Number.isFinite(nextBudget) ? Math.max(BUNDLES[0].cost, nextBudget) : inferredBudget
  const plan = findProfitablePlan(features, event, available)
  const actualCost = r2(sim.supplies + sim.wages)
  const priceGap = r2(levers.price - plan.price)
  let lever = 'plan'
  let diagnosis

  if (sim.keep < 0) {
    diagnosis = `You lost ${money(Math.abs(sim.keep))}. You earned ${money(sim.revenue)}, but supplies and your pay cost ${money(actualCost)}.`
  } else if (sim.keep === 0) {
    diagnosis = `You broke even: revenue and costs matched, so you kept ${money(0)}.`
  } else {
    diagnosis = `You kept ${money(sim.keep)} profit after selling ${sim.sold} of ${levers.bundle.cups} cups.`
  }

  let priceAction
  if (priceGap > 0.05) {
    lever = 'priceHigh'
    priceAction = `Lower the price from ${money(levers.price)} to ${money(plan.price)}. The old price reduced demand.`
  } else if (priceGap < -0.05) {
    lever = 'priceLow'
    priceAction = `Raise the price from ${money(levers.price)} to ${money(plan.price)}. The old price did not leave enough money after costs.`
  } else {
    priceAction = `Keep the price near ${money(plan.price)}. The price is already close, so fix the rest of the combination.`
  }

  const supplyNote = sim.missed >= 2
    ? `Demand was higher than your supply, and ${sim.missed} customers could not buy.`
    : sim.leftover >= 2
      ? `Supply was higher than demand, leaving ${sim.leftover} cups unsold.`
      : 'Supply was close to the number of customers who wanted to buy.'

  const extras = []
  if (levers.bundle.id !== plan.bundle.id) extras.push(`batch: ${plan.bundle.label}`)
  if (levers.hours !== plan.hours) extras.push(`hours: ${plan.hours}`)
  if (levers.quality.id !== plan.quality.id) extras.push(`recipe: ${plan.quality.label}`)
  if (levers.sign.id !== plan.sign.id) extras.push(`promotion: ${plan.sign.label}`)
  const secondary = extras.length
    ? `Then change ${extras.join(', ')}.`
    : 'Keep the other choices the same for this test.'

  const action = `${priceAction} ${secondary}`
  const goal = `Projected result: sell ${plan.sim.sold} cups and keep ${money(plan.sim.keep)} profit after tax.`
  const perfect = sim.keep >= plan.sim.keep - 1.5
    && Math.abs(priceGap) <= 0.05
    && levers.bundle.id === plan.bundle.id
    && levers.hours === plan.hours
    && levers.quality.id === plan.quality.id
    && levers.sign.id === plan.sign.id

  return {
    lever: perfect ? 'perfect' : lever,
    perfect,
    title: perfect ? 'Repeat this profitable plan' : 'Fix this combination next round',
    diagnosis: `${diagnosis} ${supplyNote}`,
    action,
    goal,
    plan,
    expectedKeep: plan.sim.keep,
    targetEvent: event,
    text: `${diagnosis} ${supplyNote} NEXT MOVE: ${action} ${goal}`,
    exactPlan: exactPlanLine(plan),
  }
}

// Backward-compatible API used by the existing end-of-round card. When Town
// News is unlocked, this previews the exact same next event that afterRound sets.
export function nextTip(sim, levers, event, features, history = []) {
  void history
  const targetEvent = features >= 3 ? nextEventFor(event?.id) : (event || EVENTS[0])
  const analysis = analyzeLemonadeResult(sim, levers, targetEvent, features)
  if (targetEvent.id !== event?.id) {
    const news = `NEXT WEEK'S TOWN NEWS: ${targetEvent.line}`
    return {
      ...analysis,
      diagnosis: `${analysis.diagnosis} ${news}`,
      text: `${analysis.diagnosis} ${news} NEXT MOVE: ${analysis.action} ${analysis.goal}`,
    }
  }
  return analysis
}

export const INTRO_LINE = (moneyAvailable) =>
  `Welcome to your Lemonade Stand! You have $${moneyAvailable} to start. Your goal is to keep $${PROFIT_GOAL} in profit. The first round is fully guided. After every round, a pinned coach box will show what happened, the exact price change, the other settings to use, and the projected profit. It stays on screen while you make the next plan.`

export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what remains after supplies and your pay. The order is Revenue, Supplies, Your Pay, Profit, Tax, and You Keep.'

export const PRICE_FORMULA_CARDS = [
  'STEP 1 — FIND TOTAL COST. Add supplies and your work. Example: $6 supplies + $4 for four hours of work = $10 total cost.',
  'STEP 2 — FIND COST PER CUP. If the batch makes 10 cups, divide $10 by 10. Each cup costs $1 before profit.',
  'STEP 3 — SET PRICE FIRST. Use the pinned recommendation. If the old price was too high, lower it so more customers buy. If it was too low, raise it so sales cover costs and leave profit.',
  'STEP 4 — MATCH THE COMBINATION. Follow the exact pinned batch, hours, recipe, and promotion. The box remains visible until the next sales result replaces it.',
]

export const CASHOUT_LINE = (cum) =>
  `You reached the $${PROFIT_GOAL} goal and kept $${cum}! Your stand money now transfers automatically into the next budgeting lesson. Continue to BUDGET TOWN.`

export const BANKRUPTCY_LINE = 'Your stand cannot afford the next required choice. This week is resetting. The pinned coach will remain visible. Follow its exact price, batch, hours, recipe, and promotion instead of guessing.'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Choosing work gave up pool time, but it allowed the stand to earn money.',
  pool: 'You chose the pool, so the stand stayed closed and earned $0. Choices have tradeoffs. Return to the stand and follow the pinned plan when you are ready to sell.',
}

export const SAVE_DIALOG_START = 'You saved money for a future goal, and now that savings can fund the stand. This is why saving before a big purchase matters.'
export const SAVE_DIALOG_END = 'Money left after your choices remains in savings and can fund the next week. Follow the pinned guidance and test the exact recommended combination.'
