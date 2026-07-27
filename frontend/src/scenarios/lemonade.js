// Week 2 - THE LEMONADE STAND v6 (supply, demand, and guided price tests).
// The player is taught how to calculate a first price, then receives one clear
// adjustment for every later round. Decisions are based on costs, customers,
// hours, quality, signs, and town events rather than guessing.

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

export function rollEvent(unlocked, lastId) {
  if (!unlocked) return EVENTS[0]
  const pool = EVENTS.filter((e) => e.id !== lastId && e.id !== 'normal')
  return pool[(Math.random() * pool.length) | 0]
}

export const FEATURE_QUEUE = ['quality', 'sign', 'events']
export const FEATURE_CARDS = {
  quality: 'NEW TEST: recipe quality. Extra Lemony costs more per cup but may support a stronger price. Less Sugar is cheaper and healthier. Change only the recipe first, then compare demand.',
  sign: 'NEW TEST: a sign. A sign costs money but may increase demand by bringing more customers. Compare the sign cost with the extra sales it creates.',
  events: 'NEW TEST: Town News. Weather and crowds change demand. Read the forecast before choosing supply, hours, and price.',
}

const r2 = (n) => Math.round(n * 100) / 100
const TRAFFIC_K = 9

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

export function solveIdeal(features, event) {
  const qs = features >= 1 ? QUALITY : [QUALITY[0]]
  const gs = features >= 2 ? SIGNS : [SIGNS[0]]
  let best = null
  for (const b of BUNDLES) for (const h of HOURS_OPTIONS) for (const q of qs) for (const g of gs) {
    for (let p = PRICE_MIN; p <= PRICE_MAX + 0.001; p += PRICE_STEP) {
      const sim = simulateSales({ price: r2(p), hours: h, bundle: b, quality: q, sign: g, wageRate: DEFAULT_WAGE_RATE }, event)
      if (!best || sim.keep > best.sim.keep) best = { sim, price: r2(p), hours: h, bundle: b, quality: q, sign: g }
    }
  }
  return best
}

const PERFECT_EPSILON = 2
const priceRange = (ideal) => `$${Math.max(PRICE_MIN, ideal.price - 0.15).toFixed(2)}-$${(ideal.price + 0.1).toFixed(2)}`
const bundleUp = (b) => BUNDLES[Math.min(BUNDLES.length - 1, BUNDLES.findIndex((x) => x.id === b.id) + 1)]

