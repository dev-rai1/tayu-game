import { describe, expect, it } from 'vitest'
import {
  GAME_STANDARD_DEDUCTION,
  GAME_STUDENT_SUPPLIES_DEDUCTION,
  TAX_CASES,
  TAX_INTRO_STEPS,
  THIRD_BRACKET_RATE,
  TOTAL_TAX_STEPS,
  bracketTax,
  filingStepFor,
  taxableIncomeFor,
  taxReturnMath,
  taxResultSummary,
} from './paycheckPlanet.js'

describe('TAYU Tax Office filing flow', () => {
  it('teaches a six-step filing flow with gross income, deductions, brackets, withholding and outcomes', () => {
    expect(TOTAL_TAX_STEPS).toBe(6)
    expect(TAX_INTRO_STEPS).toHaveLength(6)
    expect(TAX_INTRO_STEPS.join(' ')).toContain('W-2')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('taxable income')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('22%')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('refund')
    expect(TAX_INTRO_STEPS.join(' ')).toContain('zero')
  })

  it('provides three valid W-2 cases', () => {
    expect(TAX_CASES).toHaveLength(3)
    expect(TAX_CASES.map((item) => item.x)).toEqual([-2.6, 0, 2.6])
    expect(TAX_CASES.every((item) => item.wages > 0 && item.withheld >= 0)).toBe(true)
  })

  it('subtracts both practice deductions and supports a third 22% bracket', () => {
    const camp = TAX_CASES.find((item) => item.id === 'camp')
    expect(GAME_STANDARD_DEDUCTION).toBe(9000)
    expect(GAME_STUDENT_SUPPLIES_DEDUCTION).toBe(500)
    expect(THIRD_BRACKET_RATE).toBe(0.22)
    expect(taxableIncomeFor(camp)).toBe(8500)
    expect(bracketTax(8500)).toBe(920)
    expect(bracketTax(13000)).toBe(1560)
  })

  it('teaches refund, zero and amount-due outcomes', () => {
    const results = Object.fromEntries(TAX_CASES.map((item) => [item.id, taxReturnMath(item)]))
    expect(results.library.refund).toBeGreaterThan(0)
    expect(results.camp.refund).toBe(0)
    expect(results.camp.amountDue).toBe(0)
    expect(results.design.amountDue).toBeGreaterThan(0)
    expect(taxResultSummary(TAX_CASES.find((item) => item.id === 'camp'))).toContain('$0')
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
