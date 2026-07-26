import { describe, expect, it } from 'vitest'
import { KNOWLEDGE_QUESTIONS, knowledgeChange, scoreKnowledgeQuiz } from './knowledgeQuiz.js'

describe('knowledge quiz scoring', () => {
  it('scores the three fixed questions', () => {
    const answers = Object.fromEntries(KNOWLEDGE_QUESTIONS.map((question) => [question.id, question.correct]))
    expect(scoreKnowledgeQuiz(answers)).toBe(3)
    expect(scoreKnowledgeQuiz({ ...answers, profit: 1 })).toBe(2)
  })

  it('only calculates change after both quizzes exist', () => {
    expect(knowledgeChange({ pre: { score: 1 } })).toBeNull()
    expect(knowledgeChange({ pre: { score: 1 }, post: { score: 3 } })).toBe(2)
  })
})
