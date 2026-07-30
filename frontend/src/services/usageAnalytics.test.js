import { describe, expect, it } from 'vitest'
import { appendLearningEvent, learningEventKey } from './usageAnalytics.js'

describe('playtest learning analytics', () => {
  it('uses stable module and event keys', () => {
    expect(learningEventKey('lemonade', 'choice_attempt')).toBe('lemonade:choice_attempt')
    expect(learningEventKey('', 'retry_prompt')).toBe('unknown:retry_prompt')
  })

  it('counts attempts and preserves a bounded event history', () => {
    let session = { currentModule: 'jars', eventCounts: {}, learningEvents: [] }
    session = appendLearningEvent(session, { type: 'choice_attempt', outcome: 'incorrect', detail: 'first' }, '2026-07-29T20:00:00Z')
    session = appendLearningEvent(session, { moduleName: 'jars', type: 'retry_prompt', outcome: 'directional' }, '2026-07-29T20:00:01Z')

    expect(session.eventCounts['jars:choice_attempt']).toBe(1)
    expect(session.eventCounts['jars:retry_prompt']).toBe(1)
    expect(session.learningEvents).toHaveLength(2)
    expect(session.learningEvents[0]).toMatchObject({ moduleName: 'jars', outcome: 'incorrect' })
    expect(session.lastModule).toBe('jars')
  })

  it('limits stored event detail and event history', () => {
    let session = { currentModule: 'garden', eventCounts: {}, learningEvents: [] }
    for (let index = 0; index < 140; index += 1) {
      session = appendLearningEvent(session, {
        type: 'choice_attempt',
        outcome: 'revise',
        detail: 'x'.repeat(300),
      }, `2026-07-29T20:00:${String(index % 60).padStart(2, '0')}Z`)
    }
    expect(session.learningEvents).toHaveLength(120)
    expect(session.learningEvents.at(-1).detail).toHaveLength(160)
    expect(session.eventCounts['garden:choice_attempt']).toBe(140)
  })
})
