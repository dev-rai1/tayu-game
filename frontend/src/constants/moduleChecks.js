export const MODULE_CHECKS = Object.freeze({
  1: {
    mastery: 'I can give money different jobs and choose needs before wants.',
    questions: [
      {
        prompt: 'Which jar helps you pay for something later?',
        choices: ['SPEND', 'SAVE', 'GIVE'],
        answer: 1,
        success: 'Yes. SAVE money waits for a future goal.',
        close: 'Close. SAVE money waits for a future goal.',
      },
      {
        prompt: 'What should you put in your basket first?',
        choices: ['A need', 'A want', 'The most expensive item'],
        answer: 0,
        success: 'Yes. Needs come before wants.',
        close: 'Close. Pick the need first. Add a want only when it fits your plan.',
      },
    ],
  },
  2: {
    mastery: 'I can set a price by using costs, pay, and a small profit.',
    questions: [
      {
        prompt: 'What do you subtract from sales to find profit?',
        choices: ['Supplies and your pay', 'Only tax', 'Nothing'],
        answer: 0,
        success: 'Yes. Profit is what remains after supplies and your pay.',
        close: 'Close. Subtract supplies and your pay from sales to find profit.',
      },
      {
        prompt: 'When does TAYU calculate town tax?',
        choices: ['On profit', 'On every dollar of sales', 'Before supplies are paid'],
        answer: 0,
        success: 'Yes. Town tax is calculated on profit.',
        close: 'Close. TAYU calculates town tax on profit.',
      },
    ],
  },
  3: {
    mastery: 'I can pay needs first and keep pocket money for surprises.',
    questions: [
      {
        prompt: 'Which cost should a family plan for first?',
        choices: ['Rent', 'A ride for fun', 'A new game'],
        answer: 0,
        success: 'Yes. A safe home is a need.',
        close: 'Close. Rent pays for the home, so it comes first.',
      },
      {
        prompt: 'What is pocket money for in this plan?',
        choices: ['Surprise costs', 'Making every purchase', 'Replacing the bank'],
        answer: 0,
        success: 'Yes. Pocket money can cover a surprise cost.',
        close: 'Close. Pocket money is the cushion for surprise costs.',
      },
    ],
  },
  4: {
    mastery: 'I can match checking, savings, and credit to the right job.',
    questions: [
      {
        prompt: 'Which account is made for money you use soon?',
        choices: ['Checking', 'A CD', 'A locked vault'],
        answer: 0,
        success: 'Yes. Checking is made for everyday payments.',
        close: 'Close. Checking is the account for money you use soon.',
      },
      {
        prompt: 'What is the safest response to a suspicious money message?',
        choices: ['Ignore it and ask a trusted adult', 'Send the requested information', 'Pay quickly'],
        answer: 0,
        success: 'Yes. Stop and ask a trusted adult.',
        close: 'Close. Do not send money or information. Ask a trusted adult.',
      },
    ],
  },
  5: {
    mastery: 'I can spread risk and avoid selling only because a price dips.',
    questions: [
      {
        prompt: 'Why can planting money in more than one company help?',
        choices: ['It spreads risk', 'It guarantees a profit', 'It stops prices from moving'],
        answer: 0,
        success: 'Yes. Spreading money can reduce the effect of one company falling.',
        close: 'Close. More than one company spreads risk. It does not guarantee a profit.',
      },
      {
        prompt: 'A price dips for one week. What should you do first?',
        choices: ['Check the lesson and your plan', 'Sell everything at once', 'Assume the company is gone'],
        answer: 0,
        success: 'Yes. Check the reason and your plan before reacting.',
        close: 'Close. A dip alone is not a reason to sell everything.',
      },
    ],
  },
})
