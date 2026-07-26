// MODULE 4 - THE BANK OF TAYU v4 (Round 9, Part 6): LEARN BY DOING.
// No text blocks: the NPCs PERFORM the banking in the world (teller walks
// coins to the vault, interest dings at three teller windows, the debit
// swipe, the bill envelope that puffs bigger, six debt blobs merged by a
// helper, the scammer shooed) with tiny speech bubbles over their heads.
// One continuous guided sequence - the child never re-clicks Bea to advance.

export const DEBIT_ITEM = { label: 'a team water bottle', cost: 3 }
export const CARD_PURCHASE = 5
export const CARD_MIN_PAY = 1
export const SAVINGS_DING = 0.5
export const CD_DING = 1 // the locked drawer pays the most
export const TRUST_MAX = 6

// Every line here is spoken as a BUBBLE over an acting NPC, or shown as a
// one-line card with at most two or three buttons. Nothing longer.
export const BK = {
  w1: {
    bubble: 'Hand me your coins - the vault keeps them SAFE.',
    card: 'Banker Bea waves you to the counter.',
    give: (amt) => `Give Bea my $${amt}`,
    thunk: 'THUNK! Safe in the vault.',
    summary: 'Your money sleeps behind a giant steel door - and you can take it out any time.',
    learn: 'banks',
  },
  w2: {
    bubble: 'Three windows: CHECKING, SAVINGS, CD. The longer money stays, the more the bank pays!',
    dingChecking: 'Checking: grab it anytime... earns $0.',
    dingSavings: 'Savings: DING! +50 cents.',
    dingCd: 'CD: locked up... DING DING! +$1!',
    card: 'Where should YOUR money live?',
    safe: 'Mostly SAVINGS',
    smart: 'Some in a CD too',
    cash: 'All CHECKING',
    doneSafe: 'Slow and steady - and you can still reach it.',
    doneSmart: 'The locked CD earns the most. Patience pays!',
    doneCash: 'Easy to grab - but it earns nothing. Next time, let a little grow.',
    summary: 'The bank payment is interest. Simple interest uses the starting balance. Compound interest adds earlier interest to the balance, so it can earn interest too.',
    learn: 'cd',
  },
  w3: {
    bubble: 'This DEBIT card is a key to YOUR checking. Water bottle time!',
    beep: `Beep! $${DEBIT_ITEM.cost} from YOUR checking.`,
    summary: 'A debit card spends your own money - it is a key, not extra cash.',
    learn: 'debitcredit',
  },
  w4: {
    bubble: "A CREDIT card borrows the BANK's money. Watch what follows it home...",
    bill: `Bill! $${CARD_PURCHASE}, please.`,
    card: 'The bill is here. What do you do?',
    full: `Pay it ALL ($${CARD_PURCHASE})`,
    little: `Pay a little ($${CARD_MIN_PAY})`,
    doneFull: 'Whole bill, on time - zero extra. That is the credit-card superpower.',
    puff: 'The bill GREW - interest works against you!',
    doneLittle: 'Bea helped you clear the grown bill. The little-pay cost $1 extra.',
    summary: 'Pay it all, on time.',
    learn: 'compounddebt',
  },
  w5: {
    bubble: 'Six cards means six bills - and every late one GROWS by itself.',
    merge: 'One plan. One payment. Lower rate.',
    card: 'The nonprofit helper combined six scary bills into one fair one.',
    button: 'One payment beats six fees!',
    summary: 'Debt can grow - but help exists, and asking is the smart, brave move.',
    learn: 'debthelp',
  },
  w6: {
    bubble: 'You WON a prize! Just send $5 first!',
    card: 'A stranger wants $5 to "deliver your prize."',
    refuse: 'Shoo them away!',
    send: 'Send the $5',
    shield: 'A real bank NEVER asks you to send money.',
    coach: 'So close! Bea caught it - never send money to strangers.',
    summary: 'Never send money to someone you do not know.',
    learn: 'scams',
  },
}

export const DEBT_HELP = 'Nonprofit helpers can COMBINE all the debts into one and talk the bank into a smaller payment. Asking for help is smart.'

export const TRUST_NAMED = 'This is your TRUST - grown-ups call it a credit score. Paying on time and staying safe builds it, and big trust unlocks big things later.'

export const BK_HANDOFF = (garden) =>
  `Your bank money is safe and growing. Now - that $${garden} you set aside for the Money Garden? Time to grow it. Follow the path!`

export const BK_OPEN = (bank) =>
  `You decided to keep $${bank} in the bank. Let's go open your account so it's safe and earns a little.`
