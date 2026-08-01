import { describe, expect, it } from 'vitest'
import { addModuleCheckAttempt, moduleCheckProgress, normalizeCheckAttempts } from './modulePractice.js'

describe('module practice history', () => {
  it('upgrades an older single-score record into attempt history', () => {
    const older = { score: 1, total: 2, completedAt: '2026-07-01T00:00:00.000Z' }
    expect(normalizeCheckAttempts(older)).toEqual([older])

    const updated = addModuleCheckAttempt(older, {
      score: 2,
      total: 2,
      completedAt: '2026-08-01T00:00:00.000Z',
    })

    expect(updated.attempts).toHaveLength(2)
    expect(updated.bestScore).toBe(2)
    expect(updated.attemptCount).toBe(2)
  })

  it('reports latest and personal-best scores separately', () => {
    const entry = addModuleCheckAttempt(
      addModuleCheckAttempt(null, { score: 2, total: 2, completedAt: 'first' }),
      { score: 1, total: 2, completedAt: 'second' },
    )

    expect(moduleCheckProgress(entry)).toEqual({
      attempts: 2,
      bestScore: 2,
      latestScore: 1,
      total: 2,
    })
  })

  it('keeps only the newest configured number of attempts', () => {
    let entry = null
    for (let index = 0; index < 5; index += 1) {
      entry = addModuleCheckAttempt(entry, { score: index % 3, total: 2, completedAt: String(index) }, 3)
    }
    expect(entry.attempts.map((attempt) => attempt.completedAt)).toEqual(['2', '3', '4'])
  })
})
