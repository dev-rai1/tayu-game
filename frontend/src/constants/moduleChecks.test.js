import { describe, expect, it } from 'vitest'
import { BADGE_ORDER, MODULE_CHECKS, moduleCheckForBadge } from './moduleChecks.js'

const PUBLIC_MODULE_BY_BADGE = {
  jars: 1,
  lemonade: 2,
  budget: 3,
  bank: 4,
  tax: 5,
  garden: 6,
}

describe('post-module checks', () => {
  it('defines valid questions for every module badge', () => {
    expect(BADGE_ORDER).toHaveLength(6)
    BADGE_ORDER.forEach((badge) => {
      const check = moduleCheckForBadge(badge)
      expect(check).toBe(MODULE_CHECKS[badge])
      expect(check.moduleNumber).toBe(PUBLIC_MODULE_BY_BADGE[badge])
      expect(check.questions.length).toBeGreaterThanOrEqual(2)
      expect(check.cosmetic.name).toBeTruthy()
      check.questions.forEach((question) => {
        expect(question.prompt.length).toBeGreaterThan(10)
        expect(question.choices.length).toBeGreaterThanOrEqual(3)
        expect(question.answer).toBeGreaterThanOrEqual(0)
        expect(question.answer).toBeLessThan(question.choices.length)
        expect(question.trick.length).toBeGreaterThan(10)
      })
    })
  })

  it('keeps Paycheck Planet between Bank and Money Garden', () => {
    expect(BADGE_ORDER).toEqual(['jars', 'lemonade', 'budget', 'bank', 'tax', 'garden'])
    expect(MODULE_CHECKS.tax.moduleNumber).toBe(5)
    expect(MODULE_CHECKS.garden.moduleNumber).toBe(6)
  })

  it('balances correct-answer positions instead of putting every answer first', () => {
    const answers = BADGE_ORDER.flatMap((badge) =>
      MODULE_CHECKS[badge].questions.map((question) => question.answer)
    )

    expect(new Set(answers)).toEqual(new Set([0, 1, 2]))
    expect(answers.filter((answer) => answer === 0).length).toBeLessThan(answers.length / 2)
  })

  it('does not expose a check for an unknown badge', () => {
    expect(moduleCheckForBadge('unknown')).toBeNull()
  })
})
