export const MODULE_CHECKS = {
  jars: {
    moduleNumber: 1,
    title: 'Market & Three Jars',
    cosmetic: { icon: '🪙', name: 'Golden Money Pin' },
    questions: [
      {
        prompt: 'Why can spreading money across Spend, Save, and Give be useful?',
        choices: ['It gives different dollars different jobs', 'It guarantees every purchase is cheap', 'It makes money double immediately'],
        answer: 0,
        trick: 'The key is giving money different jobs: today, later, and helping others. This first money plan becomes the foundation for later business, budgeting, banking, and investing choices.',
      },
      {
        prompt: 'At the market, what should usually come before a want?',
        choices: ['A need such as food or water', 'The most colorful item', 'Whatever costs the most'],
        answer: 0,
        trick: 'Needs support daily life. Wants can fit after important needs are covered.',
      },
    ],
  },
  lemonade: {
    moduleNumber: 2,
    title: 'Lemonade Stand',
    cosmetic: { icon: '🍋', name: 'Lemonade Visor' },
    questions: [
      {
        prompt: 'What is profit?',
        choices: ['Revenue before any costs', 'What remains after business costs and the player’s work are paid', 'The amount charged per cup'],
        answer: 1,
        trick: 'Profit is what remains after the costs of running the business are covered.',
      },
      {
        prompt: 'A stand has many leftover cups. What evidence should the owner check first?',
        choices: ['Price, demand, hours, and supply size', 'Only the stand color', 'A random coin flip'],
        answer: 0,
        trick: 'Leftovers are evidence. Compare the plan’s price, demand, hours, and supply size before changing one lever.',
      },
    ],
  },
  budget: {
    moduleNumber: 3,
    title: 'Budget Town',
    cosmetic: { icon: '📘', name: 'Budget Planner Badge' },
    questions: [
      {
        prompt: 'Why keep some money ready in a Pocket category?',
        choices: ['To handle a surprise without selling long-term investments', 'Because ready cash always grows fastest', 'To avoid planning for needs'],
        answer: 0,
        trick: 'Ready cash is a safety cushion for surprises. It protects longer-term plans from short-term expenses.',
      },
      {
        prompt: 'Which statement best compares Bank and Money Garden?',
        choices: ['Both always grow at the same speed', 'Bank is steadier; Money Garden has more growth potential and more risk', 'Money Garden can never lose value'],
        answer: 1,
        trick: 'Bank money usually changes more slowly and has lower risk. Money Garden can grow more, but it can also lose value.',
      },
    ],
  },
  bank: {
    moduleNumber: 4,
    title: 'Bank of TAYU',
    cosmetic: { icon: '🛡️', name: 'Trust Shield' },
    questions: [
      {
        prompt: 'What is the main difference between debit and credit?',
        choices: ['Debit uses owned checking money; credit borrows and creates a bill', 'Debit always charges interest; credit never does', 'There is no difference'],
        answer: 0,
        trick: 'Debit uses money already in the account. Credit borrows money that must be repaid.',
      },
      {
        prompt: 'A surprise prize message asks for money first. What is the safest response?',
        choices: ['Send the money quickly', 'Pause, refuse, and ask a trusted adult', 'Share private account information'],
        answer: 1,
        trick: 'Pressure, unexpected prizes, and requests for money or private information are warning signs.',
      },
    ],
  },
  garden: {
    moduleNumber: 5,
    title: 'Money Garden',
    cosmetic: { icon: '🌱', name: 'Sprout Crown' },
    questions: [
      {
        prompt: 'Why spread investments across more than one company?',
        choices: ['To reduce the damage if one company struggles', 'To guarantee every company rises', 'To remove all market risk'],
        answer: 0,
        trick: 'Diversification cannot remove all risk, but it can reduce dependence on one company.',
      },
      {
        prompt: 'A price drops but the store is still busy and healthy. What should a careful investor do?',
        choices: ['Check the business evidence before reacting', 'Always sell immediately', 'Ignore every future warning sign'],
        answer: 0,
        trick: 'A price move needs context. Check customers, company health, news, and the longer trend before deciding.',
      },
    ],
  },
}

export const BADGE_ORDER = ['jars', 'lemonade', 'budget', 'bank', 'garden']

export function moduleCheckForBadge(badge) {
  return MODULE_CHECKS[badge] || null
}
