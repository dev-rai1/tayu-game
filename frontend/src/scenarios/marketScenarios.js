// MODULE 6 - THE MONEY GARDEN.
// Ten decisions are divided into two five-decision parts. Each beat explicitly
// teaches one investing idea, then lets the player test it with a short clue,
// consequence, and retry nudge. The mechanics remain unchanged.

import { COMPANIES } from './moneyGarden.js'

export const GOAL_MIN = 42
export const GOAL_RATE = 1.4
export const TOTAL_WEEKS = 10
export const SURPRISE_BILL = 4
export const BANK_DRIP_MIN = 5

export const OPENING = [
  'You start the Money Garden with zero company shares. A stock is a small ownership piece of a company, and your first goal is to build a small diversified mix instead of relying on one company.',
  'Mr. Sprout added a $100 investing gift on top of the money you already set aside. READY TO INVEST cash buys shares.',
  'Pocket stays ready for surprises; Bank Sprout grows more steadily. Compare the business clues, then buy at least one share in two different companies first.',
]

export const COMPANY_CHOICE = {
  prompt: 'Tap each company to compare its business story, then decide how to spread your seeds.',
  lines: {
    toy: 'Toy Town stays busy with customers. That is evidence about the business, not a guarantee that its stock price will rise.',
    snack: 'Snack Shack has popular new juice pops. News can be useful evidence, but one headline is never a promise about the next price move.',
    game: 'Game Land can grow quickly, but its price also moves sharply. Bigger possible gains can come with bigger short-term losses.',
  },
  closing: 'Use customers, business news, price history, and risk as clues. Research before buying, and do not depend on only one company.',
}

