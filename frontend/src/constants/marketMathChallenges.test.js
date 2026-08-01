import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MARKET_MATH_CHALLENGES, marketMathChallengeForGrade, normalizeChallengeGrade } from './marketMathChallenges.js'

const moduleCheckSource = readFileSync(resolve(process.cwd(), 'src/pages/ModuleCheck.jsx'), 'utf8')
const challengeSource = readFileSync(resolve(process.cwd(), 'src/components/BonusMathChallenge.jsx'), 'utf8')

describe('age-banded Market math challenges', () => {
  it('provides a valid optional question for every grade band', () => {
    for (const grade of ['K-2', '3-5', '6-8', '9-12']) {
      const challenge = marketMathChallengeForGrade(grade)
      expect(challenge.prompt.length).toBeGreaterThan(10)
      expect(challenge.choices).toHaveLength(3)
      expect(challenge.answer).toBeGreaterThanOrEqual(0)
      expect(challenge.answer).toBeLessThan(challenge.choices.length)
      expect(challenge.explanation).toContain('$')
    }
  })

  it('increases the type of math as grade level rises', () => {
    expect(MARKET_MATH_CHALLENGES['K-2'].label).toBe('Add the prices')
    expect(MARKET_MATH_CHALLENGES['3-5'].label).toBe('Find the change')
    expect(MARKET_MATH_CHALLENGES['6-8'].label).toBe('Plan several steps')
    expect(MARKET_MATH_CHALLENGES['9-12'].label).toBe('Use percentages')
  })

  it('uses a safe fallback for mixed or missing grade data', () => {
    expect(normalizeChallengeGrade('mixed')).toBe('3-5')
    expect(normalizeChallengeGrade(undefined)).toBe('K-2')
  })

  it('keeps the challenge optional and limited to the Market completion screen', () => {
    expect(moduleCheckSource).toContain("badge === 'jars'")
    expect(moduleCheckSource).toContain('<BonusMathChallenge')
    expect(challengeSource).toContain('Optional')
    expect(challengeSource).toContain('without changing your badge or score')
    expect(challengeSource).toContain('Try bonus math')
  })
})
