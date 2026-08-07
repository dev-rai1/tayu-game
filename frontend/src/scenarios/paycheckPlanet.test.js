import { describe, expect, it } from 'vitest'
import {
  GAME_STANDARD_DEDUCTION,
  TAX_CASES,
  TAX_INTRO_STEPS,
  TOTAL_TAX_STEPS,
  bracketTax,
  filingStepFor,
  taxableIncomeFor,
  taxReturnMath,
  taxResultSummary,
} from './paycheckPlanet.js'

describe('Paycheck Planet Tax Filing Lab', () => {
  it('teaches a six-step filing flow instead of a paycheck budgeting simulation', () => {
    expect(TOTAL_TAX_STEPS).toBe(6)
    expect(TAX_INTRO_STEPS).toHaveLength(6)
    expect(TAX_INTRO_STEPS.join(' ')).toContain('W-2')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('taxable income')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('tax brackets')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('refund or amount due')
  })

  it('provides three valid W-2 cases including a reachable right-hand case', () => {
    expect(TAX_CASES).toHaveLength(3)
    expect(TAX_CASES.map((item) => item.x)).toEqual([-2.6, 0, 2.6])
    expect(TAX_CASES.every((item) => item.wages > 0 && item.withheld >= 0)).toBe(true)
  })

  it('calculates taxable income and bracket tax with easy visible math', () => {
    const camp = TAX_CASES.find((item) => item.id === 'camp')
    expect(GAME_STANDARD_DEDUCTION).toBe(9000)
    expect(taxableIncomeFor(camp)).toBe(9000)
    expect(bracketTax(9000)).toBe(980)
    expect(taxReturnMath(camp)).toMatchObject({
      wages: 18000,
      withheld: 900,
      taxableIncome: 9000,
      taxBeforeCredits: 980,
      credit: 150,
      finalTax: 830,
      refund: 70,
      amountDue: 0,
    })
  })

  it('teaches both refund and amount-due outcomes', () => {
    const library = taxReturnMath(TAX_CASES.find((item) => item.id === 'library'))
    const design = taxReturnMath(TAX_CASES.find((item) => item.id === 'design'))
    expect(library.refund).toBe(150)
    expect(library.amountDue).toBe(0)
    expect(design.refund).toBe(0)
    expect(design.amountDue).toBe(250)
    expect(taxResultSummary(TAX_CASES.find((item) => item.id === 'design'))).toContain('AMOUNT DUE')
  })

  it('makes every filing step an easy multiple-choice decision with a hint and explanation', () => {
    const taxCase = TAX_CASES[1]
    for (let stepNumber = 1; stepNumber <= TOTAL_TAX_STEPS; stepNumber += 1) {
      const step = filingStepFor(taxCase, stepNumber)
      expect(step.choices).toHaveLength(3)
      expect(step.choices.filter((choice) => choice.correct)).toHaveLength(1)
      expect(step.hint.length).toBeGreaterThan(10)
      expect(step.explanation.length).toBeGreaterThan(10)
    }
  })
})
