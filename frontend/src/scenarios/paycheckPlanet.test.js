import { describe, expect, it } from 'vitest'
import {
  BUDGET_PLANS,
  START_JOBS,
  TOTAL_PAYCHECK_WEEKS,
  WEEK_SPECS,
  applyLifeChoice,
  budgetAmounts,
  lifeSummary,
  paycheckMath,
} from './paycheckPlanet.js'

describe('Paycheck Planet six-week simulation', () => {
  it('has six distinct weeks with a career change and an emergency week', () => {
    expect(TOTAL_PAYCHECK_WEEKS).toBe(6)
    expect(WEEK_SPECS).toHaveLength(6)
    expect(WEEK_SPECS[3].career).toBe(true)
    expect(WEEK_SPECS[4].lifeTitle).toContain('$65')
    expect(WEEK_SPECS.every((week) => week.choices.length === 3)).toBe(true)
  })

  it('teaches gross, withholding, and take-home pay with visible math', () => {
    const camp = START_JOBS.find((job) => job.id === 'camp')
    expect(paycheckMath(camp)).toEqual({ gross: 160, tax: 24, takeHome: 136 })
  })

  it('builds the budget from take-home pay', () => {
    const balanced = BUDGET_PLANS.find((plan) => plan.id === 'balanced')
    expect(budgetAmounts(136, balanced)).toEqual({ needs: 75, wants: 34, save: 27 })
  })

  it('lets real-life costs consume cash, then savings, then create debt', () => {
    const next = applyLifeChoice(
      { cash: 20, savings: 30, debt: 0, comfort: 5, freeTime: 5, grossBonus: 0 },
      { cost: 65, comfort: 1 },
    )
    expect(next.cash).toBe(0)
    expect(next.savings).toBe(0)
    expect(next.debt).toBe(15)
    expect(next.comfort).toBe(6)
  })

  it('makes the final life summary respond to savings, debt, and lifestyle tradeoffs', () => {
    expect(lifeSummary({ savings: 220, debt: 0, comfort: 7, freeTime: 5 })).toBe('PREPARED AND BALANCED')
    expect(lifeSummary({ savings: 40, debt: 90, comfort: 8, freeTime: 5 })).toContain('DEBT')
  })
})
