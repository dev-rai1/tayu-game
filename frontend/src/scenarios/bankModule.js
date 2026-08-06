// MODULE 4 - THE BANK OF TAYU: LEARN BY DOING.
// The player sees one decision, one consequence, and one short takeaway.

export const DEBIT_ITEM = { label: 'a team water bottle', cost: 3 }
export const CARD_PURCHASE = 5
export const CARD_MIN_PAY = 1
export const SAVINGS_DING = 0.5
export const CD_DING = 1
export const TRUST_MAX = 6

export const BK = {
  w1: {
    bubble: 'Would you leave the coins outside or place them somewhere protected?',
    card: 'A bank protects money while keeping it yours.',
    give: (amount) => `Deposit my $${amount}`,
    thunk: 'THUNK! The deposit is protected.',
    summary: 'A bank stores money securely, and you can withdraw it later.',
    learn: 'banks',
  },
  w2: {
    bubble: 'These accounts work differently. Checking is easiest to use now. Savings earns a little. A CD earns more, but the money stays locked longer.',
    dingChecking: 'Checking: use the money anytime; earns $0 here.',
    dingSavings: 'Savings: the money is still easy to reach; earns 50 cents.',
    dingCd: 'CD: the money stays locked for longer; earns $1.',
    card: 'Choose what matters for each dollar: using it soon or letting it earn more while you wait.',
    safe: 'Mostly SAVINGS',
    smart: 'Savings plus a CD',
    cash: 'All CHECKING',
    doneSafe: 'Most money stayed easy to reach and still earned something.',
    doneSmart: 'Some money stayed easy to reach. The locked part earned more.',
    doneCash: 'Checking was easy to use, but it earned nothing.',
    summary: 'Interest is extra money an account can earn. Accounts that make you wait longer may pay more interest.',
    learn: 'cd',
  },
  w3: {
    bubble: 'A debit purchase uses money already in checking. Watch the balance.',
    beep: `Beep! $${DEBIT_ITEM.cost} came directly from checking.`,
    summary: 'Debit uses your own money immediately. Check the balance before spending.',
    learn: 'debitcredit',
  },
  w4: {
    bubble: 'Credit borrows money now and creates a bill later.',
    bill: `A $${CARD_PURCHASE} bill arrived. Compare paying all of it with paying only part.`,
    card: 'One choice ends the debt. The other leaves a balance that can grow.',
    full: `Pay all ($${CARD_PURCHASE})`,
    little: `Pay only $${CARD_MIN_PAY}`,
    doneFull: 'The full bill was paid. No extra interest was added.',
    puff: 'The unpaid balance grew because of interest.',
    doneLittle: 'Part of the bill remained, and the debt cost $1 more.',
    summary: 'Credit is borrowed money. An unpaid balance can grow through interest.',
    learn: 'compounddebt',
  },
  w5: {
    bubble: 'Six cards mean six bills and six due dates. How could the plan become easier to manage?',
    merge: 'One plan. One payment. A lower rate.',
    card: 'A trusted nonprofit counselor can explain options and organize debts.',
    button: 'Use one clear payment plan',
    summary: 'Getting trustworthy help early can make debt easier to understand and manage.',
    learn: 'debthelp',
  },
  w6: {
    bubble: 'A stranger promises a prize but asks for $5 first. What warning signs do you notice?',
    card: 'Choose whether to send money to the unexpected stranger.',
    refuse: 'Do not send money',
    send: 'Send the $5',
    shield: 'Good choice. Unexpected prizes should not require secret payments or account information.',
    coach: 'The payment was stopped. Pause, refuse, and ask a trusted adult when a message pressures you.',
    summary: 'Prize messages that demand money or private information are common scams.',
    learn: 'scams',
  },
}

export const DEBT_HELP = 'Trusted nonprofit counselors can explain payment options, help organize debts, and talk with lenders.'

export const TRUST_NAMED = 'This practice meter shows habits connected to credit, such as paying on time and borrowing carefully. It is not a real credit score.'

export const BK_HANDOFF = (garden) =>
  `The bank money is protected and growing. The $${garden} set aside for the Money Garden is ready for the next decisions.`

export const BK_OPEN = (bank) =>
  `You placed $${bank} in the bank. Compare the account choices and watch how each decision changes the balance.`
