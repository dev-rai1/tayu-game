// Money Garden guidance: Module 6A builds investing foundations and Module 6B
// adds market risk, patience, ready cash, rebalancing, and fixed-income basics.
// Bonds are taught as lending rather than ownership so the distinction stays
// clear without replacing the existing three-company stock simulation.

import { COMPANIES } from './moneyGarden.js'

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

export const BOND_MEADOW = {
  treasury: {
    id: 'treasury',
    title: 'U.S. Treasury',
    safety: 3,
    line: 'You lend to the federal government. It is the safest bond example in TAYU, so the interest is lower.',
  },
  muni: {
    id: 'muni',
    title: 'Muni Bond',
    safety: 3,
    line: 'You lend to a state or local government for roads or schools. Muni interest can receive special tax treatment.',
  },
  corporate: {
    id: 'corporate',
    title: 'Corporate Bond',
    safety: 2,
    line: 'You lend to a company. It may offer more interest because the borrower can be riskier than a government.',
  },
}

export const STOCK_BOND_COMPARE = {
  stock: 'STOCK = ownership. You own a small piece of a company and its price can move a lot.',
  bond: 'BOND = loan. You lend money to a borrower who promises interest and repayment.',
  seniority: 'If a company fails, bondholders generally have a higher claim than stockholders. That helps explain why bonds often move less.',
  rates: 'When new interest rates rise, older lower-rate bonds can look less attractive, so their market prices may fall.',
}

// Five Lenses: the structured stock-selection framework for grades 6-12. It
// replaces the loose "busy + good news = good stock" heuristic (which is how
// people pile into meme stocks) with the criteria real analysts actually use.
export const FIVE_LENSES = {
  summary: [
    'Smart gardeners use five lenses before planting:',
    '1 - Is the store BUSY? (Revenue and customers)',
    '2 - Does it KEEP money after costs? (Profit margin)',
    '3 - Does it OWE more than it OWNS? (Financial health)',
    '4 - Is it HARD TO COPY? (Competitive advantage)',
    '5 - Am I paying a FAIR PRICE? (Value)',
    'No single lens tells the whole story. Check all five, then plant.',
  ],
  priceValue: 'A great company at the wrong price is still a bad plant. If everyone knows a company is great, the price may already show it. Ask: am I paying a fair price?',
}

// Per-company lens readings, pulled from the company data in moneyGarden.js.
export function companyLenses(company) {
  const lens = company?.lens
  if (!lens) return []
  return [
    { key: 'profit', label: 'Profit', text: lens.profit },
    { key: 'health', label: 'Health', text: lens.health },
    { key: 'moat', label: 'Moat', text: lens.moat },
    { key: 'value', label: 'Value', text: lens.value },
  ].filter((entry) => entry.text)
}

