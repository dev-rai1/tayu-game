import { describe, expect, it } from 'vitest'
import { BOND_TYPES, allocationTotal, bondOutcome, gardenProfitStake } from './bondStreet.js'
import { questionsForGradePath } from '../constants/knowledgeQuiz.js'

describe('Bond Street document requirements', () => {
  it('carries a positive Money Garden gain forward instead of resetting money', () => {
    const wallet = {
      mg: {
        startTotal: 100,
        cash: 20,
        pocket: 10,
        bank: 20,
        companies: {
          toy: { owned: 2, price: 35 },
        },
      },
    }
    expect(gardenProfitStake(wallet)).toBe(20)
  })

  it('uses existing saved money rather than minting a replacement stake when the garden is flat', () => {
    const wallet = { mg: { startTotal: 100, cash: 12, pocket: 8, bank: 10, companies: { toy: { owned: 1, price: 70 } } } }
    expect(gardenProfitStake(wallet)).toBe(30)
  })

  it('teaches Treasury, Muni, and Corporate bonds with safety ratings', () => {
    expect(BOND_TYPES.map((bond) => bond.id)).toEqual(['treasury', 'muni', 'corporate'])
    expect(BOND_TYPES.every((bond) => bond.safety >= 1 && bond.safety <= 3)).toBe(true)
  })

  it('tracks muni participation and calculates bond interest', () => {
    const allocation = { treasury: 10, muni: 20, corporate: 30 }
    expect(allocationTotal(allocation)).toBe(60)
    const outcome = bondOutcome(allocation)
    expect(outcome.investedInMuni).toBe(true)
    expect(outcome.principal).toBe(60)
    expect(outcome.interest).toBeGreaterThan(0)
    expect(outcome.ending).toBeGreaterThan(outcome.principal)
  })

  it('shows the added bond and tax check-in questions only for middle/high school', () => {
    expect(questionsForGradePath('upper-elementary')).toHaveLength(3)
    expect(questionsForGradePath('middle-school')).toHaveLength(5)
    expect(questionsForGradePath('high-school')).toHaveLength(5)
  })
})
