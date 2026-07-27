// MODULE 3 - BUDGET TOWN v5: A DAY IN THE LIFE.
// Every choice now names the tradeoff, gives immediate outcome-based feedback,
// and asks the player to revise plans that leave core needs or emergency cash uncovered.

export const RENT_COST = 6
export const FOOD_BUDGET = 6
export const BUS_COST = 2
export const CLINIC_COST = 2
export const FUN_COST = 2
export const MIN_FOODS = 3

export const DAY_INTRO = (amt) =>
  `You arrive with $${amt} - nicely earned! Today you will make real budget choices. Cover needs first, decide which wants are worth it, and keep enough for a surprise. Each decision changes what happens next.`

export const STOPS = {
  house: {
    title: 'The House',
    line: `Your family needs a safe place to live. Rent costs $${RENT_COST}. Paying it leaves less for later, but skipping it means the family has no home.`,
    button: `Cover this need ($${RENT_COST})`,
    takeaway: 'Good decision: shelter is a NEED and belongs near the top of a budget.',
    tag: 'NEED',
  },
  grocery: {
    title: 'The Grocery',
    line: `You have $${FOOD_BUDGET} for food. Choose enough real food first. Treats are allowed only when the family is fed and the total still fits your budget.`,
    button: 'Build my basket',
    takeaway: 'Your basket affects both the family and the money left for the rest of the day.',
    tag: 'NEED',
  },
  bus: {
    title: 'The Bus Stop',
    line: `A week of school rides costs $${BUS_COST}. This is a need because it gets the kids to school.`,
    button: `Cover transportation ($${BUS_COST})`,
    takeaway: 'Transportation is a NEED. Planning for it prevents a problem later.',
    tag: 'NEED',
  },
  clinic: {
    title: 'The Clinic',
    line: `A checkup costs $${CLINIC_COST}. Paying now protects the family's health and keeps the budget ready for care.`,
    button: `Cover health care ($${CLINIC_COST})`,
    takeaway: 'Health care is a NEED you plan for before optional spending.',
    tag: 'NEED',
  },
  fun: {
    title: 'The Fun Park',
    line: `Every need is covered. The mini-wheel costs $${FUN_COST}. You may enjoy it now or keep the money for your future and emergencies. Both choices have a different outcome.`,
    ride: `Enjoy the want ($${FUN_COST})`,
    save: 'Keep the money',
    takeawayRide: 'You chose a want after covering every need. That works when the rest of the plan still stays safe.',
    takeawaySave: 'You delayed a want and kept more flexibility for saving or surprises.',
    tag: 'WANT',
  },
}

export const NEXT_STOP_TOAST = {
  house: 'Decision 1: cover housing first.',
  grocery: 'Decision 2: build a food basket that fits the limit.',
  bus: 'Decision 3: plan for transportation.',
  clinic: 'Decision 4: protect the health budget.',
  fun: 'Decision 5: compare a want today with more money later.',
}

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
export const GROCERY_GATE = `Your basket is not ready yet. Choose at least ${MIN_FOODS} real foods, stay within $${FOOD_BUDGET}, and only add a treat if the family is fed first.`

export const DAY_SUMMARY = (needs, fun, left) =>
  `Here is the result of your decisions: needs used $${needs}${fun > 0 ? `, your want used $${fun}` : ', and you skipped the optional want'}. You have $${left} left. Now decide how much stays ready, how much grows safely, and how much takes more risk. Your split will be tested by a surprise.`

export const OPTION_CARDS = [
  { id: 'pocket', title: 'POCKET', line: 'Ready cash for surprises. It stays steady but does not grow.', color: '#9aa6b8', anim: 'flat' },
  { id: 'bank', title: 'BANK', line: 'Safer long-term money. It grows slowly and stays available later.', color: '#1464F0', anim: 'slope' },
  { id: 'garden', title: 'MONEY GARDEN', line: 'Higher growth potential with real risk. It may rise or fall.', color: '#00b37f', anim: 'wiggle' },
]

export function sliceLine(id, pct) {
  if (id === 'pocket') return `${pct}% is ready for emergencies. More pocket money is safer now, but it will not grow.`
  if (id === 'bank') return `${pct}% is in the bank. This part grows slowly and steadily.`
  return `${pct}% is in the Money Garden. This part may grow more, but it can also lose value.`
}

export function splitNudge(split, total) {
  if (split.pocket >= total) return 'Redo this plan: all pocket money leaves nothing growing. Move some money to the bank or garden.'
  if (split.garden >= total) return 'Redo this plan: all garden money leaves nothing ready for a surprise. Keep at least a little in your pocket.'
  if (split.bank >= total) return 'Redo this plan: the bank is safer, but you still need ready emergency cash and may choose some growth.'
  if (split.bank === 0 && split.garden === 0) return 'Your money is only sitting in your pocket. Move some to a place where it can grow.'
  if (split.pocket === 0) return 'Your plan has no emergency cash. Move at least $2 into Pocket before continuing.'
  if (split.pocket < Math.min(2, total)) return 'Your emergency cushion is too small for the surprise ahead. Put at least $2 in Pocket.'
  if (split.garden > Math.round(total * 0.7)) return 'Most of your money is taking risk. Consider moving some to Pocket or Bank.'
  return 'Balanced plan: you have money ready now, safer growth, and higher-risk growth.'
}

export const SPLIT_PROMPT = 'Build a plan that can survive a surprise: keep at least $2 in Pocket, then divide the rest between Bank and Money Garden. Read the feedback as you move each slider.'
export const SPLIT_CONFIRM = "Here is the result of your budget decision. Check that you have emergency cash before sending the money."

export const CARRY_PROMPT = 'Your plan is ready. Send the BANK money to the bank and the GARDEN money to the garden.'
export const CARRY_BANK_DONE = (amt) => `$${amt} moved to the bank for slower, steadier growth.`
export const CARRY_GARDEN_DONE = (amt) => `$${amt} moved to the Money Garden for higher potential growth and higher risk.`

export const EMERGENCY_INTRO = "Now your plan gets tested. A surprise expense appears. Pocket money is what protects the rest of your plan from being interrupted."
export const EMERGENCY_EVENT = { label: 'Flat bike tire!', cost: 2 }
export const EMERGENCY_PRAISE = 'Your decision worked: the pocket money covered the surprise, so your bank and garden money stayed untouched.'
export const EMERGENCY_REPLAY = 'Your plan did not leave enough ready cash for the $2 surprise. Return to the sliders, put at least $2 in Pocket, and adjust Bank and Garden so the total still matches.'

export const HANDOFF = (bank, garden) =>
  `Your revised budget works. You kept emergency cash ready, placed $${bank} in the bank, and chose $${garden} for the Money Garden. Next, learn what happens to each part.`

export function defaultSplit(total) {
  const pocket = Math.max(2, Math.round(total * 0.2))
  const bank = Math.round(total * 0.35)
  return { pocket, bank, garden: total - pocket - bank }
}
