import { describe, expect, it } from 'vitest'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'

describe('Module 6 and 7 stable process flow', () => {
  it('keeps the bond module as a multi-step process with both decisions and calculations', () => {
    expect(BOND_STEPS.length).toBeGreaterThan(10)
    expect(BOND_STEPS.some((step) => step.choices?.some((choice) => /\$|%/.test(choice.label)))).toBe(true)
    expect(BOND_STEPS.at(-1)?.done).toBe(true)
  })

  it('keeps the tax module as a return-building process rather than one quiz', () => {
    expect(TAX_STEPS.length).toBeGreaterThan(10)
    const text = TAX_STEPS.map((step) => step.text).join(' ')
    expect(text).toMatch(/W-2/i)
    expect(text).toMatch(/withheld|withholding/i)
    expect(text).toMatch(/deduction/i)
    expect(text).toMatch(/taxable income|gross income/i)
    expect(text).toMatch(/refund|amount due|reconciliation/i)
    expect(TAX_STEPS.at(-1)?.done).toBe(true)
  })
})
