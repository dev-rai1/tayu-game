import { describe, it, expect } from 'vitest'
import {
  stage1NetWorth,
  weeklyPnl,
  takeHome,
  applyReturn,
  totalNetWorth,
  BOND_MONTHLY_RETURN,
} from './financialCalculations.js'

describe('Stage 1', () => {
  it('sums the three jars into net worth', () => {
    expect(stage1NetWorth({ spend: 6, save: 10, give: 4 })).toBe(20)
  })
})

describe('Stage 2 weekly P&L', () => {
  it('applies effort ratio, costs, and 10% tax', () => {
    // $2 × 30 units × (40/50 effort) = $48 revenue
    const r = weeklyPnl({ price: 2, demandAtPrice: 30, effort: 40, maxEffort: 50, costRate: 0.25 })
    expect(r.revenue).toBe(48)
    expect(r.tax).toBe(4.8)
    expect(r.variableCost).toBe(12)
    expect(r.netProfit).toBe(31.2)
  })
})

describe('Stage 3 take-home', () => {
  it('computes net take-home from gross with default deductions', () => {
    const { tax, netTakeHome } = takeHome()
    expect(tax).toBe(733.26)
    expect(netTakeHome).toBe(1649.74) // ≈ $1,650
  })
})

describe('Stage 3 investments', () => {
  it('applies bond return of +1%', () => {
    expect(applyReturn(200, BOND_MONTHLY_RETURN)).toBe(202)
  })
  it('nets out debt in total net worth', () => {
    expect(totalNetWorth({ stocks: 315, bonds: 202, emergencyFund: 150, debt: 100 })).toBe(567)
  })
})
