// Decision prompts for the Money Garden. These prompts identify the question to
// investigate without revealing the exact company or trade the player should make.

export const MONEY_GARDEN_PARTS = [
  {
    part: 1,
    title: 'Investing Foundations',
    weeks: [1, 2, 3, 4, 5],
    goal: 'Research businesses, spread risk, and separate evidence from price alone.',
  },
  {
    part: 2,
    title: 'Markets, Risk, and Patience',
    weeks: [6, 7, 8, 9, 10],
    goal: 'Protect emergency money, respond to new evidence, resist hype, and rebalance.',
  },
]

export const MONEY_GARDEN_FLOW = [
  '1. Read the clue.',
  '2. Make one evidence-based change.',
  '3. Test your choice and continue.',
]

export const MONEY_GARDEN_DECISIONS = {
  1: { title: 'Research before planting', instruction: 'Compare the company stories. Which details describe the businesses, and how can you avoid depending on only one?' },
  2: { title: 'Test diversification', instruction: 'Imagine one company falls. What mix would stop that single result from controlling the whole garden?' },
  3: { title: 'A price dip needs context', instruction: 'Did the business itself change, or did only the price move? Use that difference before changing the portfolio.' },
  4: { title: 'Customers are evidence', instruction: 'Compare the storefront activity. Which company appears healthier based on customers rather than price alone?' },
  5: { title: 'Cheap is not the same as healthy', instruction: 'A low price can be an opportunity or a warning. Which business clues help you tell the difference?' },
  6: { title: 'Protect the plan from surprises', instruction: 'A bill may arrive before investments recover. How much should remain ready instead of exposed to the market?' },
  7: { title: 'New warnings change a decision', instruction: 'Look for evidence that a company’s business weakened. Which holding now creates the greatest risk?' },
  8: { title: 'Price excitement is not research', instruction: 'A company just jumped. What business evidence would justify buying, and what would make the move only hype?' },
  9: { title: 'Compare steady and flashy results', instruction: 'Which company has supported the portfolio over several weeks instead of only producing one dramatic move?' },
  10: { title: 'Check concentration risk', instruction: 'What percentage depends on the largest holding? Adjust only if one company has too much control over the outcome.' },
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
    instruction: 'Compare business clues, portfolio balance, and ready cash before changing one part of the plan.',
  }
}
