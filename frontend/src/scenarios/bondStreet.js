const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100
const wholeDollars = (value) => Math.max(0, Math.floor(Number(value || 0)))

export const BOND_STREET_SCRIPT = {
  arrival: 'BOND STREET is open! Meet Beau and turn part of your Money Garden harvest into loans that earn interest.',
  beauIntro: 'Welcome to Bond Street! In the garden you bought pieces of companies. Here you do something different: you LEND money to a borrower. The borrower promises interest and repayment.',
  allocation: 'Split your starting stake among Treasury, Muni, and Corporate bonds. Safer borrowers usually pay less interest. Riskier borrowers may pay more.',
  rateLesson: 'Bond prices can move when interest rates change. When new rates rise, an older lower-rate bond can become less attractive and its market price can fall. If the borrower keeps paying and you hold to the end, temporary price changes matter less.',
  seniorityLesson: 'If a company fails, bondholders generally stand ahead of stockholders for repayment. That is one reason bonds usually wiggle less than stocks, although corporate bonds can still default.',
  handoff: 'Your bonds have paid their practice interest. Next stop: the Tax Office, where Rex will show how income, deductions, brackets, withholding, refunds, and muni-bond tax treatment fit together.',
}

export const BOND_TYPES = [
  {
    id: 'treasury',
    title: 'U.S. Treasury',
    borrower: 'Federal government',
    safety: 3,
    rate: 0.03,
    summary: 'You lend to the U.S. government. This is the safest borrower in TAYU, so it pays the least practice interest.',
    outcome: 'Treasury paid on time. Steady and predictable.',
  },
  {
    id: 'muni',
    title: 'Muni Bond',
    borrower: 'Town / school district / state',
    safety: 3,
    rate: 0.04,
    summary: 'You lend to a local government for projects such as roads and schools. Its interest can receive special tax treatment.',
    outcome: 'The town paid on time. Remember this investment when you reach the Tax Office.',
  },
  {
    id: 'corporate',
    title: 'Corporate Bond',
    borrower: 'Company',
    safety: 2,
    rate: 0.06,
    summary: 'You lend to a company. It pays more practice interest because the borrower can be riskier than a government.',
    outcome: 'The company paid this time, but corporate bonds still depend on the borrower staying healthy.',
  },
]

export const BEAU_AMBIENT_LINES = [
  'A stock makes you an owner. A bond makes you a lender.',
  'Safer borrowers usually do not need to promise as much interest.',
  'When market interest rates rise, older lower-rate bond prices can fall.',
]

function companyValue(companies = {}) {
  return Object.values(companies).reduce((total, company) => total + Math.max(0, Number(company?.owned || 0) * Number(company?.price || 0)), 0)
}

export function gardenHarvestValue(wallet = {}) {
  const mg = wallet?.mg || {}
  return roundMoney(
    Number(mg.cash || 0)
    + Number(mg.pocket || 0)
    + Number(mg.bank || 0)
    + companyValue(mg.companies),
  )
}

export function gardenProfitStake(wallet = {}) {
  const mg = wallet?.mg || {}
  const harvest = gardenHarvestValue(wallet)
  const start = Math.max(0, Number(mg.startTotal || 0))
  const gain = wholeDollars(Math.max(0, harvest - start))
  if (gain > 0) return gain

  // Do not mint a fresh starting balance. If this playthrough finished flat or
  // down, use whole dollars that already exist in the player's saved plan.
  const existing = wholeDollars(Math.max(0, Number(mg.cash || 0) + Number(mg.pocket || 0) + Number(mg.bank || 0)))
  if (existing > 0) return existing
  return wholeDollars(Math.max(0, Number(wallet?.lemCum || 0)))
}

export function allocationTotal(allocation = {}) {
  return roundMoney(BOND_TYPES.reduce((sum, bond) => sum + Math.max(0, Number(allocation[bond.id] || 0)), 0))
}

export function bondOutcome(allocation = {}) {
  const rows = BOND_TYPES.map((bond) => {
    const principal = roundMoney(Math.max(0, Number(allocation[bond.id] || 0)))
    const interest = roundMoney(principal * bond.rate)
    return { ...bond, principal, interest, ending: roundMoney(principal + interest) }
  })
  const principal = roundMoney(rows.reduce((sum, row) => sum + row.principal, 0))
  const interest = roundMoney(rows.reduce((sum, row) => sum + row.interest, 0))
  return {
    rows,
    principal,
    interest,
    ending: roundMoney(principal + interest),
    investedInMuni: Number(allocation.muni || 0) > 0,
  }
}
