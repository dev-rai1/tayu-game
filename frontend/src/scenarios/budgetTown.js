// MODULE 3 - BUDGET TOWN: A DAY IN THE LIFE.
// Each stop presents one tradeoff, then the result explains what changed.

export const RENT_COST = 6
export const FOOD_BUDGET = 6
export const BUS_COST = 2
export const CLINIC_COST = 2
export const FUN_COST = 2
export const MIN_FOODS = 3

export const DAY_INTRO = (amount) =>
  `You earned $${amount}. Cover today's needs, decide whether to spend on a want, and keep something ready for a surprise.`

export const STOPS = {
  house: { title: 'The House', line: `Rent costs $${RENT_COST}. Pay it now or leave housing uncovered.`, button: `Pay rent ($${RENT_COST})`, takeaway: 'Housing used part of the budget, but the family has a safe place to live.', tag: 'NEED' },
  grocery: { title: 'The Grocery', line: `You have $${FOOD_BUDGET}. Feed the family first, then decide whether a treat fits into your budget today.`, button: 'Build my basket', takeaway: 'The basket changes both the family’s day and the money left.', tag: 'NEED' },
  bus: { title: 'The Bus Stop', line: `School rides cost $${BUS_COST}. What happens later if transportation is missing?`, button: `Pay for rides ($${BUS_COST})`, takeaway: 'Planning for transportation prevented a school-day problem.', tag: 'NEED' },
  clinic: { title: 'The Clinic', line: `A checkup costs $${CLINIC_COST}. Decide whether health belongs in the plan.`, button: `Pay for care ($${CLINIC_COST})`, takeaway: 'Health care is covered before optional spending.', tag: 'NEED' },
  fun: { title: 'The Fun Park', line: `The mini-wheel costs $${FUN_COST}. Buy the want now or keep more money for later.`, ride: `Ride now ($${FUN_COST})`, save: 'Keep the money', takeawayRide: 'The want fit into today’s budget after the needs, but it reduced the money left for later.', takeawaySave: 'Skipping the want kept more flexibility for saving and surprises.', tag: 'WANT' },
}

export const NEXT_STOP_TOAST = { house: 'Decision 1: housing.', grocery: 'Decision 2: food basket.', bus: 'Decision 3: transportation.', clinic: 'Decision 4: health care.', fun: 'Decision 5: a want now or money later.' }

export const GROCERY_ITEMS = [
  { id: 'milk', name: 'Milk', cost: 1, need: true }, { id: 'bread', name: 'Bread', cost: 1, need: true }, { id: 'eggs', name: 'Eggs', cost: 2, need: true }, { id: 'apples', name: 'Apples', cost: 1, need: true }, { id: 'veggies', name: 'Veggies', cost: 2, need: true }, { id: 'icepop', name: 'Ice pop', cost: 1, need: false }, { id: 'chips', name: 'Chips', cost: 1, need: false }, { id: 'comic', name: 'Comic', cost: 2, need: false },
]
export const GROCERY_GATE = `Choose at least ${MIN_FOODS} foods without going over $${FOOD_BUDGET}. Add a treat only if it still fits into your budget today.`
export const DAY_SUMMARY = (needs, fun, left) => `Needs cost $${needs}${fun > 0 ? ` and the want cost $${fun}` : '; you skipped the want'}. You have $${left} left. Build a plan that can handle a surprise.`

export const OPTION_CARDS = [
  { id: 'pocket', title: 'POCKET', line: 'Ready for surprises. It stays steady.', color: '#9aa6b8', anim: 'flat' },
  { id: 'bank', title: 'BANK', line: 'Money stored at the bank grows a little, slow and steady.', color: '#1464F0', anim: 'slope' },
  { id: 'bond', title: 'BONDS', line: 'Money you LEND to a government or big company. They promise to pay you back with interest — more than the bank, less wiggle than stocks.', color: '#f0822e', anim: 'slope' },
  { id: 'garden', title: 'MONEY GARDEN', line: 'Money invested for more growth through ownership, with more market risk and more wiggle.', color: '#00b37f', anim: 'wiggle' },
]

