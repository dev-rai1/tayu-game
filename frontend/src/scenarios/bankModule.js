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
    bubble: 'Checking, savings, and CDs trade easy access for different growth. Compare them before choosing.',
    dingChecking: 'Checking: easy to use; earns $0 here.',
    dingSavings: 'Savings: still reachable; earns 50 cents.',
    dingCd: 'CD: locked longer; earns $1.',
    card: 'Where should the money live? Compare access now with growth later.',
    safe: 'Mostly SAVINGS',
    smart: 'Savings plus a CD',
    cash: 'All CHECKING',
    doneSafe: 'Most money stayed reachable and still earned something.',
    doneSmart: 'Some money stayed reachable while the locked part earned more.',
    doneCash: 'Checking was easy to use, but it earned nothing.',
    summary: 'Interest is money paid for keeping funds in an account. More restrictions can sometimes mean more interest.',
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

export const TRUST_NAMED = 'This TRUST score represents credit trust. Paying on time and borrowing carefully can improve it.'

export const BK_HANDOFF = (garden) =>
  `The bank money is protected and growing. The $${garden} set aside for the Money Garden is ready for the next decisions.`

export const BK_OPEN = (bank) =>
  `You placed $${bank} in the bank. Compare the account choices and watch how each decision changes the balance.`
