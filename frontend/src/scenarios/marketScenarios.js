// MODULE 3 - THE MONEY GARDEN v5 (Round 5, Part H): the advisor's complete
// restructure. Ten ordered weekly lessons, each with an Intro (before
// deciding), a Praise line (followed the lesson) and a Coach line (didn't -
// warm, behavior-naming, forward-pointing). Feedback follows the H9 card
// shape: behavior line -> tiny honest numbers -> forward nudge. Goal is ~+40%
// (about $42 from a $30 cash-out), never "investing doubles your money."
// A5: every line credits a DECISION, never a lucky pick. No emojis.

import { COMPANIES } from './moneyGarden.js'

export const GOAL_MIN = 42
export const GOAL_RATE = 1.4 // ~+40% of the cash-out the player arrives with
export const TOTAL_WEEKS = 10
export const SURPRISE_BILL = 4 // Week 6's designed sting
export const BANK_DRIP_MIN = 5 // Bank Sprout pays $1 per 2 weeks on $5+

// ---- Round 8 opening: the split is ALREADY decided (back in Budget Town) ----
export const OPENING = [
  "There you are! You earned it at the stand, you budgeted it in town, you banked the safe part... and you brought the GROW part right here. Welcome to the Money Garden!",
  "Remember your plan: pocket cash for surprises, bank money growing slow and steady. And a grown-up secret: money that just sits still slowly buys LESS over time - so growing some of it really matters. THIS money is the brave part - the garden can grow it the most, but it wiggles.",
  "Here we plant money in COMPANIES. Every week works the same way: read the clue, click My Portfolio, make your choice, close the portfolio, and then click Start the Week to see what happens.",
]

// ---- Round 8 Part 4: the SEED PIE - how to CHOOSE companies (not random) ----
export const COMPANY_CHOICE = {
  prompt: 'First, tap each company slice to hear its story. Then choose how much to plant in each one.',
  lines: {
    toy: 'Toy Town: peek in the windows - PACKED with customers every day. A busy store is a healthy company. A steady grower.',
    snack: 'Snack Shack: the town news says kids love their new juice pops. Good news can mean growth - but always check the store, not just the headlines.',
    game: 'Game Land: exciting, but its price jumps around - a wiggly grower. It can grow fast AND droop fast. Plant here only what can ride the wiggles.',
  },
  closing: 'Now make your choice. Look for BUSY stores, listen for REAL news, and know your steady growers from your wiggly ones. Never plant at random - and never all in one bed!',
}

// ---- H6: the Week-1 plant-amount slider bands (live Sprout nudges) ----
export function sliderLine(planted, total) {
  if (planted >= total) return "Every coin in the ground? Growing big dreams! Just remember where your rainy-day coins would come from..."
  if (planted === 0) return 'No seeds at all? The garden cannot grow money it never gets. Try planting at least a little.'
  const frac = planted / total
  if (frac >= 0.8) return 'A big garden! Bold gardener. Keep an eye on that small pocket cushion.'
  if (frac >= 0.4) return "A big garden and a little pocket cushion - that's how the pros do it! Those pocket coins are your umbrella for rainy days."
  return 'Careful and cozy! Your pocket is well padded. A few more seeds in the ground would grow faster.'
}

// helpers that aim each week at the player's REAL garden
const ownedIds = (m) => Object.keys(m.companies).filter((id) => m.companies[id].owned > 0)
const mostOwned = (m) => {
  let best = null
  for (const id of Object.keys(m.companies)) {
    const c = m.companies[id]
    if (c.owned > 0 && (!best || c.owned > m.companies[best].owned)) best = id
  }
  return best
}
const lastRiser = (m) => {
  let best = null, gain = -Infinity
  for (const id of Object.keys(m.companies)) {
    const h = m.companies[id].history
    const d = h.length > 1 ? h[h.length - 1] - h[h.length - 2] : 0
    if (d > gain) { gain = d; best = id }
  }
  return best || 'game'
}
const holdingsValue = (m) => Object.keys(m.companies).reduce((v, id) => v + m.companies[id].owned * m.companies[id].price, 0)
const isSpread = (m) => {
  const hv = holdingsValue(m)
  if (hv === 0) return false
  return Object.keys(m.companies).every((id) => (m.companies[id].owned * m.companies[id].price) / hv <= 0.55)
}

