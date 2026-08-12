export const KNOWLEDGE_QUESTIONS = [
  {
    id: 'budget_priority',
    prompt: 'When you make a budget, what should you pay for first?',
    choices: ['Needs, like food and housing', 'Wants, like games and treats', 'Whatever costs the most'],
    correct: 0,
  },
  {
    id: 'saving_growth',
    prompt: 'What is the best reason to save some money?',
    choices: ['So money can never be used', 'To be ready for a goal or surprise expense', 'To spend it all the next day'],
    correct: 1,
  },
  {
    id: 'profit',
    prompt: 'A lemonade stand earns $10 and spends $6 on supplies. What is its profit?',
    choices: ['$6', '$16', '$4'],
    correct: 2,
  },
  {
    id: 'stock_vs_bond',
    prompt: 'What is the difference between buying a stock and buying a bond?',
    choices: ['A stock is ownership; a bond is a loan', 'A bond always grows faster than a stock', 'They are the same thing'],
    correct: 0,
    gradeBands: ['middle-school', 'high-school'],
  },
  {
    id: 'tax_refund',
    prompt: 'Why might you get a tax REFUND at the end of the year?',
    choices: ['Your employer withheld MORE than you actually owe', 'You earned too much money', 'The government made a mistake'],
    correct: 0,
    gradeBands: ['middle-school', 'high-school'],
  },
]

export function questionsForGradePath(pathId) {
  return KNOWLEDGE_QUESTIONS.filter((question) => !question.gradeBands || question.gradeBands.includes(pathId))
}

export function scoreKnowledgeQuiz(answers, questions = KNOWLEDGE_QUESTIONS) {
  return questions.reduce(
    (score, question) => score + (answers?.[question.id] === question.correct ? 1 : 0),
    0,
  )
}

export function knowledgeChange(assessment) {
  if (!assessment?.pre || !assessment?.post) return null
  return assessment.post.score - assessment.pre.score
}
