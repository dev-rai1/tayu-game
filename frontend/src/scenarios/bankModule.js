// MODULE 4 - THE BANK OF TAYU: LEARN BY DOING.
// Each beat now repeats the decision rule in the text that remains on the
// decision/result card. Animations may move quickly, but the lesson does not
// disappear before the player can use it.

export const DEBIT_ITEM = { label: 'a team water bottle', cost: 3 }
export const CARD_PURCHASE = 5
export const CARD_MIN_PAY = 1
export const SAVINGS_DING = 0.5
export const CD_DING = 1
export const TRUST_MAX = 6

export const BK = {
  w1: {
    bubble: 'Hand me your coins. The vault keeps them safe, and you can still get them back when you need them.',
    card: 'Banker Bea waves you to the counter. A bank stores money securely instead of leaving it where it can be lost or spent by accident.',
    give: (amt) => `Put my $${amt} in the vault`,
    thunk: 'THUNK! Your money is safe in the vault.',
    summary: 'Lesson: A bank keeps money safe and available. Your deposit is still your money, and you can withdraw it later.',
    learn: 'banks',
  },
  w2: {
    bubble: 'Checking, savings, and CDs do different jobs. Read the choices before deciding where your money should live.',
    dingChecking: 'Checking: easy to use anytime, but it earns $0 here.',
    dingSavings: 'Savings: still reachable, and it earns 50 cents.',
    dingCd: 'CD: locked for longer, so it earns $1.',
    card: 'Choose where your money should live. Checking is easiest to spend, savings grows slowly, and a CD earns more because you agree not to touch it for a while.',
    safe: 'Mostly SAVINGS',
    smart: 'Savings plus a CD',
    cash: 'All CHECKING',
    doneSafe: 'You kept most of it reachable while still letting it grow. That is a balanced choice.',
    doneSmart: 'You kept some money reachable and let the CD earn more. Patience paid you.',
    doneCash: 'Checking is easy to use, but it earned nothing. Next time, move some money to savings or a CD.',
    summary: 'Lesson: Interest is money the bank pays you. Savings usually earns a little; a CD may earn more because the money stays locked longer.',
    learn: 'cd',
  },
  w3: {
    bubble: 'A debit card spends money that is already in your checking account. Watch the balance as you buy the water bottle.',
    beep: `Beep! $${DEBIT_ITEM.cost} came directly out of YOUR checking balance.`,
    summary: 'Lesson: A debit card is not extra money. It spends your own money immediately, so check your balance before using it.',
    learn: 'debitcredit',
  },
  w4: {
    bubble: "A credit card borrows the bank's money. The purchase feels quick, but the bill still has to be paid later.",
    bill: `Your $${CARD_PURCHASE} credit-card bill arrived. Paying the full bill avoids extra interest.`,
    card: 'The bill is here. Paying all of it on time costs exactly what you borrowed. Paying only a little leaves debt behind, and interest can make that debt grow.',
    full: `Pay it ALL ($${CARD_PURCHASE})`,
    little: `Pay only $${CARD_MIN_PAY})`,
    doneFull: 'You paid the whole bill on time. No extra interest was added.',
    puff: 'The unpaid part of the bill grew because interest worked against you.',
    doneLittle: 'You paid only part of the bill, so the remaining debt grew and cost $1 extra.',
    summary: 'Lesson: Credit is borrowed money. Pay the full bill on time whenever possible so interest does not increase what you owe.',
    learn: 'compounddebt',
  },
  w5: {
    bubble: 'Six cards can create six bills, six due dates, and six chances for fees. More borrowing can become hard to track.',
    merge: 'One plan. One payment. A lower rate.',
    card: 'The nonprofit helper combined six bills into one clearer payment plan. Getting trustworthy help can make debt easier to manage.',
    button: 'Use one clear payment plan',
    summary: 'Lesson: Debt can grow, but help exists. A trusted nonprofit counselor can explain options and help organize payments.',
    learn: 'debthelp',
  },
  w6: {
    bubble: 'You won a prize, but a stranger says you must send $5 first. Stop and think before touching your money.',
    card: 'A stranger wants $5 to deliver a prize. Real prizes and real banks do not require secret payments to strangers.',
    refuse: 'Do not send money',
    send: 'Send the $5',
    shield: 'Correct. Never send money or account information to an unknown person who promises a prize.',
    coach: 'Bea stopped the payment. Next time, pause, refuse, and ask a trusted adult before sending money.',
    summary: 'Lesson: Unexpected prize messages that ask for money are scams. Do not pay, click, or share account information.',
    learn: 'scams',
  },
}

export const DEBT_HELP = 'Trusted nonprofit counselors can help combine or organize debts, explain payment options, and talk with lenders. Asking for help early is a smart decision.'

export const TRUST_NAMED = 'This is your TRUST score, often called a credit score. Paying bills on time and borrowing carefully can build trust over time.'

export const BK_HANDOFF = (garden) =>
  `Your bank money is safe and growing. Now the $${garden} you set aside for the Money Garden is ready. Follow the path and use the lesson on screen before making each choice.`

export const BK_OPEN = (bank) =>
  `You chose to keep $${bank} in the bank. Open the account, watch what happens to the balance, and read the lesson card before each decision.`