export function sliceLine(id, pct) {
  if (id === 'pocket') return `${pct}% is ready for surprises, but it does not grow.`
  if (id === 'bank') return `${pct}% grows slowly with less risk and stays easier to reach.`
  if (id === 'bond') return `${pct}% is in bonds. The borrower promises interest and repayment. It is not as safe as the bank, but it usually wiggles less than stocks.`
  return `${pct}% is in the Money Garden for higher growth potential and higher stock-market risk.`
}

export function splitNudge(split, total) {
  if (split.pocket >= total) return 'Everything is ready now, but nothing is growing. Compare Bank, Bonds, and Money Garden.'
  if (split.garden >= total) return 'Everything is taking stock-market risk. What would pay for a surprise today, and where could steadier choices fit?'
  if (split.bank >= total) return 'Everything is in the bank. Compare access now with bond interest and stock growth.'
  if (split.bond >= total) return 'Everything is being lent through bonds. Keep some ready cash and compare bank safety with stock growth.'
  if (split.pocket === 0) return 'No money is ready for a surprise. Revise the plan before testing it.'
  if (split.pocket < Math.min(2, total)) return 'The ready-cash cushion may not cover the surprise. Check the amount again.'
  if (split.bond === 0) return 'Bonds are the middle ground — steadier than stocks and designed to pay interest. Worth a small share in most plans.'
  if (split.garden > Math.round(total * 0.7)) return 'Most of the plan depends on the stock market. Is that risk balanced?'
  return 'This plan includes ready cash, bank savings, bond lending, and higher-risk stock growth.'
}

export const SPLIT_PROMPT = 'Divide the money among four choices: Pocket, Bank, Bonds, and Money Garden. Use the live feedback, then test whether the plan survives a surprise.'
export const SPLIT_CONFIRM = 'Check the tradeoffs in your four-part plan, then test it.'
export const CARRY_PROMPT = 'Send each part of the plan to its financial home.'
export const CARRY_BANK_DONE = (amount) => `$${amount} moved to the Bank account for slower, steadier growth.`
export const CARRY_BOND_DONE = (amount) => `$${amount} reserved for Bond Street, where you will choose the borrower.`
export const CARRY_GARDEN_DONE = (amount) => `$${amount} moved to the Money Garden account for higher potential growth and higher risk.`
export const EMERGENCY_INTRO = 'A surprise expense appears. The test will show whether enough money was kept ready.'
export const EMERGENCY_EVENT = { label: 'Flat bike tire!', cost: 2 }
export const EMERGENCY_PRAISE = 'Ready cash covered the surprise, so the growing money stayed untouched.'
export const EMERGENCY_REPLAY = 'The plan did not cover the $2 surprise. Return to the controls and revise the ready-cash amount.'

// Supports both the new three-argument four-way call and older two-argument
// callers still present in the legacy state machine while they are being bridged.
export const HANDOFF = (bank, bondOrGarden, gardenMaybe) => {
  const hasBond = gardenMaybe !== undefined
  const bond = hasBond ? bondOrGarden : 'your Bond Street reserve'
  const garden = hasBond ? gardenMaybe : bondOrGarden
  return `Your revised plan kept emergency cash ready, placed $${bank} in the Bank, ${hasBond ? `reserved $${bond} for Bonds` : `saved ${bond} for Bonds`}, and placed $${garden} in the Money Garden.`
}

export function defaultSplit(total) {
  const pocket = Math.max(2, Math.round(total * 0.2))
  const bank = Math.round(total * 0.3)
  const bond = Math.round(total * 0.2)
  return { pocket, bank, bond, garden: Math.max(0, total - pocket - bank - bond) }
}
