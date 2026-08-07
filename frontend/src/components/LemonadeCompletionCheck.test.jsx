import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { moduleCheckForBadge } from '../constants/moduleChecks.js'
import { shouldShowLemonadeCompletionCheck } from './LemonadeCompletionCheck.jsx'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')

describe('Lemonade completion Check 2', () => {
  it('appears only after Module 2 is actually complete', () => {
    expect(shouldShowLemonadeCompletionCheck({ week: 2, weekComplete: true })).toBe(true)
    expect(shouldShowLemonadeCompletionCheck({ week: 2, weekComplete: false })).toBe(false)
    expect(shouldShowLemonadeCompletionCheck({ week: 1, weekComplete: true })).toBe(false)
    expect(shouldShowLemonadeCompletionCheck({ week: 3, weekComplete: true })).toBe(false)
  })

  it('uses the required two Lemonade concept questions', () => {
    const check = moduleCheckForBadge('lemonade')
    expect(check.moduleNumber).toBe(2)
    expect(check.questions).toHaveLength(2)
    expect(check.questions[0].prompt).toContain('profit')
    expect(check.questions[1].prompt).toContain('leftover cups')
  })

  it('is wired into the world and does not stack the generic Module 2 recap', () => {
    const world = source('pages/World.jsx')
    const recap = source('components/ModuleLearningRecap.jsx')

    expect(world).toContain('<LemonadeCompletionCheck onContinue={onContinue} />')
    expect(recap).not.toContain("if (week === 2 && weekComplete) return 2")
  })
})
