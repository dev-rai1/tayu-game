// MODULE 5 - THE MONEY GARDEN.
// Ten decisions are divided into two five-decision parts. Each beat uses a short
// clue, a consequence, and a retry nudge. The mechanics remain unchanged.

import { COMPANIES } from './moneyGarden.js'

export const GOAL_MIN = 42
export const GOAL_RATE = 1.4
export const TOTAL_WEEKS = 10
export const SURPRISE_BILL = 4
export const BANK_DRIP_MIN = 5

export const OPENING = [
  'This is the grow part of your plan. Company-seed values can rise or fall over time.',
  'Mr. Sprout added a $100 investing gift on top of the money you already set aside for the Money Garden.',
  'For each decision, read one clue, adjust the portfolio, and test what happens.',
]

export const COMPANY_CHOICE = {
  prompt: 'Tap each company to compare its business story, then decide how to spread your seeds.',
  lines: {
    toy: 'Toy Town stays busy with customers. That is evidence of a steady business.',
    snack: 'Snack Shack has popular new juice pops. News helps, but check the actual store too.',
    game: 'Game Land can grow quickly, but its price moves sharply in both directions.',
  },
  closing: 'Use customers, business news, and risk as clues. Do not depend on only one company.',
}

export function sliderLine(planted, total) {
  if (planted >= total) return 'Everything is invested. What money would cover a surprise today?'
  if (planted === 0) return 'Nothing is invested, so none of this money can grow in the market.'
  const fraction = planted / total
  if (fraction >= 0.8) return 'Most money is exposed to the market. Check the ready-cash cushion.'
  if (fraction >= 0.4) return 'The plan combines market growth with some ready cash.'
  return 'Most money is protected now, but less is available for market growth.'
}

const ownedIds = (garden) => Object.keys(garden.companies).filter((id) => garden.companies[id].owned > 0)
const mostOwned = (garden) => {
  let best = null
  for (const id of Object.keys(garden.companies)) {
    const company = garden.companies[id]
    if (company.owned > 0 && (!best || company.owned > garden.companies[best].owned)) best = id
  }
  return best
}
const lastRiser = (garden) => {
  let best = null
  let gain = -Infinity
  for (const id of Object.keys(garden.companies)) {
    const history = garden.companies[id].history
    const difference = history.length > 1 ? history[history.length - 1] - history[history.length - 2] : 0
    if (difference > gain) { gain = difference; best = id }
  }
  return best || 'game'
}
const holdingsValue = (garden) => Object.keys(garden.companies).reduce((value, id) => value + garden.companies[id].owned * garden.companies[id].price, 0)
const isSpread = (garden) => {
  const value = holdingsValue(garden)
  if (value === 0) return false
  return Object.keys(garden.companies).every((id) => (garden.companies[id].owned * garden.companies[id].price) / value <= 0.55)
}

