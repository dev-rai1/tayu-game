import { describe, expect, it } from 'vitest'
import {
  badgesForModules,
  completedRequiredModules,
  isLearningPathComplete,
  milestoneBadges,
  moduleNumbersForPath,
  normalizeLearningPath,
  requiredModules,
} from './learningPaths.js'

describe('grade-aware learning paths', () => {
  it('ends the early-elementary path after the Lemonade Stand', () => {
    expect(moduleNumbersForPath('early-elementary')).toEqual([1, 2])
  })

  it('keeps the full foundation sequence for middle and high school', () => {
    expect(moduleNumbersForPath('middle-school')).toEqual([1, 2, 3, 4, 5])
    expect(moduleNumbersForPath('high-school')).toEqual([1, 2, 3, 4, 5])
  })

  it('lets a teacher-assigned path override the general recommendation', () => {
    expect(requiredModules({
      pathId: 'early-elementary',
      classroomModules: [2, 4],
      plain: false,
    })).toEqual([2, 4])
  })

  it('normalizes repeated or invalid custom modules', () => {
    expect(normalizeLearningPath({ id: 'class-a', modules: [4, 2, 4, 9, 0] })).toMatchObject({
      id: 'class-a',
      modules: [2, 4],
    })
  })

  it('counts only completed modules that belong to the required path', () => {
    expect(completedRequiredModules([1, 2, 3], [1, 3, 5])).toEqual([1, 3])
  })

  it('maps required modules to the badges used by the game', () => {
    expect(badgesForModules([1, 2, 4])).toEqual(['jars', 'lemonade', 'bank'])
  })

  it('unlocks a short-path certificate only when every required badge exists', () => {
    expect(isLearningPathComplete([1, 2], ['jars'])).toBe(false)
    expect(isLearningPathComplete([1, 2], ['jars', 'lemonade'])).toBe(true)
    expect(isLearningPathComplete([2, 4], ['lemonade', 'bank', 'garden'])).toBe(true)
  })

  it('recognizes the true end of modules before the next module opens', () => {
    expect(milestoneBadges({ week: 2, weekComplete: true })).toContain('lemonade')
    expect(milestoneBadges({ btStage: 'handoff' })).toContain('budget')
    expect(milestoneBadges({ bkWeek: 7 })).toContain('bank')
    expect(milestoneBadges({ mgPhase: 'done' })).toContain('garden')
  })
})
