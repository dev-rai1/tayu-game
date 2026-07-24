// MODULE 3 - BUDGET TOWN v4 (Round 9, Part 5): A DAY IN THE LIFE.
// The child WALKS to real buildings and does real little activities - rent
// coin on the house, a grocery basket mini-game, the school bus, the health
// jar, an optional Fun Park want - with needs-vs-wants woven INTO the doing.
// The leftover then flows into the pocket/bank/garden sliders + live pie
// (the CLIMAX, kept from Round 8), the flat-tire emergency, and a physical
// coin walk to the bank kiosk and garden gate. Continuous flow: the Budget
// Keeper narrates in one-line nudges; the child never re-starts dialogue.

// ---- the day's costs (kid-scale, deducted from the real wallet) ----
export const RENT_COST = 6
export const FOOD_BUDGET = 6
export const BUS_COST = 2
export const CLINIC_COST = 2
export const FUN_COST = 2
export const MIN_FOODS = 3 // tummies first: at least 3 real foods in the basket

export const DAY_INTRO = (amt) =>
  `You arrive with $${amt} - nicely earned! Before money can grow, it pays for LIFE. Let's live one day in Budget Town. Follow your arrow!`

// One-line copy for each stop: prompt card (title/line/button) + takeaway.
export const STOPS = {
  house: {
    title: 'The House',
    line: `A roof over your head comes first. Rent: $${RENT_COST}.`,
    button: `Pay the rent ($${RENT_COST})`,
    takeaway: 'Shelter is a NEED - usually the biggest slice.',
    tag: 'NEED',
  },
  grocery: {
    title: 'The Grocery',
    line: `Fill the family basket! You have $${FOOD_BUDGET} for food.`,
    button: 'Open my basket',
    takeaway: 'Food is a NEED - a treat or two is okay!',
    tag: 'NEED',
  },
  bus: {
    title: 'The Bus Stop',
    line: `The school bus is coming. A week of rides: $${BUS_COST}.`,
    button: `Hop on ($${BUS_COST})`,
    takeaway: 'Getting to school is a NEED.',
    tag: 'NEED',
  },
  clinic: {
    title: 'The Clinic',
    line: `The health jar keeps checkups covered. Drop in $${CLINIC_COST}.`,
    button: `Fill the health jar ($${CLINIC_COST})`,
    takeaway: 'Health care is a NEED you plan for.',
    tag: 'NEED',
  },
  fun: {
    title: 'The Fun Park',
    line: `Every NEED is covered - so now you get to choose. The mini-wheel costs $${FUN_COST}.`,
    ride: `Ride the wheel ($${FUN_COST})`,
    save: 'Save it instead',
    takeawayRide: 'Wants come AFTER needs - and yours were covered. Enjoy the ride!',
    takeawaySave: 'Skipping a want you did not need - that is real budget power!',
    tag: 'WANT',
  },
}

// the walking nudges between stops (the Keeper's one-liners)
export const NEXT_STOP_TOAST = {
  house: 'First stop: the HOUSE. Follow your arrow!',
  grocery: 'Next: the GROCERY - the basket is waiting.',
  bus: 'Next: the BUS STOP - school days!',
  clinic: 'Next: the CLINIC - the health jar.',
  fun: 'Last stop: the FUN PARK... if you want to.',
}

// ---- the grocery basket mini-game ----
export const GROCERY_ITEMS = [
  { id: 'milk', name: 'Milk', cost: 1, need: true },
  { id: 'bread', name: 'Bread', cost: 1, need: true },
  { id: 'eggs', name: 'Eggs', cost: 2, need: true },
  { id: 'apples', name: 'Apples', cost: 1, need: true },
  { id: 'veggies', name: 'Veggies', cost: 2, need: true },
  { id: 'icepop', name: 'Ice pop', cost: 1, need: false },
  { id: 'chips', name: 'Chips', cost: 1, need: false },
  { id: 'comic', name: 'Comic', cost: 2, need: false },
]
export const GROCERY_GATE = `Tummies first! Grab at least ${MIN_FOODS} real foods, then treats if there is room.`

