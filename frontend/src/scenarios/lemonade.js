// Week 2 - THE LEMONADE STAND v5: guided pricing and persistent coaching.
// The player should never have to guess what to change next. Every result names
// one specific lever, why it mattered, and the exact next action.

export const TAX_RATE = 0.1 // Town Tax: 10% of profit, never revenue
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
  { id: 'none', label: 'No sign', cost: 0, traffic: 1, guide: 'Costs $0, but does not bring extra customers.' },
  { id: 'small', label: 'Small sign', cost: 1, traffic: 1.2, guide: 'Costs $1 and brings a few more customers.' },
  { id: 'big', label: 'Big bright sign', cost: 3, traffic: 1.45, guide: 'Costs $3 and brings the most attention. Use it only when extra traffic can repay the cost.' },
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
  quality: 'NEW CHOICE: recipe. Extra Lemony costs more but may support a higher price. Less Sugar costs a little less. Read the recipe cost before changing your price.',
  sign: 'NEW CHOICE: sign. A sign can bring more customers, but it also costs money. Compare the sign cost with how many extra cups you can actually sell.',
  events: 'NEW CHOICE: town news. Read the news before changing anything. Weather and crowds affect how many customers may arrive.',
}

const r2 = (n) => Math.round(n * 100) / 100
const TRAFFIC_K = 9

