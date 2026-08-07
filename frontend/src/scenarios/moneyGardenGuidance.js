// Decision prompts for the Money Garden. These prompts identify the question to
// investigate without revealing the exact company or trade the player should make.

export const MONEY_GARDEN_STARTER_GIFT = 100

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100

export function applyStarterInvestingGift(garden) {
  if (!garden || garden.starterGiftApplied) return garden
  const gift = MONEY_GARDEN_STARTER_GIFT
  return {
    ...garden,
    cash: roundMoney((garden.cash || 0) + gift),
    startTotal: roundMoney((garden.startTotal ?? garden.cash ?? 0) + gift),
    // Keep the original required growth the same instead of making the bonus
    // itself create a much harder target.
    goal: roundMoney((garden.goal || 0) + gift),
    starterGift: gift,
    starterGiftApplied: true,
  }
}

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
  '1. Read one clue.',
  '2. Make one evidence-based change.',
  '3. Test your choice, then see the lesson.',
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

const COMPANY_NAMES = {
  toy: 'Toy Town',
  snack: 'Snack Shack',
  game: 'Game Land',
}

const companyName = (id) => COMPANY_NAMES[id] || 'This company'
const money = (value) => Number.isFinite(Number(value)) ? `$${Math.round(Number(value) * 100) / 100}` : '$0'

function largestHolding(mg) {
  const companies = mg?.companies || {}
  let total = 0
  let largest = null
  let largestValue = 0

  for (const [id, company] of Object.entries(companies)) {
    const value = Math.max(0, Number(company?.owned || 0) * Number(company?.price || 0))
    total += value
    if (value > largestValue) {
      largestValue = value
      largest = id
    }
  }

  if (!largest || total <= 0) return null
  return { id: largest, percent: Math.round((largestValue / total) * 100) }
}

// Screen-sized evidence for each decision. The UI reveals these entries one at
// a time so the 3D world remains readable instead of being buried by a modal.
export function moneyGardenClues(week, mg = {}) {
  const fx = mg?.fx || {}

  switch (Number(week)) {
    case 1:
      return [
        'Toy Town has steady customer activity. That is evidence about the business.',
        'Snack Shack has exciting product news, but news alone does not prove a business is healthy.',
        'Game Land can move up or down quickly, so it brings more price risk.',
      ]
    case 2:
      return [`${companyName(fx.rain)} may fall this week. Notice how much of your plan depends on it.`]
    case 3:
      return [
        `${companyName(fx.dip)} has a price dip on screen.`,
        'There is no new warning that the business itself became weaker.',
      ]
    case 4:
      return [
        `${companyName(fx.busy)} is PACKED — lots of customers are showing up.`,
        `${companyName(fx.dusty)} is EMPTY — very few customers are showing up.`,
      ]
    case 5:
      return [
        `${companyName(fx.busy || fx.sale)} is on SALE and PACKED — the price is lower while customers are still active.`,
        `${companyName(fx.dusty || fx.sale2)} is on SALE and EMPTY — the price is lower while customer activity is weak.`,
      ]
    case 6:
      return [
        `Pocket money ready right now: ${money(mg?.pocket)}.`,
        'A surprise bill can arrive before an investment has time to recover.',
      ]
    case 7:
      return [
        `${companyName(fx.shabby)} shows EMPTY aisles, damaged signs, and falling activity.`,
        'Those are business warning signs, not just a small price wiggle.',
      ]
    case 8:
      return [
        `${companyName(fx.balloon)} just had a big price jump and the town is excited.`,
        'A price jump is not the same thing as new evidence about the business.',
      ]
    case 9:
      return [
        `${companyName(fx.star)} has been steadier across several weeks.`,
        'Compare the pattern over time instead of judging only the latest move.',
      ]
    case 10: {
      const largest = largestHolding(mg)
      return largest
        ? [`${companyName(largest.id)} is about ${largest.percent}% of your invested company value.`]
        : ['No company currently dominates the invested part of your plan.']
    }
    default:
      return ['Use the evidence visible in the world before changing your plan.']
  }
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