export const WEEKS = [
  { n: 1, lesson: 'Use business clues before investing', intro: 'Compare all three company stories. Which details describe business health, and how will you spread the risk?', praise: 'You used company evidence and made a real portfolio choice.', coach: 'The seeds are planted. Watch which business clues match the result.', nudge: 'Next: what happens when one holding falls?', special: 'seeds', learn: 'stocks', ctx: () => ({}), fx: () => ({}), moves: (context, garden) => ({ early: {}, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => garden.companies[id].owned > 0).map((id) => [id, +1])) }), judge: (garden) => Object.keys(garden.companies).some((id) => garden.companies[id].owned > 0) },
  { n: 2, lesson: 'Diversification limits one-company risk', intro: 'One company may fall. Build a mix that does not let one holding control the whole result.', praise: 'Other holdings helped when one company fell.', coach: 'One company controlled the result. On the next plan, spread the exposure.', nudge: 'Next: a price dip without a business change.', learn: 'diversify', ctx: (garden) => { const dip = mostOwned(garden) || 'toy'; return { dip } }, fx: (context) => ({ rain: context.dip }), moves: (context, garden) => ({ early: { [context.dip]: -2 }, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => id !== context.dip).map((id) => [id, +1])) }), judge: (garden) => ownedIds(garden).length >= 2, praiseDynamic: (garden, context) => `When ${COMPANIES[context.dip].name} fell, the other holdings reduced the damage.` },
  { n: 3, lesson: 'A price dip needs context', intro: 'A holding is about to dip and recover. Did the business change, or only the price?', praise: 'You waited for more evidence, and the temporary dip recovered.', coach: 'The holding was sold during the dip, then recovered without you. Check the business before reacting.', nudge: 'Next: use customer activity as research.', learn: 'finbasics', ctx: (garden) => ({ dip: mostOwned(garden) || 'game' }), fx: (context) => ({ dip: context.dip }), moves: (context) => ({ early: { [context.dip]: -2 }, late: { [context.dip]: +3 } }), judge: (garden, action, context) => !((action.sold[context.dip] || 0) > 0 || action.cashout) },
  { n: 4, lesson: 'Customers provide business evidence', intro: 'One store is busy and one is empty. Use customer activity before changing the portfolio.', praise: 'The busy-store evidence matched the stronger result.', coach: 'The empty store weakened. Customer activity was the warning clue.', nudge: 'Next: two low prices with different business stories.', learn: 'research', ctx: () => ({ busy: 'game', dusty: 'snack' }), fx: (context) => ({ busy: context.busy, dusty: context.dusty }), moves: (context) => ({ early: { [context.dusty]: -1 }, late: { [context.busy]: +2 } }), judge: (garden, action, context) => (action.bought[context.busy] || 0) > 0 || ((action.bought[context.dusty] || 0) === 0 && garden.companies[context.busy].owned > 0) },
  { n: 5, lesson: 'Low price and healthy business are different clues', intro: 'Two companies became cheaper. One is still busy; the other is empty. Decide what the low prices mean.', praise: 'You combined price with business health instead of using price alone.', coach: 'The cheap but empty business kept weakening. A low price needs supporting evidence.', nudge: 'Part 1 complete. Next: surprises, warning signs, and patience.', learn: 'research', ctx: () => ({ saleBusy: 'toy', saleEmpty: 'snack' }), pre: (context) => ({ [context.saleBusy]: -2, [context.saleEmpty]: -2 }), fx: (context) => ({ sale: context.saleBusy, sale2: context.saleEmpty, busy: context.saleBusy, dusty: context.saleEmpty }), moves: (context) => ({ early: {}, late: { [context.saleBusy]: +3, [context.saleEmpty]: -1 } }), judge: (garden, action, context) => (action.bought[context.saleBusy] || 0) > 0 && (action.bought[context.saleEmpty] || 0) === 0 },
  { n: 6, lesson: 'Ready cash protects long-term investments', intro: 'A surprise bill may arrive before the market has time to recover. Check the Pocket amount.', praise: 'Ready cash paid the bill, so the investments stayed in place.', coach: 'The bill forced an early sale. Ready cash protects long-term plans from short-term needs.', nudge: 'Next: a company shows serious warning signs.', learn: 'longterm', special: 'surprise', ctx: (garden) => ({ held: ownedIds(garden) }), fx: () => ({ envelope: true }), moves: (context) => ({ early: {}, late: Object.fromEntries(context.held.map((id) => [id, +2])) }), judge: (garden, action, context, extra) => extra?.billPaid !== 'forced' },
  { n: 7, lesson: 'Business warnings can justify a change', intro: 'One store has empty aisles, damaged signs, and falling activity. Decide whether the business evidence changed.', praise: 'You responded to a real business warning rather than a small price wiggle.', coach: 'The business closed. The warning signs mattered more than hope.', nudge: 'Next: a fast price jump creates hype.', learn: 'risk', special: 'bankrupt', ctx: () => ({ shabby: 'snack' }), fx: (context) => ({ shabby: context.shabby }), moves: (context, garden) => ({ early: { [context.shabby]: -2 }, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => id !== context.shabby).map((id) => [id, +1])) }), judge: (garden, action, context, extra) => !extra?.lostShares },
  { n: 8, lesson: 'Hype is not business evidence', intro: 'A company price jumped and the town is excited. What evidence, besides the jump, supports buying it?', praise: 'You did not let excitement replace research.', coach: 'The purchase happened after the jump, and the price fell. Recent excitement was not enough evidence.', nudge: 'Next: compare steady performance with dramatic moves.', learn: 'finbasics', ctx: (garden) => ({ hot: lastRiser(garden) }), pre: (context) => ({ [context.hot]: +2 }), fx: (context) => ({ balloon: context.hot }), moves: (context) => ({ early: {}, late: { [context.hot]: -3 } }), judge: (garden, action, context) => (action.bought[context.hot] || 0) === 0 },
  { n: 9, lesson: 'Steady performance can matter more than one flashy move', intro: 'One company has been steady while the others move sharply. Compare several weeks, not only the latest change.', praise: 'The steady holding supported the portfolio while the flashy moves reversed.', coach: 'The dramatic moves ended near where they began. Compare performance across time.', nudge: 'Next: check whether one holding became too large.', learn: 'longterm', ctx: () => ({ quiet: 'toy', flashy: ['game', 'snack'] }), fx: (context) => ({ star: context.quiet }), moves: (context) => ({ early: { [context.quiet]: +1, [context.flashy[0]]: +2, [context.flashy[1]]: +1 }, late: { [context.quiet]: +1, [context.flashy[0]]: -2, [context.flashy[1]]: -1 } }), judge: (garden, action, context) => garden.companies[context.quiet].owned > 0 },
  { n: 10, lesson: 'Rebalancing restores the intended risk', intro: 'Growth may have made one holding much larger than the others. Check the percentages and decide whether to rebalance.', praise: 'The portfolio no longer depends too heavily on one company.', coach: 'One holding still controls most of the result. Compare its share with the rest of the portfolio.', nudge: 'The two-part Money Garden is ready for harvest.', learn: 'allocation', special: 'rebalance', ctx: () => ({}), fx: () => ({}), moves: (context, garden) => ({ early: {}, late: Object.fromEntries(ownedIds(garden).map((id) => [id, +1])) }), judge: (garden) => isSpread(garden) },
]

export const OVERTIME = { lesson: 'A spread-out plan can grow gradually', intro: 'You are close to the goal. Check the balance, make one change if needed, and test another week.', praise: 'The spread-out plan grew again.', coach: 'One holding still has too much control. Review the percentages.', nudge: 'The harvest is close.', learn: 'diversify', ctx: (garden) => ({ held: ownedIds(garden) }), fx: () => ({}), moves: (context) => ({ early: {}, late: Object.fromEntries(context.held.map((id) => [id, +2])) }), judge: (garden) => isSpread(garden) }

export function weekSpec(week) { return week <= TOTAL_WEEKS ? WEEKS[week - 1] : OVERTIME }

export const COMPLETION_LINE = (goal) => `$${goal}. You researched, diversified, kept ready cash, responded to evidence, and rebalanced. Real investing moves more slowly and still involves risk.`
export const BRIDGE_LINE = 'You earned, budgeted, banked, and invested the same money. Follow the path to the finale.'
