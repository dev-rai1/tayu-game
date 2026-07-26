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
    choices: ['To be ready for a goal or surprise expense', 'So money can never be used', 'To spend it all the next day'],
    correct: 0,
  },
  {
    id: 'profit',
    prompt: 'A lemonade stand earns $10 and spends $6 on supplies. What is its profit?',
    choices: ['$4', '$6', '$16'],
    correct: 0,
  },
]

export function scoreKnowledgeQuiz(answers) {
  return KNOWLEDGE_QUESTIONS.reduce(
    (score, question) => score + (answers?.[question.id] === question.correct ? 1 : 0),
    0,
  )
}

export function knowledgeChange(assessment) {
  if (!assessment?.pre || !assessment?.post) return null
  return assessment.post.score - assessment.pre.score
}
