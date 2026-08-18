// Modules 6 (Bond Street) and 7 (Tax Office), rebuilt as card-driven decision
// flows that run over the normal town scene - exactly like the other modules use
// openDialog + pushCards. No separate "paycheck world" scene, so there is no
// second WebGL context and no blue screen. Content follows the OrangeConsulting
// review: bonds taught as lending, and a simplified but accurate tax return.
//
// Each step is either a teaching card ({ text, continue }) or a decision
// ({ text, choices:[{ label, correct, feedback }] }). The store turns these into
// cards; a wrong choice shows feedback and re-asks, a right choice advances.

export const BOND_INTRO = [
  'Welcome to Bond Street! I am Beau, your bond guide.',
  'A stock made you an OWNER. A bond is different: a bond is a LOAN you make.',
  'You lend your money to a borrower. They pay you interest and return your money later.',
]

export const BOND_STEPS = [
  {
    speaker: 'Beau · Bond Guide',
    text: 'Three borrowers want your money. TREASURY is the government - the safest, but pays the lowest interest. MUNICIPAL (a town) pays interest that can be tax-free. CORPORATE (a company) pays the most interest, but has the most risk.',
    continue: 'Meet the borrowers',
  },
  {
    speaker: 'Beau · Bond Guide',
    text: 'You have $90 to lend. You want the SAFEST steady interest, even if it is not the biggest. Who do you lend to?',
    choices: [
      { label: 'Treasury (government)', correct: true, feedback: 'Right. A Treasury bond is backed by the government, so it is the safest loan you can make. Lower interest, but very steady.' },
      { label: 'Corporate (a new company)', correct: false, feedback: 'Corporate bonds pay more, but a company can struggle to pay you back. That is more risk than you asked for. Try again.' },
      { label: 'A friend with no job', correct: false, feedback: 'A borrower who may not repay is the riskiest of all. Bonds are only as safe as the borrower. Try again.' },
    ],
  },
  {
    speaker: 'Beau · Bond Guide',
    text: 'Here is a bond surprise: when NEW bonds start paying HIGHER interest, your older, lower-interest bond is worth LESS if you try to sell it early. Prices and interest rates move in opposite directions.',
    continue: 'Got it',
  },
  {
    speaker: 'Beau · Bond Guide',
    text: 'If a company FAILS, who gets paid back first - the people who lent it money, or the people who own shares?',
    choices: [
      { label: 'Bondholders (the lenders)', correct: true, feedback: 'Correct. Lenders have a higher claim than owners, so bondholders are paid before stockholders. That is one reason bonds usually move less than stocks.' },
      { label: 'Stockholders (the owners)', correct: false, feedback: 'Owners are paid LAST if a company fails. Lenders (bondholders) come first. Try again.' },
    ],
  },
  {
    speaker: 'Beau · Bond Guide',
    text: 'You want steadier money and to be first in line if things go wrong. Do you buy a STOCK (ownership) or a BOND (a loan)?',
    choices: [
      { label: 'Bond (lend the money)', correct: true, feedback: 'Good judgment. For steadier returns and a higher claim, a bond fits. Stocks can grow more, but move more too.' },
      { label: 'Stock (own a piece)', correct: false, feedback: 'Stocks can grow more but wiggle more and pay owners last. For "steadier and safer," a bond is the better fit here. Try again.' },
    ],
  },
  {
    speaker: 'Beau · Bond Guide',
    text: 'Nicely done. Your Treasury and municipal bonds are earning interest. Remember: your MUNICIPAL bond interest can be tax-free. You will see exactly why at the Tax Office in the next module. Bond Street complete!',
    continue: 'Finish Bond Street',
    done: true,
  },
]

export const TAX_INTRO = [
  'Welcome to the TAYU Tax Office. I am Rex, your tax assessor.',
  'Every year you add up what you earned, subtract what the rules let you, and pay tax on the rest.',
  'Let us walk through one simple return together, station by station.',
]

export const TAX_STEPS = [
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 1 - Your W-2. Box 1 shows your WAGES (what a job paid you). Box 2 shows the tax already WITHHELD - money sent ahead toward your bill. A side hustle like a lemonade stand is different: it is self-employment income and goes on Schedule C, because no boss withheld tax for you.',
    continue: 'Next station',
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 2 - Total income. We add up wages + lemonade profit + your stock capital gain + taxable bond interest. That is your income BEFORE the muni exclusion and the standard deduction. Now, a question about that bond interest...',
    continue: 'Continue',
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'Your MUNICIPAL bond interest - does the federal government tax it?',
    choices: [
      { label: 'No, muni interest is excluded', correct: true, feedback: 'Correct! Municipal bond interest is EXCLUDED from federal taxable income. That is the muni tax benefit you heard about on Bond Street. Your corporate/taxable interest still counts.' },
      { label: 'Yes, it is taxed like wages', correct: false, feedback: 'Not quite. Municipal bond interest is EXCLUDED from federal tax - that is the whole point of the muni benefit. Try again.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 3 - The deduction. The standard deduction lowers the amount that gets taxed. Taxable income = your income minus the deduction. You never pay tax on the full amount you earned.',
    continue: 'Next station',
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 4 - Brackets. Not all your money is taxed the same. The first dollars are taxed at a low rate, and only the dollars ABOVE that use a higher rate. That is what a tax bracket means.',
    continue: 'Got it',
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 5 - Capital gains. Your profit from SELLING a stock is a capital gain, and it has its OWN lower rate schedule. Short-term gains (held under a year) are taxed like ordinary income; long-term gains (held over a year) use a lower rate.',
    continue: 'Next station',
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'STATION 6 - E-File. The computer filled out your return, but it made a mistake: it TAXED your municipal bond interest. Catch the error - is that correct?',
    choices: [
      { label: 'No - muni interest is excluded', correct: true, feedback: 'Great catch! Muni interest should NOT be taxed federally. You fixed the return. This is why you always check before you file.' },
      { label: 'Yes, tax everything', correct: false, feedback: 'Look again - municipal interest is excluded from federal tax. Taxing it is the planted error. Try again.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'Return filed correctly! You matched income, excluded muni interest, applied the deduction, used the brackets, and handled the capital gain on its own schedule. That is a real tax return. Tax Office complete!',
    continue: 'Finish Tax Office',
    done: true,
  },
]
