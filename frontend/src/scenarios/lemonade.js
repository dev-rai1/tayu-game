// Week 2 - THE LEMONADE STAND v4 (Round 5, Parts A + G).
// THE ACCURACY DOCTRINE governs every string and every formula here:
//   A1 - tax is on PROFIT (after supplies AND the player's own wage), never
//        on earnings. Order everywhere: Revenue -> Supplies -> Your pay ->
//        Profit -> Tax -> You keep.
//   A2 - no fake price-demand "law". Customers respond to many things (the
//        weather, town events, how good the lemonade is); the player
//        discovers that through play.
//   A3 - the advisor's price-setting formula is THE teaching moment, shown
//        before the first price decision and re-openable every week.
//   A4 - "economic profit" language is GONE; the time lesson lives in the
//        wage line ("Your pay") and the hours decision.
//   G5 - feedback is DIRECT: one lever, the direction, a concrete number.
//   G6 - scenarios and extra features are gated until the first PERFECT week.
//   G7 - tuned so coached play reaches $30 in ~3-4 weeks; reckless play hits
//        the bankruptcy-rewind (Part F), never a dead end.

export const TAX_RATE = 0.1 // the Town Tax - 10% OF PROFIT (A1)
export const PROFIT_GOAL = 30 // cumulative kept profit (after tax)
export const HOURS_OPTIONS = [2, 3, 4, 5, 6]
export const DEFAULT_HOURS = 4 // 4 hours at $1/h = the formula's "Your work: $4"
export const WAGE_RATES = [0.5, 1, 1.5] // $ per hour you pay yourself (modest by design)
export const DEFAULT_WAGE_RATE = 1

export const PRICE_MIN = 0.25
export const PRICE_MAX = 3
export const PRICE_STEP = 0.05 // fine steps so $1.10 is reachable
export const PRICE_STEP_BIG = 0.25

// Supplies include cups, lemons, sugar, water, AND the table (A3's example).
export const BUNDLES = [
  { id: 'small', label: 'Small', cost: 4, cups: 6 },
  { id: 'medium', label: 'Medium', cost: 6, cups: 10 }, // the formula example
  { id: 'large', label: 'Large', cost: 9, cups: 18 },
  { id: 'mega', label: 'Mega', cost: 12, cups: 26 },
]

// G3: quality choices (unlocked AFTER the first perfect week). Both honest
// tradeoffs - neither is strictly better.
export const QUALITY = [
  { id: 'basic', label: 'Basic', addPerCup: 0 },
  { id: 'lemony', label: 'Extra Lemony', addPerCup: 0.25 }, // costs more, supports a higher price
  { id: 'lesssugar', label: 'Less Sugar', addPerCup: -0.05 }, // healthier AND cheaper to make
]

export const SIGNS = [
  { id: 'none', label: 'No sign', cost: 0, traffic: 1 },
  { id: 'small', label: 'Small sign', cost: 1, traffic: 1.2 },
  { id: 'big', label: 'Big bright sign', cost: 3, traffic: 1.45 },
]

// Weekly town news (A2: the HONEST way customer response varies). Gated until
// the first perfect week (G6) - fundamentals come first.
export const EVENTS = [
  { id: 'normal', line: 'A regular sunny day in town this week.', traffic: 1, appeal: 0, signBoost: 1 },
  { id: 'hot', line: 'HEAT WAVE this week! Everyone is extra thirsty.', traffic: 1.15, appeal: 0.5, signBoost: 1 },
  { id: 'rain', line: 'Rain is coming this week. Fewer kids pass by, so getting noticed matters extra.', traffic: 0.55, appeal: 0, signBoost: 1.3 },
  { id: 'fair', line: 'The town fair is this week! Big crowds on every street.', traffic: 1.5, appeal: 0, signBoost: 1 },
  { id: 'thrifty', line: 'Allowance day is late this week. Kids are watching every penny.', traffic: 1, appeal: -0.35, signBoost: 1 },
]
export function rollEvent(unlocked, lastId) {
  if (!unlocked) return EVENTS[0] // pure fundamentals until the first perfect week
  const pool = EVENTS.filter((e) => e.id !== lastId && e.id !== 'normal')
  return pool[(Math.random() * pool.length) | 0]
}

