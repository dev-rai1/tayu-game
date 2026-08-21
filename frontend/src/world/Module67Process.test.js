import { describe, expect, it } from 'vitest'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'

describe('Module 6 and 7 process flow', () => {
  it('keeps Bond Street as a multi-step build-up', () => {
    expect(BOND_STEPS.length).toBeGreaterThan(10)
    expect(BOND_STEPS.at(-1)?.done).toBe(true)
  })

  it('keeps Tax Office as a return-building sequence', () => {
    const copy = TAX_STEPS.map((s) => s.text).join(' ')
    expect(TAX_STEPS.length).toBeGreaterThan(10)
    expect(copy).toMatch(/W-2/i)
    expect(copy).toMatch(/withholding|withheld/i)
    expect(copy).toMatch(/deduction/i)
    expect(copy).toMatch(/refund|amount due|reconciliation/i)
    expect(TAX_STEPS.at(-1)?.done).toBe(true)
  })
})
