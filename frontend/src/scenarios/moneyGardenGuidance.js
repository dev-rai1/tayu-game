// Decision prompts for public Module 6, Money Garden. Each prompt names the
// investing concept being practiced, then asks the player to apply it without
// revealing the exact company or trade they should make.

export const MONEY_GARDEN_PARTS = [
  {
    part: 1,
    title: 'Investing Foundations',
    weeks: [1, 2, 3, 4, 5],
    goal: 'Understand stock ownership, research businesses, spread concentration risk, and separate business evidence from price alone.',
  },
  {
    part: 2,
    title: 'Markets, Risk, and Patience',
    weeks: [6, 7, 8, 9, 10],
    goal: 'Match risk to time horizon, protect emergency money, respond to real evidence, resist hype, and rebalance.',
  },
]

export const MONEY_GARDEN_FLOW = [
  '1. Learn the concept.',
  '2. Read the evidence.',
  '3. Make one change.',
  '4. Test and explain the result.',
]

export const MONEY_GARDEN_DECISIONS = {
  1: { title: 'Stocks are pieces of ownership', instruction: 'A share is one small ownership unit of a company. Compare the businesses first, then choose based on evidence instead of guessing which price moves next.' },
  2: { title: 'Diversification spreads risk', instruction: 'Diversification means not depending on one investment. Build a mix so one company falling does not control the whole result. It reduces risk, but cannot erase it.' },
  3: { title: 'Price is not the whole business', instruction: 'A price can move even when the company has not changed. Before selling after a dip, ask whether new business evidence changed your reason for owning it.' },
  4: { title: 'Research the company behind the stock', instruction: 'Research uses credible evidence about the business. Compare customer activity here, then connect that clue to the company instead of reacting to price alone.' },
  5: { title: 'Cheap does not automatically mean good', instruction: 'A lower price can be an opportunity or a warning. Compare the price with business health before deciding whether the investment is actually more attractive.' },
  6: { title: 'Match risk to your time horizon', instruction: 'Your time horizon is how long until you need the money. Keep short-term needs ready so a surprise does not force you to sell a long-term investment at a bad time.' },
  7: { title: 'Patience still requires new evidence', instruction: 'Patience is not ignoring a weakening business. Look for evidence that the company itself changed, then decide whether your original reason for owning it still holds.' },
  8: { title: 'Do not chase hype', instruction: 'A recent price jump is not proof of future returns. Ask what credible business evidence supports the excitement before buying because everyone else is excited.' },
  9: { title: 'Use a longer view', instruction: 'One dramatic week can reverse. Compare several periods and the investment goal so short-term noise does not control a long-term decision.' },
  10: { title: 'Rebalance back to the intended mix', instruction: 'Rebalancing means adjusting holdings after prices change so the portfolio returns closer to its planned balance and risk. Check whether one company has become too large.' },
}

export function moneyGardenPart(week) {
  return week <= 5 ? MONEY_GARDEN_PARTS[0] : MONEY_GARDEN_PARTS[1]
}

export function shouldPauseBetweenGardenParts(week, partTwoStarted) {
  return Number(week) === 6 && !partTwoStarted
}

export function moneyGardenDecision(week) {
  return MONEY_GARDEN_DECISIONS[week] || {
    title: 'Use evidence and keep the plan balanced',
    instruction: 'Compare business evidence, concentration, time horizon, and ready cash before changing one part of the portfolio.',
  }
}
