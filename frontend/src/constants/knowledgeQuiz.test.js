import { describe, expect, it } from 'vitest'
import { KNOWLEDGE_QUESTIONS, knowledgeChange, scoreKnowledgeQuiz } from './knowledgeQuiz.js'

describe('knowledge quiz scoring', () => {
  it('scores every fixed pre/post question', () => {
    const answers = Object.fromEntries(KNOWLEDGE_QUESTIONS.map((question) => [question.id, question.correct]))
    expect(scoreKnowledgeQuiz(answers)).toBe(KNOWLEDGE_QUESTIONS.length)
    expect(scoreKnowledgeQuiz({ ...answers, profit: 0 })).toBe(KNOWLEDGE_QUESTIONS.length - 1)
  })

  it('still uses all three answer positions in the expanded pre/post quiz', () => {
    expect(new Set(KNOWLEDGE_QUESTIONS.map((question) => question.correct))).toEqual(new Set([0, 1, 2]))
  })

  it('keeps each correct index within its choices', () => {
    KNOWLEDGE_QUESTIONS.forEach((question) => {
      expect(question.correct).toBeGreaterThanOrEqual(0)
      expect(question.correct).toBeLessThan(question.choices.length)
    })
  })

  it('only calculates change after both quizzes exist', () => {
    expect(knowledgeChange({ pre: { score: 1 } })).toBeNull()
    expect(knowledgeChange({ pre: { score: 1 }, post: { score: 3 } })).toBe(2)
  })
})
