// financialCalculations.js
// Pure money math for all three stages. Keep this file framework-free and unit-tested.

export const round2 = (n) => Math.round(n * 100) / 100

// ---------------------------------------------------------------------------
// STAGE 1 - Allowance split
// ---------------------------------------------------------------------------
export const ALLOWANCE = 20

/** Net worth at end of Stage 1 = sum of the three jars. */
export const stage1NetWorth = ({ spend = 0, save = 0, give = 0 }) =>
  round2(spend + save + give)

// ---------------------------------------------------------------------------
// STAGE 2 - Business weekly P&L
//   Revenue = (price × demandAtPrice) × (effort / maxEffort)
//   Variable costs = costRate × revenue   (20–30% by business)
//   Tax = 10% of gross revenue
//   Net profit = revenue − costs − tax
// ---------------------------------------------------------------------------
export const TAX_RATE_STAGE2 = 0.1

/**
 * @param {object} p
 * @param {number} p.price          price per unit/hour
 * @param {number} p.demandAtPrice  estimated units sold at that price
 * @param {number} p.effort         chosen effort level (units/hours)
 * @param {number} p.maxEffort      max effort for the business (default 50)
 * @param {number} p.costRate       variable cost as fraction of revenue (0.2–0.3)
 * @param {number} p.fixedCost      one-time/weekly fixed cost (e.g. $5 supplies)
 */
export function weeklyPnl({
  price,
  demandAtPrice,
  effort,
  maxEffort = 50,
  costRate = 0.25,
  fixedCost = 0,
}) {
  const revenue = round2(price * demandAtPrice * (effort / maxEffort))
  const tax = round2(revenue * TAX_RATE_STAGE2)
  const variableCost = round2(revenue * costRate)
  const netProfit = round2(revenue - variableCost - tax - fixedCost)
  return { revenue, tax, variableCost, fixedCost, netProfit }
}

// ---------------------------------------------------------------------------
// STAGE 3 - Salary, deductions, allocation, investment returns
// ---------------------------------------------------------------------------
export const STAGE3_DEFAULTS = {
  grossMonthly: 3333,
  taxRate: 0.22,
  rent: 800,
  insurance: 150,
}

/** Returns { tax, netTakeHome } for the monthly paycheck. */
export function takeHome({
  grossMonthly = STAGE3_DEFAULTS.grossMonthly,
  taxRate = STAGE3_DEFAULTS.taxRate,
  rent = STAGE3_DEFAULTS.rent,
  insurance = STAGE3_DEFAULTS.insurance,
} = {}) {
  const tax = round2(grossMonthly * taxRate)
  const netTakeHome = round2(grossMonthly - tax - rent - insurance)
  return { tax, rent, insurance, netTakeHome }
}

/** Default allocation buckets (percent of take-home). */
export const DEFAULT_ALLOCATION = {
  emergencyFund: 0.1,
  stocks: 0.3,
  bonds: 0.2,
  living: 0.35,
  savingsGoals: 0.05,
}

/** Stocks: randomized −2% .. +8% monthly. Pass an rng for deterministic tests. */
export function stockMonthlyReturn(rng = Math.random) {
  return -0.02 + rng() * 0.1 // [-0.02, +0.08]
}

/** Bonds: fixed +1% monthly. */
export const BOND_MONTHLY_RETURN = 0.01

export const applyReturn = (balance, rate) => round2(balance * (1 + rate))

/** High-interest loan helper (Stage 3 events): monthly interest in dollars. */
export const monthlyInterest = (principal, annualRate) =>
  round2((principal * annualRate) / 12)

/** Net worth = investments + cash buckets − debt owed. */
export function totalNetWorth({
  stocks = 0,
  bonds = 0,
  emergencyFund = 0,
  savingsGoals = 0,
  carryOver = 0,
  debt = 0,
} = {}) {
  return round2(stocks + bonds + emergencyFund + savingsGoals + carryOver - debt)
}