// ---- H5/H7: the ten weeks. ----
// Every intro gives the player the same clear action sequence: read the clue,
// click My Portfolio, make the decision, close it, then start the week.
export const WEEKS = [
  {
    n: 1,
    lesson: 'Lesson: choose your seeds like a detective - never at random',
    intro: 'Time to plant! First study the three company stories. Then choose how to split your seeds across the beds. After you finish your choice, start the week to see how your garden grows.',
    praise: 'You looked before you planted - busy stores, real news, steady and wiggly. That is detective gardening!',
    coach: 'Seeds are in the ground - now watch them close. Detectives keep watching after they plant!',
    nudge: 'Next week: why one garden bed is never enough.',
    special: 'seeds',
    learn: 'stocks',
    ctx: () => ({}),
    fx: () => ({}),
    moves: (c, m) => ({ early: {}, late: Object.fromEntries(Object.keys(m.companies).filter((id) => m.companies[id].owned > 0).map((id) => [id, +1])) }),
    judge: (m) => Object.keys(m.companies).some((id) => m.companies[id].owned > 0),
  },
  {
    n: 2,
    lesson: 'Lesson: never keep all your money in one company',
    intro: "One garden bed can flood, but two or three beds make it harder to lose everything. Click My Portfolio, spread your seeds across at least two companies, close the portfolio, and then click Start the Week.",
    praise: 'When Toy Town drooped, your Snack Shack seeds kept right on growing. Spreading out saved you!',
    coach: 'Ouch - all your seeds were in one bed when the rain came. Next week, try spreading across two or three. It\'s like a seatbelt for your coins.',
    nudge: 'Next week: what to do when prices wiggle.',
    learn: 'diversify',
    ctx: (m) => { const dip = mostOwned(m) || 'toy'; return { dip } },
    fx: (c) => ({ rain: c.dip }),
    moves: (c, m) => ({
      early: { [c.dip]: -2 },
      late: Object.fromEntries(Object.keys(m.companies).filter((id) => id !== c.dip).map((id) => [id, +1])),
    }),
    judge: (m) => ownedIds(m).length >= 2,
    praiseDynamic: (m, c) => `When ${COMPANIES[c.dip].name} drooped, your other seeds kept right on growing. Spreading out saved you!`,
  },
  {
    n: 3,
    lesson: 'Lesson: prices wiggle - do not panic when they dip',
    intro: 'Prices will wiggle down, up, and down again. A drooping plant is not a dead plant. Click My Portfolio, decide whether to hold, buy, or sell, close it, and then click Start the Week. The patient choice is usually to avoid panic-selling.',
    praise: 'You held on through the droop and - look at that - it stood back up taller. That\'s called patience, and it pays.',
    coach: 'You pulled your seed out right at the bottom of the droop... and then it grew back without you. Dips end. Next time, take a breath first.',
    nudge: 'Next week: a gardener trick called research.',
    learn: 'finbasics',
    ctx: (m) => ({ dip: mostOwned(m) || 'game' }),
    fx: (c) => ({ dip: c.dip }),
    moves: (c) => ({ early: { [c.dip]: -2 }, late: { [c.dip]: +3 } }),
    judge: (m, a, c) => !((a.sold[c.dip] || 0) > 0 || a.cashout),
  },
  {
    n: 4,
    lesson: 'Lesson: watch the store - a busy store is a healthy company',
    intro: 'Look at the shops before deciding. Full of customers can mean a healthy company; empty and dusty is a warning. Click My Portfolio, favor the busy store, close it, and then click Start the Week.',
    praise: 'You planted in the busy store - and busy stores grow gardens. You did real research, detective!',
    coach: 'That store\'s been empty for weeks and you planted anyway. Next time, peek in the windows first - customers are clues.',
    nudge: 'Next week: two price drops, two very different stories.',
    learn: 'research',
    ctx: () => ({ busy: 'game', dusty: 'snack' }),
    fx: (c) => ({ busy: c.busy, dusty: c.dusty }),
    moves: (c) => ({ early: { [c.dusty]: -1 }, late: { [c.busy]: +2 } }),
    judge: (m, a, c) => (a.bought[c.busy] || 0) > 0 || ((a.bought[c.dusty] || 0) === 0 && m.companies[c.busy].owned > 0),
  },
  {
    n: 5,
    lesson: 'Lesson: price and health are different',
    intro: 'Two prices dropped, but one store is still packed while the other is empty. Cheap and busy may be a sale; cheap and empty may be a warning. Click My Portfolio, compare both companies, make your choice, close it, and then click Start the Week.',
    praise: 'You grabbed the busy store while it was on sale - and skipped the empty one. That\'s the sharpest eye in the garden!',
    coach: 'You bought the cheap one... but nobody shops there, friend. Cheap isn\'t the same as good. Busy-and-cheap is the treasure.',
    nudge: 'Next week: give your seeds time - and keep your ears open.',
    learn: 'research',
    ctx: () => ({ saleBusy: 'toy', saleEmpty: 'snack' }),
    pre: (c) => ({ [c.saleBusy]: -2, [c.saleEmpty]: -2 }),
    fx: (c) => ({ sale: c.saleBusy, sale2: c.saleEmpty, busy: c.saleBusy, dusty: c.saleEmpty }),
    moves: (c) => ({ early: {}, late: { [c.saleBusy]: +3, [c.saleEmpty]: -1 } }),
    judge: (m, a, c) => (a.bought[c.saleBusy] || 0) > 0 && (a.bought[c.saleEmpty] || 0) === 0,
  },
  {
    n: 6,
    lesson: 'Lesson: money seeds take time - patience pays',
    intro: 'Some seeds are slow bloomers, and a surprise bill may arrive. Click My Portfolio, make sure you keep some money in Pocket instead of planting everything, close it, and then click Start the Week.',
    praise: 'A surprise bill! But you had pocket coins ready, so your garden never felt a thing. THIS is why we don\'t plant everything.',
    coach: 'That surprise bill made you dig up a seed before it finished growing - you lost a little. Now you know why gardeners keep pocket coins. You won\'t forget!',
    nudge: 'Next week: warning signs - and what to do about them.',
    learn: 'longterm',
    special: 'surprise',
    ctx: (m) => ({ held: ownedIds(m) }),
    fx: () => ({ envelope: true }),
    moves: (c) => ({ early: {}, late: Object.fromEntries(c.held.map((id) => [id, +2])) }),
    judge: (m, a, c, extra) => extra?.billPaid !== 'forced',
  },
  {
    n: 7,
    lesson: 'Lesson: companies can fail - watch for warning signs',
    intro: 'A store may close when the warning signs pile up: empty aisles, sad signs, and dusty windows. Click My Portfolio, move your seeds out of the unhealthy store, close it, and then click Start the Week.',
    praise: 'You saw the warning signs and moved your seeds out before the store closed. That\'s not panic - that\'s paying attention.',
    coach: 'The store closed and took a seed with it. It stings, I know. But look - your other beds are still growing. One closed store never ends a good gardener.',
    nudge: 'Next week: rockets, noise, and keeping a cool head.',
    learn: 'risk',
    special: 'bankrupt',
    ctx: () => ({ shabby: 'snack' }),
    fx: (c) => ({ shabby: c.shabby }),
    moves: (c, m) => ({
      early: { [c.shabby]: -2 },
      late: Object.fromEntries(Object.keys(m.companies).filter((id) => id !== c.shabby).map((id) => [id, +1])),
    }),
    judge: (m, a, c, extra) => !extra?.lostShares,
  },
  {
    n: 8,
    lesson: 'Lesson: do not chase - what shot up fast can fall fast',
    intro: 'Everyone is shouting about the rocket stock, but what shoots up fast can fall fast. Click My Portfolio, avoid buying only because of the hype, close it, and then click Start the Week.',
    praise: 'The whole town chased the rocket - and you didn\'t. When it fizzled, your steady seeds just kept growing. Cool head, green garden.',
    coach: 'You bought the rocket at the tippy-top, right before it fell. Chasing the shiny thing usually means arriving late. The busy-store trick works better than the loud-crowd trick.',
    nudge: 'Next week: the quiet shop on the corner.',
    learn: 'finbasics',
    ctx: (m) => ({ hot: lastRiser(m) }),
    pre: (c) => ({ [c.hot]: +2 }),
    fx: (c) => ({ balloon: c.hot }),
    moves: (c) => ({ early: {}, late: { [c.hot]: -3 } }),
    judge: (m, a, c) => (a.bought[c.hot] || 0) === 0,
  },
  {
    n: 9,
    lesson: 'Lesson: steady and boring can beat flashy',
    intro: 'The quiet shop has no fireworks, but it opens every day and stays steady. Click My Portfolio, consider putting money in the steady company instead of only the flashy ones, close it, and then click Start the Week.',
    praise: 'The quiet shop won the week while the flashy ones wobbled! Boring is beautiful in a money garden.',
    coach: 'The flashy stores danced up and down and ended right where they started - the quiet shop passed them all. Steady seeds, friend. Steady seeds.',
    nudge: 'Last week coming up: garden tidying!',
    learn: 'longterm',
    ctx: () => ({ quiet: 'toy', flashy: ['game', 'snack'] }),
    fx: (c) => ({ star: c.quiet }),
    moves: (c) => ({
      early: { [c.quiet]: +1, [c.flashy[0]]: +2, [c.flashy[1]]: +1 },
      late: { [c.quiet]: +1, [c.flashy[0]]: -2, [c.flashy[1]]: -1 },
    }),
    judge: (m, a, c) => m.companies[c.quiet].owned > 0,
  },
  {
    n: 10,
    lesson: 'Lesson: check your garden - trim the big, water the small',
    intro: 'Your last decision is to rebalance. Click My Portfolio, sell a little from any company holding too much and add to the smaller beds, close it, and then click Start the Week.',
    praise: 'Trimmed, watered, balanced - your garden is spread out just right, and look at that number. You\'re a true gardener now!',
    coach: 'Almost there! One bed is holding most of your coins again - remember Week 2? Give it one more trim and you\'re home.',
    nudge: 'Your garden is ready for harvest!',
    learn: 'allocation',
    special: 'rebalance',
    ctx: () => ({}),
    fx: () => ({}),
    moves: (c, m) => ({ early: {}, late: Object.fromEntries(ownedIds(m).map((id) => [id, +1])) }),
    judge: (m) => isSpread(m),
  },
]