// G6: after the first perfect week, ONE new thing per week, in this order.
export const FEATURE_QUEUE = ['quality', 'sign', 'events']
export const FEATURE_CARDS = {
  quality: 'Something new this week! Upgrade time: EXTRA LEMONY costs more to make, but kids may pay more for it. Or go LESS SUGAR - healthier AND cheaper to make! Your call.',
  sign: 'Something new this week! A marketing SIGN brings more kids to your stand. Signs cost money - is it worth it? Your call.',
  events: 'Something new this week! TOWN NEWS is live: each week, something happens in town. Check the news before you decide anything!',
}

const r2 = (n) => Math.round(n * 100) / 100
const TRAFFIC_K = 9 // tuned: coached play reaches $30 in ~3-4 weeks (G7)

// Quality appeal: Extra Lemony always helps; Less Sugar adds a small healthy
// bonus on ORDINARY days (G3). No mechanical price "law" is ever taught (A2).
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
  // A1 ORDER: Revenue -> Supplies -> Your pay -> Profit -> Tax -> You keep
  const supplies = r2(bundle.cost + quality.addPerCup * bundle.cups + sign.cost)
  const wages = r2(wageRate * hours)
  const profit = r2(revenue - supplies - wages)
  const tax = profit > 0 ? r2(profit * TAX_RATE) : 0 // tax on PROFIT only, never revenue
  const keep = r2(profit - tax)
  return {
    sold, revenue, supplies, wages, profit, tax, keep, hours,
    fraction: f, traffic: Math.round(traffic),
    missed: Math.max(0, buyers - bundle.cups),
    leftover: bundle.cups - sold,
    soldOut: sold === bundle.cups,
  }
}

// Best plan for this week's unlocked feature set - the source of the DIRECT
// numbers in feedback (G5). Wage held at the fair default.
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

const PERFECT_EPSILON = 2 // within $2 of the optimum = the setup is right

// ---- G5: DIRECT feedback - one lever, the direction, a concrete number ----
// The anti-repetition engine still rotates levers and phrasings, but every
// line tells the player exactly what to change. A5: names behavior, not luck.
const priceRange = (ideal) => `$${Math.max(PRICE_MIN, ideal.price - 0.15).toFixed(2)}-$${(ideal.price + 0.1).toFixed(2)}`
const bundleUp = (b) => BUNDLES[Math.min(BUNDLES.length - 1, BUNDLES.findIndex((x) => x.id === b.id) + 1)]

