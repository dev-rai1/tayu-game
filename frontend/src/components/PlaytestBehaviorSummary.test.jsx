import { describe, expect, it } from 'vitest'
import { summarizeLearningSessions } from './PlaytestBehaviorSummary.jsx'

describe('playtest behavior summary', () => {
  it('totals attempts, incorrect outcomes, retries, completions, and stop points', () => {
    const summary = summarizeLearningSessions([
      {
        endedAt: '2026-07-29T20:00:00Z',
        lastModule: 'lemonade',
        eventCounts: {
          'lemonade:choice_attempt': 3,
          'lemonade:retry_prompt': 2,
          'lemonade:module_complete': 1,
        },
        learningEvents: [
          { moduleName: 'lemonade', type: 'choice_attempt', outcome: 'incorrect' },
          { moduleName: 'lemonade', type: 'choice_attempt', outcome: 'revise' },
          { moduleName: 'lemonade', type: 'choice_attempt', outcome: 'effective' },
        ],
      },
      {
        endedAt: '2026-07-29T21:00:00Z',
        lastModule: 'garden',
        eventCounts: {
          'garden:choice_attempt': 1,
          'garden:retry_prompt': 1,
        },
        learningEvents: [{ moduleName: 'garden', type: 'choice_attempt', outcome: 'incorrect' }],
      },
    ])

    expect(summary.attempts).toBe(4)
    expect(summary.incorrect).toBe(2)
    expect(summary.retries).toBe(3)
    expect(summary.completions).toBe(1)
    expect(summary.stoppedByModule.lemonade).toBe(1)
    expect(summary.stoppedByModule.garden).toBe(1)
  })
})
