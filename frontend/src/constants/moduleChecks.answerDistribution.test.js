import { describe, expect, it } from 'vitest'
import { BADGE_ORDER, MODULE_CHECKS } from './moduleChecks.js'

describe('answer position distribution', () => {
  it('uses all three answer positions across the checks', () => {
    const answers = BADGE_ORDER.flatMap((badge) => MODULE_CHECKS[badge].questions.map((question) => question.answer))
    expect([...new Set(answers)].sort()).toEqual([0, 1, 2])
  })
})
