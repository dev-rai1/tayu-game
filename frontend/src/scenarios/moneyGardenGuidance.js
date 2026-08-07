// Decision prompts for the Money Garden. Each decision separates the reason
// behind the lesson from the concrete action the player should take next.
// Actions explain the controls without prescribing one exact company trade.

export const MONEY_GARDEN_PARTS = [
  {
    part: 1,
    title: 'Investing Foundations',
    weeks: [1, 2, 3, 4, 5],
    goal: 'Build a diversified first portfolio, research businesses, and separate evidence from price alone.',
  },
  {
    part: 2,
    title: 'Markets, Risk, and Patience',
    weeks: [6, 7, 8, 9, 10],
    goal: 'Protect emergency money, respond to new evidence, resist hype, and rebalance.',
  },
]

export const MONEY_GARDEN_FLOW = [
  '1. Learn why.',
  '2. Do the action.',
  '3. Check your mix.',
  '4. Start the week.',
]

export const MONEY_GARDEN_DECISIONS = {
  1: {
    title: 'First: build a diversified garden',
    why: 'Diversification means not depending on only one company. You start with zero company shares, so the first job is to build a small mix.',
    instruction: 'Use READY TO INVEST cash to buy at least 1 share in 2 different companies. If money is in Pocket or Bank Sprout, Take $1 moves it back to READY TO INVEST.',
  },
  2: {
    title: 'See why diversification helps',
    why: 'If one company falls, other holdings can reduce how much that one drop controls your whole result.',
    instruction: 'Open My Portfolio and check how many companies you own. Keep at least 2 different companies instead of putting everything into one.',
  },
  3: {
    title: 'A price dip needs context',
    why: 'A falling price does not automatically mean the business became worse. Business evidence matters too.',
    instruction: 'Check the company story before changing anything. Compare what happened to the business with what happened only to its price.',
  },
  4: {
    title: 'Customers are evidence',
    why: 'Customer activity can show whether a business is actually healthy instead of asking you to guess from price alone.',
    instruction: 'Compare the storefront activity, then use Buy or Sell only after deciding which business looks healthier from the evidence.',
  },
  5: {
    title: 'Cheap is not the same as healthy',
    why: 'A low price can be an opportunity or a warning. The business behind the price tells you more.',
    instruction: 'Compare the two cheaper companies. Use the business clues to decide whether either deserves more of your READY TO INVEST cash.',
  },
  6: {
    title: 'Keep money ready for surprises',
    why: 'A surprise bill can arrive before investments recover, so some money should stay easy to reach.',
    instruction: 'Check Pocket before starting the week. Tuck $1 moves READY TO INVEST cash into Pocket; Take $1 brings Pocket money back when you want to invest it.',
  },
  7: {
    title: 'New warnings can change the plan',
    why: 'A real change in the business can be a stronger reason to act than a small price movement.',
    instruction: 'Find the company with the new business warning. Compare that evidence with your holdings, then use Buy or Sell if your plan should change.',
  },
  8: {
    title: 'Price excitement is not research',
    why: 'A fast price jump can create hype even when the business itself has not improved.',
    instruction: 'Before buying after the jump, look for business evidence that supports it. If the only clue is the price jump, keep reviewing instead of chasing it.',
  },
  9: {
    title: 'Compare steady and flashy results',
    why: 'Several weeks of steady support can matter more than one dramatic move.',
    instruction: 'Compare the companies across multiple weeks, then check whether your portfolio still reflects the evidence instead of only the latest move.',
  },
  10: {
    title: 'Check concentration risk',
    why: 'A portfolio can become risky again if one holding grows until it controls too much of the total.',
    instruction: 'Check which holding is largest. If one company dominates the garden, use Sell and Buy to spread the portfolio more evenly before starting the week.',
  },
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
    why: 'Investing decisions should connect business evidence, portfolio balance, and money you may need soon.',
    instruction: 'Compare the clues, your holdings, Pocket, Bank Sprout, and READY TO INVEST cash before making one clear change.',
  }
}
