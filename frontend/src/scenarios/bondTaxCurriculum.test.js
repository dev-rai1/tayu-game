import { describe, expect, it } from 'vitest'
import { BK } from './bankModule.js'
import { OPTION_CARDS } from './budgetTown.js'
import { BOND_MEADOW, STOCK_BOND_COMPARE, moneyGardenClues } from './moneyGardenGuidance.js'
import { KNOWLEDGE_QUESTIONS, scoreKnowledgeQuiz } from '../constants/knowledgeQuiz.js'
import {
  MUNI_BOND_TAX_CALLBACK,
  TAX_CASES,
  TAX_CIVIC_CONNECTION,
  filingStepFor,
  taxReturnMath,
} from './paycheckPlanet.js'

describe('bond and tax curriculum integration', () => {
  it('bridges CDs to bonds in the bank lesson', () => {
    expect(BK.w2.bubble).toMatch(/bond/i)
    expect(BK.w2.card).toMatch(/governments|companies/i)
    expect(BK.w2.summary).toMatch(/CD.*bonds/i)
  })

  it('previews bonds as a fourth Budget Town concept without changing the three allocation buckets', () => {
    const bonds = OPTION_CARDS.find((card) => card.id === 'bond')
    expect(OPTION_CARDS).toHaveLength(4)
    expect(bonds).toBeTruthy()
    expect(bonds.educationOnly).toBe(true)
    expect(bonds.line).toMatch(/lend/i)
  })

  it('teaches the three bond types and key stock-vs-bond differences', () => {
    expect(Object.keys(BOND_MEADOW)).toEqual(['treasury', 'muni', 'corporate'])
    expect(STOCK_BOND_COMPARE.stock).toMatch(/ownership/i)
    expect(STOCK_BOND_COMPARE.bond).toMatch(/loan/i)
    expect(STOCK_BOND_COMPARE.seniority).toMatch(/higher claim/i)
    expect(STOCK_BOND_COMPARE.rates).toMatch(/interest rates rise/i)
    expect(moneyGardenClues(5, { fx: { busy: 'toy', dusty: 'snack' } }).join(' ')).toMatch(/Bond Meadow/i)
    expect(moneyGardenClues(9, { fx: { star: 'toy' } }).join(' ')).toMatch(/interest rates/i)
  })

  it('adds measurable stock/bond and refund questions', () => {
    const bondQuestion = KNOWLEDGE_QUESTIONS.find((question) => question.id === 'stock_vs_bond')
    const refundQuestion = KNOWLEDGE_QUESTIONS.find((question) => question.id === 'tax_refund')
    expect(KNOWLEDGE_QUESTIONS).toHaveLength(5)
    expect(bondQuestion.choices[bondQuestion.correct]).toMatch(/ownership.*loan/i)
    expect(refundQuestion.choices[refundQuestion.correct]).toMatch(/withheld more/i)

    const perfect = Object.fromEntries(KNOWLEDGE_QUESTIONS.map((question) => [question.id, question.correct]))
    expect(scoreKnowledgeQuiz(perfect)).toBe(KNOWLEDGE_QUESTIONS.length)
  })

  it('preserves Tax Town math while adding civic, effective-rate, and muni callbacks', () => {
    for (const taxCase of TAX_CASES) {
      const math = taxReturnMath(taxCase)
      expect(math.taxableIncome).toBeGreaterThanOrEqual(0)
      expect(math.finalTax).toBeGreaterThanOrEqual(0)
      expect(math.effectiveRate).toBeGreaterThanOrEqual(0)
      expect(math.refund > 0 || math.amountDue > 0 || math.refund === math.amountDue).toBe(true)
    }

    expect(TAX_CIVIC_CONNECTION).toMatch(/school bus/i)
    expect(TAX_CIVIC_CONNECTION).toMatch(/clinic/i)
    expect(MUNI_BOND_TAX_CALLBACK).toMatch(/municipal-bond interest/i)
    expect(filingStepFor(TAX_CASES[0], 6).explanation).toContain(TAX_CIVIC_CONNECTION)
    expect(filingStepFor(TAX_CASES[0], 6).explanation).toContain(MUNI_BOND_TAX_CALLBACK)
  })
})