export const MONEY_GARDEN_PARTS = [
  {
    part: 1,
    letter: 'A',
    moduleLabel: 'Module 6A',
    title: 'Investing Foundations',
    weeks: [1, 2, 3, 4, 5],
    goal: 'Build a diversified first portfolio, understand stock ownership, research businesses, and learn how bonds differ from stocks.',
    color: '#00b37f',
  },
  {
    part: 2,
    letter: 'B',
    moduleLabel: 'Module 6B',
    title: 'Markets, Risk & Patience',
    weeks: [6, 7, 8, 9, 10],
    goal: 'Match risk to time horizon, protect emergency money, respond to evidence, resist hype, understand bond risk, and rebalance.',
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
    why: 'You start with zero company shares. A stock is ownership, and diversification means not depending on only one company.',
    instruction: 'Use READY TO INVEST cash to buy at least 1 share in 2 different companies.',
  },
  2: {
    title: 'See why diversification helps',
    why: 'If one company falls, other holdings can reduce how much that one result controls your whole portfolio.',
    instruction: 'Check how many companies you own. Keep at least 2 different companies instead of putting everything into one.',
  },
  3: {
    title: 'A price dip needs context',
    why: 'A price can move even when the company itself has not changed. A falling price does not automatically mean the business became worse.',
    instruction: 'Check the company story before changing anything. Compare business evidence with price movement.',
  },
  4: {
    title: 'Stock ownership or bond lending?',
    why: `${STOCK_BOND_COMPARE.stock} ${STOCK_BOND_COMPARE.bond} Use all five lenses before you plant: busy (revenue), profit margin, financial health, moat, and fair price.`,
    instruction: 'Inspect the PACKED and EMPTY storefronts. Check profit, health, and moat too - not just the busy store. These shares mean ownership; a bond would make you the lender instead.',
  },
  5: {
    title: 'Compare return with risk',
    why: 'A lower price can be an opportunity or a warning. With bonds, safer borrowers usually offer less interest than riskier borrowers.',
    instruction: 'Compare the cheaper companies, then compare the Bond Meadow examples: Treasury, Muni, and Corporate.',
  },
  6: {
    title: 'Match risk to your time horizon',
    why: 'Your time horizon is how long until you need the money. A surprise bill can arrive before investments recover.',
    instruction: 'Check Pocket before starting the week. Keep some money easy to reach instead of investing every dollar.',
  },
  7: {
    title: 'Bonds can fail too',
    why: `${STOCK_BOND_COMPARE.seniority} A corporate bond is still only as reliable as its borrower.`,
    instruction: 'Find the company with the new warning. If you lent to that company, the warning would matter to its bonds too.',
  },
  8: {
    title: 'Do not chase hype',
    why: 'A recent price jump is not proof of future returns. Excitement can spread even when there is no new evidence that the business improved.',
    instruction: 'Before buying after the jump, look for credible business evidence that supports it.',
  },
  9: {
    title: 'Steady does not mean motionless',
    why: STOCK_BOND_COMPARE.rates,
    instruction: 'Compare several weeks of evidence. Stocks move with business news; bond prices can move when market interest rates change.',
  },
  10: {
    title: 'Rebalance the intended mix',
    why: 'A portfolio can become concentrated again when one holding grows too large. Rebalancing adjusts holdings back toward the intended mix and risk.',
    instruction: 'Check which holding is largest. If one company dominates the garden, spread the portfolio more evenly before testing the week.',
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

export function moneyGardenClues(week, mg = {}) {
  const fx = mg?.fx || {}
  switch (Number(week)) {
    case 1:
      return [
        'You currently own zero company shares. Your first goal is to own at least two different companies.',
        'Toy Town has steady customer activity. Snack Shack has exciting product news. Game Land can move sharply.',
        'Before you plant, be a detective. Lens 2 - Profit: a busy store that loses money is worse than a quiet one that keeps it.',
        COMPANIES.toy.lens.profit,
        COMPANIES.snack.lens.profit,
        COMPANIES.game.lens.profit,
      ]
    case 2:
      return [`${companyName(fx.rain)} may fall this week. Notice how much of your plan depends on it.`]
    case 3:
      return [
        `${companyName(fx.dip)} has a price dip on screen.`,
        'There is no new warning that the business itself became weaker.',
        'Lens 3 - Health: a company that owes more than it owns can fail even with a full store. Lens 4 - Moat: is it hard to copy?',
        COMPANIES.game.lens.moat,
        COMPANIES.toy.lens.health,
      ]
    case 4:
      return [
        `${companyName(fx.busy)} is PACKED — lots of customers are showing up.`,
        `${companyName(fx.dusty)} is EMPTY — very few customers are showing up.`,
        STOCK_BOND_COMPARE.stock,
        STOCK_BOND_COMPARE.bond,
      ]
    case 5:
      return [
        `${companyName(fx.busy || fx.sale)} is on SALE and PACKED while ${companyName(fx.dusty || fx.sale2)} is cheaper but weak.`,
        `Bond Meadow safety: Treasury ${BOND_MEADOW.treasury.safety} stars, Muni ${BOND_MEADOW.muni.safety}, Corporate ${BOND_MEADOW.corporate.safety}.`,
        'Muni interest can receive special tax treatment. You will revisit that connection in Tax Town.',
        `Lens 5 - Value: ${FIVE_LENSES.priceValue}`,
      ]
    case 6:
      return [`Pocket money ready right now: ${money(mg?.pocket)}.`, 'A surprise bill can arrive before an investment has time to recover.']
    case 7:
      return [
        `${companyName(fx.shabby)} shows EMPTY aisles, damaged signs, and falling activity.`,
        STOCK_BOND_COMPARE.seniority,
        'A corporate bond can default if the borrower cannot pay. Bonds are steadier than stocks, not risk-free.',
      ]
    case 8:
      return [`${companyName(fx.balloon)} just had a big price jump and the town is excited.`, 'A price jump is not the same thing as new evidence about the business.']
    case 9:
      return [
        `${companyName(fx.star)} has been steadier across several weeks.`,
        STOCK_BOND_COMPARE.rates,
        'If the borrower pays as promised, holding a bond to its end can reduce the importance of temporary price changes.',
      ]
    case 10: {
      const largest = largestHolding(mg)
      return largest
        ? [`${companyName(largest.id)} is about ${largest.percent}% of your invested company value.`, 'A long-term plan can mix ready cash, bank savings, bonds, and stocks instead of relying on one type.']
        : ['No company currently dominates the invested part of your plan.', 'A long-term plan can mix ready cash, bank savings, bonds, and stocks.']
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