// After the day: the Keeper sums the ledger and hands over to the split.
export const DAY_SUMMARY = (needs, fun, left) =>
  `What a day! Needs cost $${needs}${fun > 0 ? ` and fun cost $${fun}` : ' and you skipped the want'} - you have $${left} left. Grown-ups give leftover money three homes. Tap each one to see what it does!`

// Beat: the three homes for money (tap each card; a tiny animation teaches)
export const OPTION_CARDS = [
  { id: 'pocket', title: 'POCKET', line: 'Cash you keep close. Safe, ready anytime - but it never grows.', color: '#9aa6b8', anim: 'flat' },
  { id: 'bank', title: 'BANK', line: 'Money you store at the bank. It grows a little, slow and steady.', color: '#1464F0', anim: 'slope' },
  { id: 'garden', title: 'MONEY GARDEN', line: 'Money you plant to grow the most - but it can wiggle up AND down. There is a risk.', color: '#00b37f', anim: 'wiggle' },
]

// The advisor's EXACT per-slice hover feedback (pct = the child's actual
// percentage; the tone stays exactly like her lines).
export function sliceLine(id, pct) {
  if (id === 'pocket') return `You have ${pct}% in safe cash, which will stay steady. It will not grow, but it's safe.`
  if (id === 'bank') return `You have kept ${pct}% of your money in the bank. It will grow over time - smaller amounts, slow and steady.`
  return `You have decided to put ${pct}% of your money here. Just keep in mind: this money has a risk. It may grow, or it may be lost.`
}

// Nudges - never blocks (the advisor: nudge toward a middle, never force).
export function splitNudge(split, total) {
  if (split.pocket >= total) return 'If it all naps in your pocket, none of it grows - try putting a little to work!'
  if (split.garden >= total) return 'Brave! But smart gardeners keep some safe in case of surprises.'
  if (split.bank === 0 && split.garden === 0) return 'All pocket cash so far - the bank and garden are where money grows.'
  if (split.pocket === 0) return 'A little pocket cash is handy for surprises - grown-ups call it emergency money.'
  return null
}

export const SPLIT_PROMPT = 'Split your leftover three ways. Slide each one - the pie shows your plan!'
export const SPLIT_CONFIRM = "Here's your plan!"

// The physical split (5.1): WALK the coins to their homes.
export const CARRY_PROMPT = 'Now walk your money home! Take the BANK coins to the BANK KIOSK, and the GARDEN coins to the GARDEN GATE.'
export const CARRY_BANK_DONE = (amt) => `$${amt} tucked at the bank kiosk - Banker Bea will collect it.`
export const CARRY_GARDEN_DONE = (amt) => `$${amt} waits at the garden gate, ready to grow.`

// Emergency savings (the advisor's explicit lesson)
export const EMERGENCY_INTRO = "One more thing - a gardener's secret: always keep a little in your pocket for SURPRISES. A flat bike tire, a rainy day. That's called emergency money."
export const EMERGENCY_EVENT = { label: 'Flat bike tire!', cost: 2 }
export const EMERGENCY_PRAISE = 'See? Because you kept a little in your pocket, the surprise was no problem.'
export const EMERGENCY_REPLAY = 'Uh oh - no pocket cash for the surprise! Let\'s set your split again and keep a little close.'

// The hand-off with the running numbers (the connective tissue)
export const HANDOFF = (bank, garden) =>
  `Your plan is set! The $${bank} you're saving - let's go to the Bank and open a real account. And the $${garden} you're growing? That comes later, at the Money Garden. Follow the path to the Bank - Banker Bea is waiting!`

// default starting split suggestion (child adjusts freely): ~20/35/45
export function defaultSplit(total) {
  const pocket = Math.max(2, Math.round(total * 0.2))
  const bank = Math.round(total * 0.35)
  return { pocket, bank, garden: total - pocket - bank }
}