export function nextTip(sim, levers, event, features, history = []) {
  const ideal = solveIdeal(features, event)
  if (sim.keep >= ideal.sim.keep - PERFECT_EPSILON) {
    return { lever: 'perfect', perfect: true, text: 'PERFECT combination! Supplies match your sales, your price works, your hours pay off. Nothing to fix!' }
  }
  const gaps = []
  if (sim.missed >= 3) gaps.push({ lever: 'supplyMore', gap: sim.missed, text: () => `You sold out and ${sim.missed} kids were turned away. Buy ${bundleUp(levers.bundle).label} supplies next week.` })
  if (sim.leftover >= 4) gaps.push({ lever: 'supplyLess', gap: sim.leftover * 0.9, text: () => `You bought ${levers.bundle.label} supplies but only sold ${sim.sold} cups. Go ${ideal.bundle.label} instead.` })
  if (levers.price > ideal.price + 0.2) gaps.push({ lever: 'priceHigh', gap: (levers.price - ideal.price) * 12, text: () => `Your price is too high this week. Try around ${priceRange(ideal)} next week.` })
  if (levers.price < ideal.price - 0.2) gaps.push({ lever: 'priceLow', gap: (ideal.price - levers.price) * 12, text: () => `Kids happily paid ${levers.price < 1 ? 'that little' : 'your price'} - you can charge more. Try around ${priceRange(ideal)}.` })
  if (levers.hours < ideal.hours) gaps.push({ lever: 'hoursMore', gap: (ideal.hours - levers.hours) * 3, text: () => `You only opened ${levers.hours} hours. Open ${ideal.hours} so more kids can find you - more hours means more customers, but you pay yourself for the extra work time.` })
  if (levers.hours > ideal.hours + 1) gaps.push({ lever: 'hoursLess', gap: (levers.hours - ideal.hours) * 2.5, text: () => `The last hours were quiet, and you pay yourself for every open hour. Try ${ideal.hours} hours instead of ${levers.hours}.` })
  if (features >= 1 && levers.quality.id !== ideal.quality.id) gaps.push({ lever: 'quality', gap: 2, text: () => `This week, ${ideal.quality.label} was the smarter recipe. Try it next time.` })
  if (features >= 2 && levers.sign.id !== ideal.sign.id) gaps.push({ lever: 'sign', gap: 2, text: () => `${ideal.sign.id === 'none' ? 'Skip the sign this week - it cost more than it brought in.' : `A ${ideal.sign.label} would bring in more kids than it costs.`}` })
  gaps.sort((a, b) => b.gap - a.gap)
  if (gaps.length === 0) {
    return { lever: 'perfect', perfect: true, text: 'PERFECT combination! Supplies match your sales, your price works, your hours pay off. Nothing to fix!' }
  }
  // never the same lever twice in a row
  const last = history[history.length - 1]
  let pick = gaps[0]
  if (last && pick.lever === last.lever && gaps[1]) pick = gaps[1]
  return { lever: pick.lever, perfect: false, text: pick.text() }
}

// ---- FINAL COPY (Round 5) ----
// G1: the intro states the starting budget and the goal. $X filled at runtime.
export const INTRO_LINE = (money) =>
  `Welcome to your Lemonade Stand! You have $${money} to start. You'll buy supplies, set your price, and sell cups. Your goal: earn $${PROFIT_GOAL} profit. Penny will help you!`

// A1: the corrected tax teaching - on PROFIT, never on earnings.
export const TAX_LINE = 'Tax is a small part of your PROFIT that goes to the town. Profit is what is left after you pay for your supplies and pay yourself for your work.'

// A3: the advisor's price-setting formula, split across two sequential cards.
export const PRICE_FORMULA_CARDS = [
  'How do you set your price? Add your costs. Supplies: $6 (cups, lemons, sugar, water, table). Your work: $4 (you can change what your time is worth). Total cost: $6 + $4 = $10.',
  'These supplies make 10 cups, so each cup costs $10 / 10 = $1. Now add a little profit - say 10%: $0.10. Price: $1 + $0.10 = $1.10 a cup. You decide your price - then see how your customers respond!',
]

// G3: the week the quality lever unlocks (L8 final copy) lives in FEATURE_CARDS.

// G7: the cash-out bridge into the Money Garden.
export const CASHOUT_LINE = (cum) =>
  `You did it! Time to CASH OUT - collect your $${cum} from the stand. Now... where should all that money LIVE? Follow the arrow to BUDGET TOWN!`

// Part F: the universal bankruptcy card (calm, no shame, one card).
export const BANKRUPTCY_LINE = 'Uh oh - bankruptcy! Your money ran out. That happens to real businesses too. Let\'s go back and make a better decision this time!'

export const POOL_LINES = {
  work: 'You kept the stand open while Theo swam. Everything you choose costs the thing you did not choose.',
  pool: 'What a swim! But the stand earned nothing today. Everything you choose costs the thing you did not choose.',
}

export const SAVE_DIALOG_START = 'You saved money for things like this stand. Nice! Money you do not spend becomes your savings, just like we learned.'
export const SAVE_DIALOG_END = 'All your leftover money went into your savings. Saving what you earn is how the next big thing gets funded!'
