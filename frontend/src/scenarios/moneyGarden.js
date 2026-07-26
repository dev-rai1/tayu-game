// Week 3 - MS. SPROUT'S MONEY GARDEN (Master Adjustment Part F).
// A fixed, authored 6-round journey - a picture book with choices, not a
// sandbox. One decision per screen, every decision produces a visible animated
// consequence, one feedback card after every outcome, safe to fail and
// impossible to get stuck. All copy lives HERE (F10): every branch enumerated,
// nothing improvised at runtime. No emojis anywhere in this module.

export const START_CASH = 20
export const TOTAL_FLOOR = 8 // the engine never lets cash+holdings fall below this
export const ROUNDS = 6

// ---- The three companies (F4) ----
export const COMPANIES = {
  toy: {
    id: 'toy', name: 'Toy Town', sells: 'Toys and plushies',
    color: '#e23b3b', accent: '#f5c542',
    base: 5, min: 3, max: 25, wiggle: 1, // steady grower
    pos: [-4.6, 0.2], // local to the garden plaza
  },
  snack: {
    id: 'snack', name: 'Snack Shack', sells: 'Snacks and juice',
    color: '#3f9a42', accent: '#ffffff',
    base: 4, min: 2, max: 20, wiggle: 1, // wiggly
    pos: [0, -0.6],
  },
  game: {
    id: 'game', name: 'Game Land', sells: 'Video games',
    color: '#7850F0', accent: '#00DCA0',
    base: 6, min: 3, max: 30, wiggle: 2, // big mover
    pos: [4.6, 0.2],
  },
}
export const COMPANY_IDS = ['toy', 'snack', 'game']

export function weeklyMarketUpdate(previous, current) {
  return COMPANY_IDS.map((id) => {
    const before = previous[id].price
    const after = current[id].price
    const direction = after > before
      ? 'rose from 
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
 + before + ' to 
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
 + after
      : after < before
        ? 'fell from 
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
 + before + ' to 
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
 + after
        : 'held at 
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
 + after
    return `${COMPANIES[id].name} ${direction}`
  }).join(' · ')
}

export function initCompanies() {
  const out = {}
  for (const id of COMPANY_IDS) {
    const c = COMPANIES[id]
    out[id] = { price: c.base, owned: 0, history: [c.base] }
  }
  return out
}

// ---- The price engine (F9) - whole dollars, clamped, floor-guarded ----
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// noise in {-1, 0, +1}, weights shaped by bias. Sub-dollar biases would be
// eaten by round(), so the WEIGHTS carry them: a small positive bias tilts the
// coin instead of moving the price directly.
function noise(bias) {
  const r = Math.random()
  if (bias > 0.9) return r < 0.5 ? 0 : r < 0.9 ? 1 : -1
  if (bias > 0.25) return r < 0.45 ? 0 : r < 0.85 ? 1 : -1
  if (bias < -0.9) return r < 0.5 ? 0 : r < 0.9 ? -1 : 1
  if (bias < -0.25) return r < 0.45 ? 0 : r < 0.85 ? -1 : 1
  return r < 0.34 ? -1 : r < 0.67 ? 0 : 1
}

// Apply one tick. biases = { companyId: bias in [-1,+1] } - companies not
// listed get bias 0 (pure wiggle). Returns { prices-updated companies, moves }.
export function tick(companies, biases = {}) {
  const moves = {}
  const next = {}
  for (const id of COMPANY_IDS) {
    const spec = COMPANIES[id]
    const cur = companies[id]
    const bias = biases[id] ?? 0
    let move = Math.round(bias * spec.wiggle + noise(bias))
    move = clamp(move, -3, 3) // no stock ever moves more than $3 in one tick
    const price = clamp(cur.price + move, spec.min, spec.max)
    moves[id] = price - cur.price
    next[id] = { ...cur, price, history: [...cur.history.slice(-5), price] }
  }
  return { companies: next, moves }
}

