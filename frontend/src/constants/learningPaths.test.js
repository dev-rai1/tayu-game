import { describe, expect, it } from 'vitest'
import {
  badgesForModules,
  completedRequiredModules,
  isLearningPathComplete,
  moduleNumbersForPath,
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
})
