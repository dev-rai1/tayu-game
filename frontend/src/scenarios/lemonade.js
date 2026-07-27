// Week 2 - THE LEMONADE STAND v5 (guided pricing and persistent coaching).
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
  { id: 'small', label: 'Small', cost: 4, cups: 6, ingredients: CORE_SUPPLIES },
  { id: 'medium', label: 'Medium', cost: 6, cups: 10, ingredients: CORE_SUPPLIES },
  { id: 'large', label: 'Large', cost: 9, cups: 18, ingredients: CORE_SUPPLIES },
  { id: 'mega', label: 'Mega', cost: 12, cups: 26, ingredients: CORE_SUPPLIES },
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
  quality: 'NEW CHOICE: recipe quality. Extra Lemony costs more per cup but can support a stronger price. Less Sugar is cheaper and healthier. Read the cost before choosing.',
  sign: 'NEW CHOICE: a sign. A sign costs money but may bring more customers. Compare the sign cost with this week’s expected crowd before choosing.',
  events: 'NEW CHOICE: Town News. Read the news before setting your plan. Weather and crowds can change which price, sign, and supply amount work best.',
}

const r2 = (n) => Math.round(n * 100) / 100
const TRAFFIC_K = 9

function qualityAppeal(quality, event) {
  if (quality.id === 'lemony') return 1.25
  if (quality.id === 'lesssugar') return event.id === 'normal' ? 1.08 : 1.0
  return 1
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
      text: `Your plan worked. Keep this as your starting point next week: ${levers.bundle.label} supplies, about ${priceRange(ideal)}, ${ideal.hours} hours${features >= 2 ? `, and ${ideal.sign.label}` : ''}. Read the Town News before changing it.`,
    }
  }

  const gaps = []
  if (sim.missed >= 3) gaps.push({
    lever: 'supplyMore', gap: sim.missed,
    text: () => `You sold out and turned away ${sim.missed} customers. NEXT MOVE: choose ${bundleUp(levers.bundle).label} supplies. Keep the other choices the same first so you can see what this one change does.`,
  })
  if (sim.leftover >= 4) gaps.push({
    lever: 'supplyLess', gap: sim.leftover * 0.9,
    text: () => `You had ${sim.leftover} cups left. NEXT MOVE: choose ${ideal.bundle.label} supplies. Keep your price and hours the same first so you can test the supply change.`,
  })
  if (levers.price > ideal.price + 0.2) gaps.push({
    lever: 'priceHigh', gap: (levers.price - ideal.price) * 12,
    text: () => `Your price was too high for this week’s customers. NEXT MOVE: set the price near ${priceRange(ideal)}. Do not guess—use the cost-per-cup formula, then make this small adjustment.`,
  })
  if (levers.price < ideal.price - 0.2) gaps.push({
    lever: 'priceLow', gap: (ideal.price - levers.price) * 12,
    text: () => `Customers bought at your price, but you charged too little to reach the goal efficiently. NEXT MOVE: set the price near ${priceRange(ideal)} while keeping the other choices the same.`,
  })
  if (levers.hours < ideal.hours) gaps.push({
    lever: 'hoursMore', gap: (ideal.hours - levers.hours) * 3,
    text: () => `You opened for ${levers.hours} hours, so not enough customers reached the stand. NEXT MOVE: open for ${ideal.hours} hours. Remember that extra hours also increase your pay cost.`,
  })
  if (levers.hours > ideal.hours + 1) gaps.push({
    lever: 'hoursLess', gap: (levers.hours - ideal.hours) * 2.5,
    text: () => `The last hours were quiet, but you still paid yourself for them. NEXT MOVE: open for ${ideal.hours} hours instead of ${levers.hours}.`,
  })
  if (features >= 1 && levers.quality.id !== ideal.quality.id) gaps.push({
    lever: 'quality', gap: 2,
    text: () => `The recipe changed your cost per cup. NEXT MOVE: choose ${ideal.quality.label}, then recalculate the price using the new total cost.`,
  })
  if (features >= 2 && levers.sign.id !== ideal.sign.id) gaps.push({
    lever: 'sign', gap: 2,
    text: () => ideal.sign.id === 'none'
      ? 'The sign cost more than the extra customers brought in. NEXT MOVE: choose No sign this week.'
      : `More customers were available than your stand attracted. NEXT MOVE: choose ${ideal.sign.label}; it should bring in more than it costs this week.`,
  })

  gaps.sort((a, b) => b.gap - a.gap)
  if (gaps.length === 0) {
    return { lever: 'perfect', perfect: true, text: 'Your setup is strong. Keep it as your starting plan and read the Town News before changing anything.' }
  }
  const last = history[history.length - 1]
  let pick = gaps[0]
  if (last && pick.lever === last.lever && gaps[1]) pick = gaps[1]
  return { lever: pick.lever, perfect: false, text: pick.text() }
}

export const INTRO_LINE = (money) =>
  `Welcome to your Lemonade Stand! You have $${money} to start. Your goal is to keep $${PROFIT_GOAL} in profit. Each week you will buy supplies, calculate a starting price, choose your hours, and test one plan. Penny’s latest suggestion should stay on your screen while you make the next plan.`

export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what remains after supplies and your pay. The order is Revenue, Supplies, Your Pay, Profit, Tax, and You Keep.'

export const PRICE_FORMULA_CARDS = [
  'STEP 1 — FIND TOTAL COST. Add supplies and your work. Example: $6 supplies + $4 for four hours of work = $10 total cost.',
  'STEP 2 — FIND COST PER CUP. If the bundle makes 10 cups, divide $10 by 10. Each cup costs $1 before profit.',
  'STEP 3 — SET THE FIRST PRICE. Add a small profit, such as $0.10, to the $1 cost per cup. Start at $1.10. After the sales result, follow Penny’s exact suggestion and adjust only one choice at a time.',
]

export const CASHOUT_LINE = (cum) =>
  `You reached the $${PROFIT_GOAL} goal and kept $${cum}! Your stand money now transfers automatically into the next budgeting lesson. Continue to BUDGET TOWN.`

export const BANKRUPTCY_LINE = 'Your stand cannot afford the next required choice. This week is resetting. Read Penny’s suggestion, lower the risky cost, and try one specific change instead of guessing.'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Choosing work gave up pool time, but it allowed the stand to earn money.',
  pool: 'You chose the pool, so the stand stayed closed and earned $0. Choices have tradeoffs. Return to the stand and start the selling day when your plan is ready.',
}

export const SAVE_DIALOG_START = 'You saved money for a future goal, and now that savings can fund the stand. This is why saving before a big purchase matters.'
export const SAVE_DIALOG_END = 'Money left after your choices remains in savings and can fund the next week. Read the guidance, change one part of the plan, and test again.'