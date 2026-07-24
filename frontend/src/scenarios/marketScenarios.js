// MODULE 3 - THE MONEY GARDEN v5 (Round 5, Part H): the advisor's complete
// restructure. Ten ordered weekly lessons, each with an Intro (before
// deciding), a Praise line (followed the lesson) and a Coach line (didn't -
// warm, behavior-naming, forward-pointing). All thirty lines are her final
// copy, verbatim. Feedback follows the H9 card shape: behavior line -> tiny
// honest numbers -> forward nudge. Goal is ~+40% (about $42 from a $30
// cash-out), never "investing doubles your money."
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
  "Here we plant money in COMPANIES. But smart gardeners never plant at random - let me show you how to choose your seeds.",
]

// ---- Round 8 Part 4: the SEED PIE - how to CHOOSE companies (not random) ----
export const COMPANY_CHOICE = {
  prompt: 'Split your garden money across the three companies. Tap each slice to hear its story first!',
  lines: {
    toy: 'Toy Town: peek in the windows - PACKED with customers every day. A busy store is a healthy company. A steady grower.',
    snack: 'Snack Shack: the town news says kids love their new juice pops. Good news can mean growth - but always check the store, not just the headlines.',
    game: 'Game Land: exciting, but its price jumps around - a wiggly grower. It can grow fast AND droop fast. Plant here only what can ride the wiggles.',
  },
  closing: 'That is how gardeners choose: look for BUSY stores, listen for REAL news, and know your steady growers from your wiggly ones. Never plant at random - and never all in one bed!',
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

// ---- H5/H7: the ten weeks. intro/praise/coach are VERBATIM final copy. ----
// Each week: lesson (pinned chip), intro, praise, coach, nudge (H9 bottom
// line), ctx/fx/moves (the engineered beat), judge(m, actions, ctx, extra),
// special ('slider' | 'surprise' | 'bankrupt' | 'rebalance').
export const WEEKS = [
  {
    n: 1,
    lesson: 'Lesson: choose your seeds like a detective - never at random',
    intro: 'Time to plant! Three companies, three garden beds. Before you choose, be a detective: who is busy? What does the news say? Who is steady, who is wiggly? Then split your seeds the way YOU think is smart.',
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
    intro: "Time to choose your seeds! Toy Town, Snack Shack, Game Land... here's a tip: one garden bed can flood. Two or three beds? Much harder to lose it all.",
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
    intro: 'Fair warning, friend: this week the prices are going to wiggle. Down, up, down again. A drooping plant is NOT a dead plant. Watch before you pull!',
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
    intro: 'New gardener trick: look before you plant! Walk past the shops. Full of customers? Healthy company. Empty and dusty? Hmm. The store tells you what the price can\'t.',
    praise: 'You planted in the busy store - and busy stores grow gardens. You did real research, detective!',
    coach: 'That store\'s been empty for weeks and you planted anyway. Next time, peek in the windows first - customers are clues.',
    nudge: 'Next week: two price drops, two very different stories.',
    learn: 'research',
    ctx: () => ({ busy: 'game', dusty: 'snack' }),
    fx: (c) => ({ busy: c.busy, dusty: c.dusty }),
    moves: (c) => ({ early: { [c.dusty]: -1 }, late: { [c.busy]: +2 } }),
    // researched = leaned toward the busy store, not the dusty one
    judge: (m, a, c) => (a.bought[c.busy] || 0) > 0 || ((a.bought[c.dusty] || 0) === 0 && m.companies[c.busy].owned > 0),
  },
  {
    n: 5,
    lesson: 'Lesson: price and health are different',
    intro: 'Two prices dropped today! But look closer: one store is still PACKED, the other is a ghost town. Same price drop, very different story. Cheap and busy is a sale. Cheap and empty is a warning.',
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
    intro: 'Some seeds are slow bloomers. The longer they sit, the deeper the roots. Oh - and keep your ears open. I hear a surprise is coming to town this week...',
    praise: 'A surprise bill! But you had pocket coins ready, so your garden never felt a thing. THIS is why we don\'t plant everything.',
    coach: 'That surprise bill made you dig up a seed before it finished growing - you lost a little. Now you know why gardeners keep pocket coins. You won\'t forget!',
    nudge: 'Next week: warning signs - and what to do about them.',
    learn: 'longterm',
    special: 'surprise', // the ONE designed sting; the rewind does NOT fire here
    ctx: (m) => ({ held: ownedIds(m) }),
    fx: () => ({ envelope: true }),
    moves: (c) => ({ early: {}, late: Object.fromEntries(c.held.map((id) => [id, +2])) }),
    judge: (m, a, c, extra) => extra?.billPaid !== 'forced',
  },
  {
    n: 7,
    lesson: 'Lesson: companies can fail - watch for warning signs',
    intro: 'Hard truth time, friend. Sometimes a store closes for good. Watch for the warning signs: empty aisles, sad signs, dusty windows. It\'s okay to move your seeds OUT of sick soil.',
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
    intro: 'Everyone in town is shouting about last week\'s rocket stock! Here\'s the thing about rockets: what shoots up fast can come down fast. Don\'t plant just because of the noise.',
    praise: 'The whole town chased the rocket - and you didn\'t. When it fizzled, your steady seeds just kept growing. Cool head, green garden.',
    coach: 'You bought the rocket at the tippy-top, right before it fell. Chasing the shiny thing usually means arriving late. The busy-store trick works better than the loud-crowd trick.',
    nudge: 'Next week: the quiet shop on the corner.',
    learn: 'finbasics',
    ctx: (m) => ({ hot: lastRiser(m) }),
    pre: (c) => ({ [c.hot]: +2 }), // the rocket inflates before the decision
    fx: (c) => ({ balloon: c.hot }),
    moves: (c) => ({ early: {}, late: { [c.hot]: -3 } }),
    judge: (m, a, c) => (a.bought[c.hot] || 0) === 0,
  },
  {
    n: 9,
    lesson: 'Lesson: steady and boring can beat flashy',
    intro: 'See that quiet little shop on the corner? No fireworks, no crowds shouting. Just open every day, steady as sunrise. Keep an eye on it this week...',
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
    intro: 'Last week! Time for garden tidying. Some plants grew huge, some stayed tiny - so your seeds might be crowded in one bed again without you noticing. Trim the big, water the small, spread things back out.',
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
  intro: 'A little more tidying, gardener - steady weeks grow steady gardens. Keep your beds spread out.',
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