function qualityAppeal(quality, event) {
  if (quality.id === 'lemony') return 1.25
  if (quality.id === 'lesssugar') return event.id === 'normal' ? 1.08 : 1
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

// Used by the stand screen as a persistent instruction box.
export function firstPriceGuide(bundle, hours = DEFAULT_HOURS, wageRate = DEFAULT_WAGE_RATE) {
  if (!bundle) return 'STEP 1: Choose supplies. Then this box will calculate a starting price for you.'
  const work = r2(hours * wageRate)
  const total = r2(bundle.cost + work)
  const perCup = r2(total / bundle.cups)
  const suggested = r2(perCup * 1.1)
  return `FIRST PRICE GUIDE: Supplies $${bundle.cost.toFixed(2)} + your work $${work.toFixed(2)} = $${total.toFixed(2)} total cost. Divide by ${bundle.cups} cups = $${perCup.toFixed(2)} per cup. Add a little profit. Start near $${suggested.toFixed(2)}.`
}

// Used by the stand screen after each round. It stays visible while the next
// price, hours, recipe, sign, and supply choices are being adjusted.
export function persistentPlanGuide(tip, round = 1) {
  if (!tip) return round === 1
    ? 'YOUR PLAN: Choose supplies, use the price guide, choose hours, and review every cost before starting the week.'
    : 'YOUR PLAN: Read Penny’s last feedback before changing anything. Change the named choice first, then keep the other choices steady so you can see what worked.'
  return `PENNY’S PLAN FOR THIS WEEK: ${tip} Change this first. Keep the other settings the same unless the town news gives you a reason to adjust them.`
}

export function nextTip(sim, levers, event, features, history = []) {
  const ideal = solveIdeal(features, event)
  if (sim.keep >= ideal.sim.keep - PERFECT_EPSILON) {
    return { lever: 'perfect', perfect: true, text: 'Your setup worked. Keep this price, supply size, and hours steady next week. Only adjust if the town news changes.' }
  }
  const gaps = []
  if (sim.missed >= 3) gaps.push({ lever: 'supplyMore', gap: sim.missed, text: () => `You sold out and turned away ${sim.missed} customers. NEXT ACTION: buy ${bundleUp(levers.bundle).label} supplies. Keep your price and hours the same so you can test the larger supply amount.` })
  if (sim.leftover >= 4) gaps.push({ lever: 'supplyLess', gap: sim.leftover * 0.9, text: () => `You had ${sim.leftover} cups left. NEXT ACTION: choose ${ideal.bundle.label} supplies. Keep your price and hours the same so less money is trapped in leftovers.` })
  if (levers.price > ideal.price + 0.2) gaps.push({ lever: 'priceHigh', gap: (levers.price - ideal.price) * 12, text: () => `Your price was too high for this week. NEXT ACTION: set the price near ${priceRange(ideal)}. Keep the supply size and hours the same while you test the lower price.` })
  if (levers.price < ideal.price - 0.2) gaps.push({ lever: 'priceLow', gap: (ideal.price - levers.price) * 12, text: () => `Your cups sold, but the price left profit behind. NEXT ACTION: raise the price near ${priceRange(ideal)}. Keep supplies and hours the same while you test it.` })
  if (levers.hours < ideal.hours) gaps.push({ lever: 'hoursMore', gap: (ideal.hours - levers.hours) * 3, text: () => `You closed before enough customers arrived. NEXT ACTION: open for ${ideal.hours} hours. Keep your price and supplies the same while you test the longer day.` })
  if (levers.hours > ideal.hours + 1) gaps.push({ lever: 'hoursLess', gap: (levers.hours - ideal.hours) * 2.5, text: () => `The extra hours did not repay the extra work cost. NEXT ACTION: open for ${ideal.hours} hours. Keep your price and supplies the same.` })
  if (features >= 1 && levers.quality.id !== ideal.quality.id) gaps.push({ lever: 'quality', gap: 2, text: () => `The recipe cost did not match this week’s customers. NEXT ACTION: choose ${ideal.quality.label}. Recheck the price guide because changing the recipe changes your cost.` })
  if (features >= 2 && levers.sign.id !== ideal.sign.id) gaps.push({ lever: 'sign', gap: 2, text: () => ideal.sign.id === 'none'
    ? 'The sign cost more than the extra traffic returned. NEXT ACTION: choose No sign and keep your other settings steady.'
    : `More customers were available than your current sign reached. NEXT ACTION: choose ${ideal.sign.label} and keep your price, supplies, and hours steady.` })
  gaps.sort((a, b) => b.gap - a.gap)
  if (gaps.length === 0) {
    return { lever: 'perfect', perfect: true, text: 'Your setup worked. Keep this plan steady next week unless the town news changes.' }
  }
  const last = history[history.length - 1]
  let pick = gaps[0]
  if (last && pick.lever === last.lever && gaps[1]) pick = gaps[1]
  return { lever: pick.lever, perfect: false, text: pick.text() }
}

export const INTRO_LINE = (money) =>
  `Welcome to your Lemonade Stand! You have $${money} to start. Your goal is to keep $${PROFIT_GOAL} in profit. Each week: choose supplies, calculate a starting price, choose hours, and read Penny’s feedback before changing the next plan.`

export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what remains after supplies and your work are paid.'

export const PRICE_FORMULA_CARDS = [
  'FIRST PRICE, STEP 1: Add every cost. Example: $6 of supplies plus $4 for your work equals $10 total cost.',
  'FIRST PRICE, STEP 2: Divide $10 by 10 cups. Each cup costs $1 before profit. Add a little profit, such as $0.10, for a starting price of $1.10. This is a reasoned starting point, not a lottery. After the week, use Penny’s feedback to adjust one choice at a time.',
]

export const CASHOUT_LINE = (cum) =>
  `You reached the $${PROFIT_GOAL} goal and kept $${cum}! Your stand money is ready for Budget Town.`

export const BANKRUPTCY_LINE = 'Your stand ran out of money. The week will reset. Read Penny’s plan, change the named choice, and try again without changing everything at once.'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Choosing work meant giving up swim time, but the stand could earn money.',
  pool: 'You chose the pool, so the stand stayed closed and earned $0. Choices have tradeoffs. Try the work choice to continue the business.',
}

export const SAVE_DIALOG_START = 'You saved money for a future goal, and now it can fund your lemonade stand.'
export const SAVE_DIALOG_END = 'Money left after spending becomes savings. Savings can fund the next goal.'
