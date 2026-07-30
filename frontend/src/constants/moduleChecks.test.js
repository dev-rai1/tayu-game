import { describe, expect, it } from 'vitest'
import { BADGE_ORDER, MODULE_CHECKS, moduleCheckForBadge } from './moduleChecks.js'

describe('post-module checks', () => {
  it('defines exactly two valid questions for every module badge', () => {
    expect(BADGE_ORDER).toHaveLength(5)
    BADGE_ORDER.forEach((badge, index) => {
      const check = moduleCheckForBadge(badge)
      expect(check).toBe(MODULE_CHECKS[badge])
      expect(check.moduleNumber).toBe(index + 1)
      expect(check.questions).toHaveLength(2)
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

  it('does not expose a check for an unknown badge', () => {
    expect(moduleCheckForBadge('unknown')).toBeNull()
  })
})
