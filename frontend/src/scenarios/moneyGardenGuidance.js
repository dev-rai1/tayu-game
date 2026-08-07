// Money Garden guidance: Module 6A builds investing foundations and Module 6B
// adds market risk, patience, ready cash, and rebalancing. Each decision keeps
// the reason separate from the concrete action and reveals evidence one clue at
// a time before the portfolio opens.

export const MONEY_GARDEN_STARTER_GIFT = 100

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100

export function applyStarterInvestingGift(garden) {
  if (!garden || garden.starterGiftApplied) return garden
  const gift = MONEY_GARDEN_STARTER_GIFT
  return {
    ...garden,
    cash: roundMoney((garden.cash || 0) + gift),
    startTotal: roundMoney((garden.startTotal ?? garden.cash ?? 0) + gift),
    goal: roundMoney((garden.goal || 0) + gift),
    starterGift: gift,
    starterGiftApplied: true,
  }
}

export const MONEY_GARDEN_PARTS = [
  {
    part: 1,
    letter: 'A',
    moduleLabel: 'Module 6A',
    title: 'Investing Foundations',
    weeks: [1, 2, 3, 4, 5],
    goal: 'Build a diversified first portfolio, understand stock ownership, research businesses, and separate business evidence from price alone.',
    color: '#00b37f',
  },
  {
    part: 2,
    letter: 'B',
    moduleLabel: 'Module 6B',
    title: 'Markets, Risk & Patience',
    weeks: [6, 7, 8, 9, 10],
    goal: 'Match risk to time horizon, protect emergency money, respond to real evidence, resist hype, and rebalance.',
    color: '#7850F0',
  },
]

export const MONEY_GARDEN_FLOW = [
  '1. Read one clue.',
  '2. Make one evidence-based change.',
  '3. Test your choice, then see the lesson.',
]

export const MONEY_GARDEN_DECISIONS = {
  1: {
    title: 'First: build a diversified garden',
    why: 'A stock is a small ownership interest in a company. Diversification means not depending on only one company. You start with zero company shares, so your first job is to build a small mix.',
    instruction: 'Use READY TO INVEST cash to buy at least 1 share in 2 different companies. If money is in Pocket or Bank Sprout, Take $1 moves it back to READY TO INVEST.',
  },
  2: {
    title: 'See why diversification helps',
    why: 'If one company falls, other holdings can reduce how much that one result controls your whole portfolio. Diversification reduces concentration risk, but cannot remove all investing risk.',
    instruction: 'Check how many companies you own. Keep at least 2 different companies instead of putting everything into one.',
  },
  3: {
    title: 'A price dip needs context',
    why: 'A price can move even when the company itself has not changed. A falling price does not automatically mean the business became worse.',
    instruction: 'Check the company story before changing anything. Compare what happened to the business with what happened only to its price.',
  },
  4: {
    title: 'Customers are business evidence',
    why: 'Research uses credible information about the business. Customer activity is one clue that can tell you more than price alone.',
    instruction: 'Compare the PACKED and EMPTY storefronts, then use Buy or Sell only after deciding which business looks healthier from the evidence.',
  },
  5: {
    title: 'Cheap is not automatically good',
    why: 'A lower price can be an opportunity or a warning. The business behind the price tells you whether the investment may actually be more attractive.',
    instruction: 'Compare the cheaper companies. Use the business clues to decide whether either deserves more of your READY TO INVEST cash.',
  },
  6: {
    title: 'Match risk to your time horizon',
    why: 'Your time horizon is how long until you need the money. A surprise bill can arrive before investments recover, so some money should stay easy to reach.',
    instruction: 'Check Pocket before starting the week. Tuck $1 moves READY TO INVEST cash into Pocket; Take $1 brings Pocket money back when you want to invest it.',
  },
  7: {
    title: 'New warnings can change the plan',
    why: 'Patience does not mean ignoring a weakening business. A real change in the company can be a stronger reason to act than a small price wiggle.',
    instruction: 'Find the company with the new business warning. Compare that evidence with your holdings, then use Buy or Sell if your reason for owning it changed.',
  },
  8: {
    title: 'Do not chase hype',
    why: 'A recent price jump is not proof of future returns. Excitement can spread even when there is no new evidence that the business improved.',
    instruction: 'Before buying after the jump, look for credible business evidence that supports it. If the only clue is the price jump, keep reviewing instead of chasing it.',
  },
  9: {
    title: 'Use a longer view',
    why: 'One dramatic week can reverse. Several periods of evidence can give a better picture than the latest flashy move.',
    instruction: 'Compare the companies across multiple weeks, then check whether your portfolio still reflects the evidence instead of only the latest move.',
  },
  10: {
    title: 'Rebalance the intended mix',
    why: 'A portfolio can become concentrated again when one holding grows too large. Rebalancing adjusts holdings back toward the intended mix and risk.',
    instruction: 'Check which holding is largest. If one company dominates the garden, use Sell and Buy to spread the portfolio more evenly before testing the week.',
  },
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

// Evidence stays visible in the 3D scene while these short clues advance one at
// a time. The final item is the decision instruction; only then does the
// portfolio open.
export function moneyGardenClues(week, mg = {}) {
  const fx = mg?.fx || {}

  switch (Number(week)) {
    case 1:
      return [
        'You currently own zero company shares. Your first goal is to own at least two different companies.',
        'Toy Town has steady customer activity. That is evidence about the business, not a guarantee about its next price.',
        'Snack Shack has exciting product news, while Game Land can move sharply. Compare the businesses, then spread your first investment instead of relying on one.',
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
  return Number(week) <= 5 ? MONEY_GARDEN_PARTS[0] : MONEY_GARDEN_PARTS[1]
}

export function shouldPauseBetweenGardenParts(week, partTwoStarted) {
  return Number(week) === 6 && !partTwoStarted
}

export function moneyGardenDecision(week) {
  return MONEY_GARDEN_DECISIONS[week] || {
    title: 'Use evidence and keep the plan balanced',
    why: 'Investing decisions should connect business evidence, portfolio balance, time horizon, and money you may need soon.',
    instruction: 'Compare the clues, your holdings, Pocket, Bank Sprout, and READY TO INVEST cash before making one clear change.',
  }
}
