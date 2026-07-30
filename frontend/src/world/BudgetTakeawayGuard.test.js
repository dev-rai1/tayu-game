import { describe, expect, it } from 'vitest'
import { PROTECTED_BUDGET_TAKEAWAYS, isProtectedBudgetTakeaway } from './BudgetTakeawayGuard.jsx'

describe('BudgetTakeawayGuard', () => {
  it('protects every instructional Budget Town takeaway', () => {
    expect(PROTECTED_BUDGET_TAKEAWAYS).toHaveLength(6)
    PROTECTED_BUDGET_TAKEAWAYS.forEach((message) => expect(isProtectedBudgetTakeaway(message)).toBe(true))
  })

  it('does not block ordinary animation toasts', () => {
    expect(isProtectedBudgetTakeaway('Here comes the school bus...')).toBe(false)
    expect(isProtectedBudgetTakeaway('The lights come on!')).toBe(false)
    expect(isProtectedBudgetTakeaway(null)).toBe(false)
  })
})