// Weeks past 10 (only if the goal is not yet reached): gentle steady growth
// so the harvest is always reachable - never a grind wall.
export const OVERTIME = {
  lesson: 'Lesson: steady gardens grow a little every week',
  intro: 'You are close. Click My Portfolio, keep your seeds spread across the beds, close it, and then click Start the Week.',
  praise: 'Steady, spread out, and growing. The harvest is close!',
  coach: 'Spread your seeds across the beds and let them grow - you are almost there.',
  nudge: 'The harvest is close!',
  learn: 'diversify',
  ctx: (m) => ({ held: ownedIds(m) }),
  fx: () => ({}),
  moves: (c) => ({ early: {}, late: Object.fromEntries(c.held.map((id) => [id, +2])) }),
  judge: (m) => isSpread(m),
}

export function weekSpec(week) {
  return week <= TOTAL_WEEKS ? WEEKS[week - 1] : OVERTIME
}

// ---- H4/H10: completion honesty (final copy) ----
export const COMPLETION_LINE = (goal) =>
  `$${goal}! You planted, you watched, you waited - and when things drooped, you didn't panic. One last secret, gardener: real money gardens grow slower than ours did. But the earlier in life you plant, the taller they grow. Now go tell someone what a busy store means!`

// H11: the hand-off into Budget Town (the same wallet travels).
export const BRIDGE_LINE = 'You EARNED it. You BUDGETED it. You BANKED it. And now you GREW it. That is the whole money journey! Follow the path east - the FINALE AREA is open, and the party is for YOU.'