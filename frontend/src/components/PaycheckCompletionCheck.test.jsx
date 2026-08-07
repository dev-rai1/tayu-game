import { describe, expect, it } from 'vitest'
import { shouldShowPaycheckCompletionCheck } from './PaycheckCompletionCheck.jsx'

describe('PaycheckCompletionCheck', () => {
  const completedProfile = {
    badges: ['tax'],
    taxLab: { completedAt: '2026-08-07T19:00:00.000Z' },
    moduleChecks: {},
  }

  it('shows only after Paycheck Planet is completed while its world mode is active', () => {
    expect(shouldShowPaycheckCompletionCheck({ profile: completedProfile, paycheckActive: true })).toBe(true)
    expect(shouldShowPaycheckCompletionCheck({ profile: completedProfile, paycheckActive: false })).toBe(false)
  })

  it('does not repeat after the Module 5 check is saved', () => {
    const profile = {
      ...completedProfile,
      moduleChecks: { tax: { latestScore: 3, bestScore: 3, attemptCount: 1 } },
    }
    expect(shouldShowPaycheckCompletionCheck({ profile, paycheckActive: true })).toBe(false)
  })

  it('does not appear before Module 5 completion', () => {
    expect(shouldShowPaycheckCompletionCheck({ profile: { badges: [] }, paycheckActive: true })).toBe(false)
  })
})
