export const MODULE_CHECKS = {
  jars: {
    moduleNumber: 1,
    title: 'Market & Three Jars',
    cosmetic: { icon: '🪙', name: 'Golden Money Pin' },
    questions: [
      {
        prompt: 'Why can spreading money across Spend, Save, and Give be useful?',
        choices: ['It guarantees every purchase is cheap', 'It gives different dollars different jobs', 'It makes money double immediately'],
        answer: 1,
        trick: 'The key is giving money different jobs: today, later, and helping others. This first money plan becomes the foundation for later business, budgeting, banking, and investing choices.',
      },
      {
        prompt: 'At the market, what should usually come before a want?',
        choices: ['The most colorful item', 'Whatever costs the most', 'A need such as food or water'],
        answer: 2,
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
        choices: ['Only the stand color', 'A random coin flip', 'Price, demand, hours, and supply size'],
        answer: 2,
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
        choices: ['Because ready cash always grows fastest', 'To avoid planning for needs', 'To handle a surprise without selling long-term investments'],
        answer: 2,
        trick: 'Ready cash is a safety cushion for surprises. It protects longer-term plans from short-term expenses.',
      },
      {
        prompt: 'Which statement best compares Bank and Money Garden?',
        choices: ['Bank is steadier; Money Garden has more growth potential and more risk', 'Both always grow at the same speed', 'Money Garden can never lose value'],
        answer: 0,
        trick: 'Bank money usually changes more slowly and has lower risk. Money Garden can grow more, but it can also lose value.',
      },
    ],
  },
  bank: {
    moduleNumber: 4,
    title: 'Bank of TAYU',
    cosmetic: { icon: '🛡️', name: 'Credit Habits Shield' },
    questions: [
      {
        prompt: 'What is the main difference between debit and credit?',
        choices: ['Debit always charges interest; credit never does', 'Debit uses owned checking money; credit borrows and creates a bill', 'There is no difference'],
        answer: 1,
        trick: 'Debit uses money already in the account. Credit borrows money that must be repaid.',
      },
      {
        prompt: 'A surprise prize message asks for money first. What is the safest response?',
        choices: ['Pause, refuse, and ask a trusted adult', 'Send the money quickly', 'Share private account information'],
        answer: 0,
        trick: 'Pressure, unexpected prizes, and requests for money or private information are warning signs.',
      },
    ],
  },
  garden: {
    moduleNumber: 6,
    title: 'Money Garden',
    cosmetic: { icon: '🌱', name: 'Sprout Crown' },
    questions: [
      {
        prompt: 'What does owning a share of stock mean?',
        choices: ['You own a small piece of the company', 'The company guarantees you profit', 'You lent the company money that must be repaid tomorrow'],
        answer: 0,
        trick: 'A stock represents ownership in a company. A share is one unit of that ownership, and its value can rise or fall.',
      },
      {
        prompt: 'Why spread investments across more than one company?',
        choices: ['To guarantee every company rises', 'To remove all market risk', 'To reduce the damage if one company struggles'],
        answer: 2,
        trick: 'Diversification cannot remove all risk, but it reduces concentration risk by making the portfolio depend less on one company.',
      },
      {
        prompt: 'A price drops but the business still looks healthy. What should a careful investor do first?',
        choices: ['Always sell immediately', 'Check the business evidence before reacting', 'Ignore every future warning sign'],
        answer: 1,
        trick: 'Price movement and business health are not the same thing. Research the company and the reason for the change before reacting.',
      },
      {
        prompt: 'Why does time horizon matter when deciding how much money to invest?',
        choices: ['Money needed soon may need to stay ready instead of exposed to market swings', 'Longer time always guarantees a profit', 'Time horizon only matters for checking accounts'],
        answer: 0,
        trick: 'Time horizon is how long until you need the money. Short-term needs should not depend on being able to sell an investment at a good price that day.',
      },
      {
        prompt: 'What does rebalancing mean?',
        choices: ['Buying whichever stock rose the most today', 'Adjusting holdings back toward the planned mix and risk level', 'Selling every investment after one bad week'],
        answer: 1,
        trick: 'As prices change, one holding can become too large. Rebalancing brings the portfolio closer to its intended mix instead of chasing the latest winner.',
      },
    ],
  },
}

export const BADGE_ORDER = ['jars', 'lemonade', 'budget', 'bank', 'garden']

export function moduleCheckForBadge(badge) {
  return MODULE_CHECKS[badge] || null
}
