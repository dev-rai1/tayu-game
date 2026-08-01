export const MARKET_MATH_CHALLENGES = {
  'K-2': {
    label: 'Add the prices',
    prompt: 'An apple costs $2 and water costs $2. How much do they cost together?',
    choices: ['$2', '$4', '$6'],
    answer: 1,
    explanation: '$2 + $2 = $4.',
  },
  '3-5': {
    label: 'Find the change',
    prompt: 'You have $10. Bread costs $3 and water costs $2. How much money is left?',
    choices: ['$3', '$5', '$7'],
    answer: 1,
    explanation: 'The basket costs $5. $10 minus $5 leaves $5.',
  },
  '6-8': {
    label: 'Plan several steps',
    prompt: 'Your Spend jar has $18. Needs cost $7, a want costs $5, and you keep $4 unspent. How much is left after the plan?',
    choices: ['$2', '$4', '$6'],
    answer: 0,
    explanation: '$18 minus $7 minus $5 minus $4 leaves $2.',
  },
  '9-12': {
    label: 'Use percentages',
    prompt: 'You have $30. You save 40% and give 10%. How much remains available to spend?',
    choices: ['$12', '$15', '$18'],
    answer: 1,
    explanation: 'Saving 40% is $12 and giving 10% is $3. $30 minus $15 leaves $15 to spend.',
  },
}

export function normalizeChallengeGrade(grade) {
  if (MARKET_MATH_CHALLENGES[grade]) return grade
  return grade === 'mixed' ? '3-5' : 'K-2'
}

export function marketMathChallengeForGrade(grade) {
  return MARKET_MATH_CHALLENGES[normalizeChallengeGrade(grade)]
}
