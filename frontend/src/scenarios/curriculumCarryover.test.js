import { describe, expect, it } from 'vitest'
import {
  bondCompletionSummary,
  journeyIncomeCarryover,
  moneyGardenHarvestSummary,
} from './curriculumCarryover.js'

describe('module 5-7 curriculum carryover', () => {
  it('calculates Money Garden ending value, profit, and ROI from the investing stake', () => {
    const summary = moneyGardenHarvestSummary({
      startTotal: 100,
      cash: 20,
      pocket: 25,
      bank: 40,
      companies: {
        a: { owned: 2, price: 45 },
        b: { owned: 1, price: 10 },
      },
    })

    expect(summary.stockValue).toBe(100)
    expect(summary.endingInvestmentValue).toBe(120)
    expect(summary.profit).toBe(20)
    expect(summary.roiPercent).toBe(20)
  })

  it('calculates Bond Street profit and ROI from interest earned', () => {
    const summary = bondCompletionSummary({
      principal: 200,
      interest: 10,
      ending: 210,
      allocations: { treasury: 100, muni: 50, corporate: 50 },
      investedInMuni: true,
    })

    expect(summary.profit).toBe(10)
    expect(summary.roiPercent).toBe(5)
    expect(summary.investedInMuni).toBe(true)
  })

  it('carries only realized stock profit rather than stock sale proceeds into the tax bridge', () => {
    const carryover = journeyIncomeCarryover(
      {
        lemCum: 35,
        mg: {
          harvest: {
            decision: 'sell',
            stockSaleProceeds: 150,
            realizedCapitalGain: 22,
          },
        },
      },
      { bondStreet: { interest: 8, investedInMuni: false } },
    )

    expect(carryover.lemonadeProfit).toBe(35)
    expect(carryover.realizedCapitalGain).toBe(22)
    expect(carryover.bondInterest).toBe(8)
    expect(carryover.totalPracticeIncome).toBe(65)
    expect(carryover.totalPracticeIncome).not.toBe(193)
  })
})