// Force a company's move to an exact scripted amount (for guaranteed beats).
export function scriptedMove(companies, id, amount) {
  const spec = COMPANIES[id]
  const cur = companies[id]
  const price = clamp(cur.price + amount, spec.min, spec.max)
  return {
    companies: { ...companies, [id]: { ...cur, price, history: [...cur.history.slice(-5), price] } },
    moves: { [id]: price - cur.price },
  }
}

export function holdingsValue(mg) {
  let v = 0
  for (const id of COMPANY_IDS) v += mg.companies[id].owned * mg.companies[id].price
  return v
}
export function totalValue(mg) { return (mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdingsValue(mg) }

// Floor guard (F9/F12): soften any batch of moves that would breach the floor.
export function guardFloor(mg, nextCompanies) {
  let projected = mg.cash
  for (const id of COMPANY_IDS) projected += nextCompanies[id].owned * nextCompanies[id].price
  if (projected >= TOTAL_FLOOR) return nextCompanies
  // soften: undo negative moves one at a time until safe
  const softened = { ...nextCompanies }
  for (const id of COMPANY_IDS) {
    const prev = mg.companies[id].price
    if (softened[id].price < prev) {
      softened[id] = { ...softened[id], price: prev, history: [...softened[id].history.slice(0, -1), prev] }
      let p = mg.cash
      for (const k of COMPANY_IDS) p += softened[k].owned * softened[k].price
      if (p >= TOTAL_FLOOR) break
    }
  }
  return softened
}

// The child's owned-most company (for the R3 dip) and best performer (R4).
export function ownedMost(mg) {
  let best = null
  for (const id of COMPANY_IDS) {
    const c = mg.companies[id]
    if (c.owned > 0 && (!best || c.owned > mg.companies[best].owned)) best = id
  }
  return best
}
export function bestPerformer(mg) {
  let best = null, bestGain = -Infinity
  for (const b of mg.buys) {
    const c = mg.companies[b.c]
    if (c.owned > 0 && c.price - b.price > bestGain) { bestGain = c.price - b.price; best = b.c }
  }
  return best
}
export function firstBuyPrice(mg, id) {
  const b = mg.buys.find((x) => x.c === id)
  return b ? b.price : COMPANIES[id].base
}

// ---- Superpower (F13) - the strongest TRUE one from actual play ----
export function pickSuperpower(mg) {
  if (mg.seen.waited) return 'PATIENCE'
  if (mg.seen.diversified) return 'PLANTING IN MANY POTS'
  if (mg.seen.newsRight) return 'THINKING FIRST'
  return 'WATCHING AND LEARNING'
}

// ---- Opening cards (F7) - exactly four, one at a time ----
export const INTRO_CARDS = [
  { pose: 'wave', text: "Welcome to my Money Garden! I'm Mr. Sprout." },
  { pose: 'idle', text: 'Here, you can own a tiny piece of a company. That tiny piece is called a stock.' },
  { pose: 'idle', text: "When you buy a stock, it's like planting a money seed. Its price can grow up... or droop down. Both happen!" },
  { pose: 'cheer', text: "We'll make choices together, watch what happens, and learn. Ready to plant your first seed?", button: "Let's go!" },
]

// ---- News events (F8-R6) ----
export const NEWS_EVENTS = [
  { id: 'goodGame', target: 'game', good: true, headline: 'Game Land is releasing a new game everyone wants!' },
  { id: 'carefulSnack', target: 'snack', good: false, headline: 'Snack Shack ran out of its favorite juice this week.' },
]

// ---- The full feedback + prompt copy matrix (F8/F10) ----
// Rules: max two short sentences, name the dollars, droop/dip not lose/crash,
// negatives end with a forward nudge, no emojis, no other-module mentions.
export const COPY = {
  // Round 1
  'R1.prompt': 'Toy Town has been growing lately! One share costs $5. Want to plant your first seed?',
  'R1.more': 'Buying 1 share means you own a tiny piece of Toy Town. If its price grows, your piece is worth more!',
  'R1.buy.up': 'Look! Toy Town grew from $5 to $6. Your share is worth $1 more. That is how investing earns!',

  // Round 2
  'R2.prompt': 'You have $CASH left. You could buy another Toy Town share ($TOY)... or try Snack Shack ($SNACK). Which seed do you want?',
  'R2.toy.up': 'Toy Town grew! Nice pick. But look: Snack Shack moved too. Every seed in the garden wiggles on its own.',
  'R2.toy.down': 'Toy Town drooped a little. That is okay, seeds wiggle! Watch what it does next round.',
  'R2.snack.up': 'Snack Shack grew! Nice pick. But look: Toy Town moved too. Every seed in the garden wiggles on its own.',
  'R2.snack.down': 'Snack Shack drooped a little. That is okay, seeds wiggle! Watch what it does next round.',

  // Round 3 - the dip
  'R3.prompt': 'Oh! COMPANY drooped from $FROM to $TO. You can sell now and take $TO back... or wait and see if it grows again. What feels smart?',
  'R3.wait.recover': 'You waited, and it grew back even taller! Patient gardeners often win. But remember: waiting does not ALWAYS work.',
  'R3.sell.recover': 'It grew back after you sold. Tricky! Selling during a droop can lock in a loss. Next time, try waiting a beat and thinking first.',
  'R3.makegood': 'Here is another chance: a fresh seed so your garden keeps growing. Want to plant it?',

  // Round 4 - harvest
  'R4.prompt': 'Your COMPANY share cost $BOUGHT. It is worth $NOW now! Want to harvest it (sell), or keep it planted?',
  'R4.sell': 'You bought at $BOUGHT and sold at $NOW. You earned $GAIN! Buy low, sell higher. That is the magic.',
  'R4.keep.up': 'Still growing. Holding can pay!',
  'R4.keep.down': 'It dipped a touch. Holding means riding the wiggles. Your call next time!',

  // Round 5 - diversification
  'R5.teach': 'Gardeners never plant ALL their seeds in one pot. If one pot has a bad day, the other pots keep growing!',
  'R5.prompt': 'Game Land costs $GAME. Want to plant a seed in a new pot?',
  'R5.buy': 'See that? One pot drooped, but your other pots grew. Spreading seeds kept your garden safe!',
  'R5.skip': 'One pot drooped today. With seeds in more pots, droops hurt less. Something to try!',

  // Round 6 - the news flash
  'R6.think': 'News can move prices! What do you think this news means for COMPANY: up or down?',
  'R6.right.acted': 'You read the news like a pro investor!',
  'R6.right.watched': 'You saw it coming! Next time you could act on it.',
  'R6.wrong.surprised': 'Surprise! News usually matters, but not always. Thinking first is still the right move.',
  'R6.wrong.acted': 'That one surprised us both. Even grown-up investors get surprised. You thought first, and that is what counts.',

  // Guardrails (F12)
  'cant.afford': 'That pot needs $PRICE. Let us look at COMPANY for $ALT instead!',
  'topup': 'Every gardener gets a few extra seeds. Here is $5. Keep growing!',
  'idle.nudge': 'Take your time! Tap one of the buttons when you are ready.',

  // Celebration (F14)
  'celebrate': 'You planted, you watched, you learned. You are a Market Gardener now!',
}

// String templating: "$KEY" tokens are money (the $ stays: "$CASH" → "$15");
// the bare COMPANY token is a name.
export function fill(key, vars = {}) {
  let s = COPY[key] || key
  for (const [k, v] of Object.entries(vars)) {
    if (k === 'COMPANY') s = s.replaceAll('COMPANY', `${v}`)
    else s = s.replaceAll(`$${k}`, `$${v}`)
  }
  return s
}