export function sliderLine(planted, total) {
  if (planted >= total) return 'Everything is invested. What ready money would cover a surprise without forcing you to sell?'
  if (planted === 0) return 'Nothing is invested, so none of this money participates in possible market growth.'
  const fraction = planted / total
  if (fraction >= 0.8) return 'Most money is exposed to market risk. Check whether the ready-cash cushion matches your short-term needs.'
  if (fraction >= 0.4) return 'The plan combines possible market growth with some ready cash for shorter-term needs.'
  return 'Most money is protected from market swings now, but less is participating in possible long-term market growth.'
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
  { n: 1, lesson: 'Diversification starts with more than one company', intro: 'You own zero shares. Use READY TO INVEST cash to buy at least one share in two different companies, so one company does not control the whole garden.', praise: 'You built your first diversified portfolio instead of depending on only one company.', coach: 'You need shares in at least two different companies before testing diversification.', nudge: 'Next: watch what happens when one holding falls.', special: 'seeds', learn: 'diversifyYouth', ctx: () => ({}), fx: () => ({}), moves: (context, garden) => ({ early: {}, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => garden.companies[id].owned > 0).map((id) => [id, +1])) }), judge: (garden) => ownedIds(garden).length >= 2 },
  { n: 2, lesson: 'Diversification spreads concentration risk', intro: 'Diversification means spreading money across investments that can behave differently. It cannot prevent every loss, but it can reduce the damage if one company has a bad result.', praise: 'Other holdings helped reduce the effect when one company fell. That is diversification at work.', coach: 'One company controlled too much of the result. Spread the exposure so one holding matters less.', nudge: 'Next: separate a normal price dip from a real business problem.', learn: 'diversifyYouth', ctx: (garden) => { const dip = mostOwned(garden) || 'toy'; return { dip } }, fx: (context) => ({ rain: context.dip }), moves: (context, garden) => ({ early: { [context.dip]: -2 }, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => id !== context.dip).map((id) => [id, +1])) }), judge: (garden) => ownedIds(garden).length >= 2, praiseDynamic: (garden, context) => `When ${COMPANIES[context.dip].name} fell, the other holdings reduced the damage instead of guaranteeing safety.` },
  { n: 3, lesson: 'Price movement and business health are different', intro: 'A market price can change even when the company itself has not changed. Before selling after a dip, ask whether new evidence changed the business or whether the price simply moved.', praise: 'You waited for more evidence, and this pretend dip recovered. Patience can prevent emotional selling, although real investments are never guaranteed to recover.', coach: 'The holding was sold during a temporary dip, then recovered in this scenario. Check the business evidence before reacting to a price move.', nudge: 'Next: use customer activity as one piece of research.', learn: 'risk', ctx: (garden) => ({ dip: mostOwned(garden) || 'game' }), fx: (context) => ({ dip: context.dip }), moves: (context) => ({ early: { [context.dip]: -2 }, late: { [context.dip]: +3 } }), judge: (garden, action, context) => !((action.sold[context.dip] || 0) > 0 || action.cashout) },
  { n: 4, lesson: 'Research looks for evidence about the business', intro: 'Research means checking information that can help you understand a company, such as customers, products, financial results, competition, and credible news. Here, customer activity is one clue.', praise: 'You used a business clue instead of looking only at the stock price.', coach: 'The empty store weakened. The customer activity was useful evidence about the business.', nudge: 'Next: learn why a lower price does not automatically mean a bargain.', learn: 'research', ctx: () => ({ busy: 'game', dusty: 'snack' }), fx: (context) => ({ busy: context.busy, dusty: context.dusty }), moves: (context) => ({ early: { [context.dusty]: -1 }, late: { [context.busy]: +2 } }), judge: (garden, action, context) => (action.bought[context.busy] || 0) > 0 || ((action.bought[context.dusty] || 0) === 0 && garden.companies[context.busy].owned > 0) },
  { n: 5, lesson: 'A low price is not the same as a good investment', intro: 'A stock can be cheaper because of a temporary market move or because the business is weakening. Compare price with business evidence before deciding whether cheaper really means better value.', praise: 'You combined price with business health instead of assuming every low price was a bargain.', coach: 'The cheap but empty business kept weakening. Price alone did not tell the whole story.', nudge: 'Module 6A complete. Next: time horizon, warning signs, hype, patience, and rebalancing in Module 6B.', learn: 'research', ctx: () => ({ saleBusy: 'toy', saleEmpty: 'snack' }), pre: (context) => ({ [context.saleBusy]: -2, [context.saleEmpty]: -2 }), fx: (context) => ({ sale: context.saleBusy, sale2: context.saleEmpty, busy: context.saleBusy, dusty: context.saleEmpty }), moves: (context) => ({ early: {}, late: { [context.saleBusy]: +3, [context.saleEmpty]: -1 } }), judge: (garden, action, context) => (action.bought[context.saleBusy] || 0) > 0 && (action.bought[context.saleEmpty] || 0) === 0 },
  { n: 6, lesson: 'Time horizon decides which money can handle market risk', intro: 'Your time horizon is how long until you need the money. A surprise bill is a short-term need, so ready cash can protect long-term investments from being sold just because cash is needed today.', praise: 'Ready cash paid the bill, so the investments did not have to be sold for a short-term need.', coach: 'The bill forced an early sale. Keep short-term money ready so long-term investments have more time to ride market changes.', nudge: 'Next: learn when new business evidence really can justify changing a holding.', learn: 'timeHorizon', special: 'surprise', ctx: (garden) => ({ held: ownedIds(garden) }), fx: () => ({ envelope: true }), moves: (context) => ({ early: {}, late: Object.fromEntries(context.held.map((id) => [id, +2])) }), judge: (garden, action, context, extra) => extra?.billPaid !== 'forced' },
  { n: 7, lesson: 'New business evidence can change the investment case', intro: 'Patience does not mean ignoring serious warning signs. If the business itself weakens, your reason for owning it may change and selling can be a rational response.', praise: 'You responded to a real change in the business instead of reacting to a small price wiggle.', coach: 'The business closed in this scenario. The warning signs mattered more than simply hoping the price would recover.', nudge: 'Next: separate a fast price jump from real business evidence.', learn: 'risk', special: 'bankrupt', ctx: () => ({ shabby: 'snack' }), fx: (context) => ({ shabby: context.shabby }), moves: (context, garden) => ({ early: { [context.shabby]: -2 }, late: Object.fromEntries(Object.keys(garden.companies).filter((id) => id !== context.shabby).map((id) => [id, +1])) }), judge: (garden, action, context, extra) => !extra?.lostShares },
  { n: 8, lesson: 'Hype and recent price gains are not research', intro: 'Chasing a stock only because its price just jumped is performance chasing. Ask what credible business evidence supports the price before buying because of excitement or fear of missing out.', praise: 'You did not let a recent price jump replace research.', coach: 'The purchase happened after the jump, and the price fell in this scenario. Recent excitement alone was not enough evidence.', nudge: 'Next: compare several periods instead of one flashy move.', learn: 'research', ctx: (garden) => ({ hot: lastRiser(garden) }), pre: (context) => ({ [context.hot]: +2 }), fx: (context) => ({ balloon: context.hot }), moves: (context) => ({ early: {}, late: { [context.hot]: -3 } }), judge: (garden, action, context) => (action.bought[context.hot] || 0) === 0 },
  { n: 9, lesson: 'A longer time horizon puts one-week moves in context', intro: 'One dramatic week can look important but may reverse quickly. Compare a longer history and ask whether the investment still fits the goal instead of judging it by the latest move.', praise: 'You looked beyond one flashy move and kept a holding that supported the portfolio across several periods.', coach: 'The dramatic moves ended near where they began. A longer time horizon gives short-term movement more context.', nudge: 'Next: check whether growth made one holding too large.', learn: 'longterm', ctx: () => ({ quiet: 'toy', flashy: ['game', 'snack'] }), fx: (context) => ({ star: context.quiet }), moves: (context) => ({ early: { [context.quiet]: +1, [context.flashy[0]]: +2, [context.flashy[1]]: +1 }, late: { [context.quiet]: +1, [context.flashy[0]]: -2, [context.flashy[1]]: -1 } }), judge: (garden, action, context) => garden.companies[context.quiet].owned > 0 },
  { n: 10, lesson: 'Rebalancing restores the portfolio to its intended mix', intro: 'Rebalancing means adjusting holdings after prices change so the portfolio returns closer to its planned mix and risk level. Check whether one company has grown into too much of the portfolio.', praise: 'You reduced concentration so the portfolio no longer depends too heavily on one company.', coach: 'One holding still controls most of the result. Rebalancing is about restoring the planned mix, not predicting which stock wins next.', nudge: 'The two-part Money Garden is ready for harvest.', learn: 'rebalance', special: 'rebalance', ctx: () => ({}), fx: () => ({}), moves: (context, garden) => ({ early: {}, late: Object.fromEntries(ownedIds(garden).map((id) => [id, +1])) }), judge: (garden) => isSpread(garden) },
]

export const OVERTIME = { lesson: 'A diversified plan can grow gradually, but growth is never guaranteed', intro: 'You are close to the goal. Check concentration, business evidence, and ready cash, then make one change only if it improves the plan.', praise: 'The spread-out plan grew again in this simulation.', coach: 'One holding still has too much control. Review the percentages and the reason for each holding.', nudge: 'The harvest is close.', learn: 'diversify', ctx: (garden) => ({ held: ownedIds(garden) }), fx: () => ({}), moves: (context) => ({ early: {}, late: Object.fromEntries(context.held.map((id) => [id, +2])) }), judge: (garden) => isSpread(garden) }

export function weekSpec(week) { return week <= TOTAL_WEEKS ? WEEKS[week - 1] : OVERTIME }

export const COMPLETION_LINE = (goal) => `$${goal}. You learned what stocks represent, researched businesses, diversified, matched risk to your time horizon, kept ready cash, resisted hype, and rebalanced. Real investing is slower, uncertain, and never guarantees a gain.`
export const BRIDGE_LINE = 'You earned, budgeted, banked, and invested the same money. Follow the path to the finale.'