export function nextTip(sim, levers, event, features, history = []) {
  const ideal = solveIdeal(features, event)
  if (sim.keep >= ideal.sim.keep - PERFECT_EPSILON) {
    return {
      lever: 'perfect', perfect: true,
      text: `Supply and demand matched well. Keep this as your starting point next week: ${levers.bundle.label}, about ${priceRange(ideal)}, ${ideal.hours} hours${features >= 2 ? `, and ${ideal.sign.label}` : ''}. Read the Town News before changing one thing.`,
    }
  }

  const gaps = []
  if (sim.missed >= 3) gaps.push({
    lever: 'supplyMore', gap: sim.missed,
    text: () => `Demand was higher than supply: you sold out and turned away ${sim.missed} customers. NEXT MOVE: choose ${bundleUp(levers.bundle).label}. Keep price and hours the same first so you can see what the supply change does.`,
  })
  if (sim.leftover >= 4) gaps.push({
    lever: 'supplyLess', gap: sim.leftover * 0.9,
    text: () => `Supply was higher than demand: ${sim.leftover} cups were left. NEXT MOVE: choose ${ideal.bundle.label}. Keep price and hours the same first so you can test the smaller supply.`,
  })
  if (levers.price > ideal.price + 0.2) gaps.push({
    lever: 'priceHigh', gap: (levers.price - ideal.price) * 12,
    text: () => `Your price was too high, so demand dropped and customers walked away. NEXT MOVE: lower the price near ${priceRange(ideal)}. Keep supply and hours the same to test only the price.`,
  })
  if (levers.price < ideal.price - 0.2) gaps.push({
    lever: 'priceLow', gap: (ideal.price - levers.price) * 12,
    text: () => `Demand was strong, but you charged too little to reach the goal efficiently. NEXT MOVE: raise the price near ${priceRange(ideal)} while keeping supply and hours the same.`,
  })
  if (levers.hours < ideal.hours) gaps.push({
    lever: 'hoursMore', gap: (ideal.hours - levers.hours) * 3,
    text: () => `You opened for ${levers.hours} hours, so not enough customers reached the stand. NEXT MOVE: open for ${ideal.hours} hours. Extra hours also increase your pay cost.`,
  })
  if (levers.hours > ideal.hours + 1) gaps.push({
    lever: 'hoursLess', gap: (levers.hours - ideal.hours) * 2.5,
    text: () => `The last hours had very little demand, but you still paid yourself. NEXT MOVE: open for ${ideal.hours} hours instead of ${levers.hours}.`,
  })
  if (features >= 1 && levers.quality.id !== ideal.quality.id) gaps.push({
    lever: 'quality', gap: 2,
    text: () => `The recipe changed your cost and customer demand. NEXT MOVE: choose ${ideal.quality.label}, then recalculate the price using the new total cost.`,
  })
  if (features >= 2 && levers.sign.id !== ideal.sign.id) gaps.push({
    lever: 'sign', gap: 2,
    text: () => ideal.sign.id === 'none'
      ? 'The sign cost more than the extra demand it created. NEXT MOVE: choose No sign this week.'
      : `More demand was available than your stand attracted. NEXT MOVE: choose ${ideal.sign.label}; it should bring in more customers than it costs this week.`,
  })

  gaps.sort((a, b) => b.gap - a.gap)
  if (gaps.length === 0) {
    return { lever: 'perfect', perfect: true, text: 'Your supply, demand, and price setup is strong. Keep it as the starting plan and read the Town News before changing one thing.' }
  }
  const last = history[history.length - 1]
  let pick = gaps[0]
  if (last && pick.lever === last.lever && gaps[1]) pick = gaps[1]
  return { lever: pick.lever, perfect: false, text: pick.text() }
}

export const INTRO_LINE = (money) =>
  `Welcome to your Lemonade Stand! You have $${money} to start. Your goal is to keep $${PROFIT_GOAL} in profit. Each week, compare supply with demand, calculate a starting price, test one plan, and use Penny's saved feedback for the next round.`

export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what remains after supplies and your pay. The order is Revenue, Supplies, Your Pay, Profit, Tax, and You Keep.'

export const PRICE_FORMULA_CARDS = [
  'STEP 1 — FIND TOTAL COST. Add supplies and your work. Example: $6 supplies + $4 for four hours of work = $10 total cost.',
  'STEP 2 — FIND COST PER CUP. If the batch makes 10 cups, divide $10 by 10. Each cup costs $1 before profit.',
  'STEP 3 — CHECK DEMAND. High demand may support a slightly higher price. Low demand may require a lower price or smaller supply.',
  'STEP 4 — TEST ONE CHANGE. Start just above cost per cup. After the sales result, follow Penny’s exact suggestion and change only supply, price, hours, recipe, or sign—not everything at once.',
]

export const CASHOUT_LINE = (cum) =>
  `You reached the $${PROFIT_GOAL} goal and kept $${cum}! Your stand money now transfers automatically into the next budgeting lesson. Continue to BUDGET TOWN.`

export const BANKRUPTCY_LINE = 'Your stand cannot afford the next required choice. This week is resetting. Read Penny’s saved suggestion, lower the risky cost, and test one specific change instead of guessing.'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Choosing work gave up pool time, but it allowed the stand to earn money.',
  pool: 'You chose the pool, so the stand stayed closed and earned $0. Choices have tradeoffs. Return to the stand and start the selling day when your plan is ready.',
}

export const SAVE_DIALOG_START = 'You saved money for a future goal, and now that savings can fund the stand. This is why saving before a big purchase matters.'
export const SAVE_DIALOG_END = 'Money left after your choices remains in savings and can fund the next week. Read the saved guidance, change one part of the plan, and test again.'
