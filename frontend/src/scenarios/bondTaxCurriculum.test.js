import { describe, expect, it } from 'vitest'
import { BK } from './bankModule.js'
import { OPTION_CARDS, defaultSplit, splitNudge } from './budgetTown.js'
import { BOND_MEADOW, STOCK_BOND_COMPARE, moneyGardenClues } from './moneyGardenGuidance.js'
import { KNOWLEDGE_QUESTIONS, scoreKnowledgeQuiz } from '../constants/knowledgeQuiz.js'
import { MODULE_CATALOG } from '../constants/modules.js'
import {
  GAME_STUDENT_SUPPLIES_DEDUCTION,
  MUNI_BOND_TAX_CALLBACK,
  TAX_CASES,
  TAX_CIVIC_CONNECTION,
  THIRD_BRACKET_RATE,
  filingStepFor,
  taxReturnMath,
} from './paycheckPlanet.js'
import { BOND_TYPES, bondOutcome } from '../world/bondStreetStore.js'

describe('complete fixed-income and tax addendum', () => {
  it('bridges CDs to bonds in the Bank lesson', () => {
    expect(BK.w2.bubble).toMatch(/bond/i)
    expect(BK.w2.card).toMatch(/governments|companies/i)
    expect(BK.w2.summary).toMatch(/CD.*bonds/i)
  })

  it('makes bonds a true fourth Budget Town allocation with the no-bond nudge', () => {
    expect(OPTION_CARDS.map((card) => card.id)).toEqual(['pocket', 'bank', 'bond', 'garden'])
    expect(OPTION_CARDS.find((card) => card.id === 'bond').line).toMatch(/lend/i)
    expect(Object.keys(defaultSplit(20))).toEqual(['pocket', 'bank', 'bond', 'garden'])
    expect(splitNudge({ pocket: 3, bank: 6, bond: 0, garden: 11 }, 20)).toMatch(/Bonds are the middle ground/i)
  })

  it('teaches Treasury, muni, corporate, seniority, default and rate-price risk', () => {
    expect(Object.keys(BOND_MEADOW)).toEqual(['treasury', 'muni', 'corporate'])
    expect(STOCK_BOND_COMPARE.stock).toMatch(/ownership/i)
    expect(STOCK_BOND_COMPARE.bond).toMatch(/loan/i)
    expect(STOCK_BOND_COMPARE.seniority).toMatch(/higher claim/i)
    expect(STOCK_BOND_COMPARE.rates).toMatch(/interest rates rise/i)
    expect(moneyGardenClues(7, { fx: { shabby: 'toy' } }).join(' ')).toMatch(/default|bondholder/i)
    expect(moneyGardenClues(9, { fx: { star: 'toy' } }).join(' ')).toMatch(/interest rates/i)
  })

  it('adds a dedicated Bond Street module with three safety-rated borrowers and persistent muni outcome', () => {
    const bondModule = MODULE_CATALOG.find((module) => module.badge === 'bond')
    expect(bondModule.n).toBe(6)
    expect(bondModule.title).toBe('Bond Street')
    expect(BOND_TYPES.map((bond) => bond.id)).toEqual(['treasury', 'muni', 'corporate'])
    expect(BOND_TYPES.every((bond) => bond.safety >= 1 && bond.safety <= 3)).toBe(true)
    const result = bondOutcome(30, { treasury: 12, muni: 9, corporate: 9 })
    expect(result.principal).toBe(30)
    expect(result.interest).toBeGreaterThan(0)
    expect(result.muniInvested).toBe(true)
  })

  it('adds measurable stock/bond and refund questions for the older learner bank', () => {
    const bondQuestion = KNOWLEDGE_QUESTIONS.find((question) => question.id === 'stock_vs_bond')
    const refundQuestion = KNOWLEDGE_QUESTIONS.find((question) => question.id === 'tax_refund')
    expect(KNOWLEDGE_QUESTIONS).toHaveLength(5)
    expect(bondQuestion.choices[bondQuestion.correct]).toMatch(/ownership.*loan/i)
    expect(refundQuestion.choices[refundQuestion.correct]).toMatch(/withheld more/i)
    const perfect = Object.fromEntries(KNOWLEDGE_QUESTIONS.map((question) => [question.id, question.correct]))
    expect(scoreKnowledgeQuiz(perfect)).toBe(KNOWLEDGE_QUESTIONS.length)
  })

  it('implements the Tax Office deductions, 10/12/22 staircase, civic link, and all three filing outcomes', () => {
    expect(GAME_STUDENT_SUPPLIES_DEDUCTION).toBeGreaterThan(0)
    expect(THIRD_BRACKET_RATE).toBe(0.22)
    const results = TAX_CASES.map(taxReturnMath)
    expect(results.some((math) => math.refund > 0)).toBe(true)
    expect(results.some((math) => math.amountDue > 0)).toBe(true)
    expect(results.some((math) => math.refund === 0 && math.amountDue === 0)).toBe(true)
    expect(TAX_CIVIC_CONNECTION).toMatch(/school bus/i)
    expect(TAX_CIVIC_CONNECTION).toMatch(/clinic/i)
    expect(TAX_CIVIC_CONNECTION).toMatch(/ring road/i)
    expect(MUNI_BOND_TAX_CALLBACK).toMatch(/municipal-bond interest/i)
    expect(filingStepFor(TAX_CASES[0], 3).explanation).toMatch(/22%|higher step/i)
    expect(filingStepFor(TAX_CASES[0], 6).explanation).toContain(TAX_CIVIC_CONNECTION)
  })
})
