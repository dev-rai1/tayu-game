// Modules 6 (Bond Street) and 7 (TAYU Tax Office).
// The late-game modules are intentionally decision-first: players calculate,
// compare, diagnose, and react to events instead of reading a long lecture.

export const BOND_INTRO = [
  'Welcome to Bond Street! I am Ben. In the Money Garden you owned pieces of companies. Here, you become the lender.',
  'A bond is a contract: you lend principal, the borrower promises coupon payments, and at maturity the principal comes back.',
  'Meet three borrowers, do the money math, survive a rate shock, and build a diversified lending plan.',
]

export const BOND_STEPS = [
  {
    speaker: 'Ben · Bond Guide',
    text: 'LEND OR OWN? You give a company $100 through a bond. Which statement describes your role?',
    choices: [
      { label: 'I am lending $100', correct: true, feedback: 'Yes. A bond makes you a lender. A stock makes you an owner.' },
      { label: 'I now own part of the company', correct: false, feedback: 'That describes stock ownership. A bond is a loan contract.' },
      { label: 'The $100 is a donation', correct: false, feedback: 'A bond is not a donation. The borrower promises payments and repayment.' },
    ],
  },
  {
    speaker: 'Treasury Teller',
    text: 'BORROWER CHECK: Treasury is the U.S. government, Municipal is a town, and Corporate is a company. Which is generally the lowest-credit-risk borrower of these three?',
    choices: [
      { label: 'Treasury', correct: true, feedback: 'Correct. Treasury debt is generally treated as the lowest-credit-risk choice here, so it usually offers less yield.' },
      { label: 'Municipal', correct: false, feedback: 'Municipal bonds can be strong, but Treasury debt is generally the lower-credit-risk choice here.' },
      { label: 'Corporate', correct: false, feedback: 'Companies can fail, so corporate bonds generally carry more credit risk.' },
    ],
  },
  {
    speaker: 'Treasury Teller',
    text: 'COUPON MATH: You lend $200 at 4.5% simple annual interest. Calculate the annual interest before choosing.',
    choices: [
      { label: '$9', correct: true, feedback: 'Correct: $200 × 0.045 = $9.' },
      { label: '$90', correct: false, feedback: '4.5% is 0.045, not 0.45. Multiply $200 × 0.045.' },
      { label: '$209', correct: false, feedback: '$209 is principal plus interest. The interest itself is $9.' },
    ],
  },
  {
    speaker: 'Municipal Teller',
    text: 'TAX-EQUIVALENT YIELD: A muni pays 3.8%. At a 22% tax rate, 3.8% ÷ (1 − 0.22) is closest to what taxable yield?',
    choices: [
      { label: '4.87%', correct: true, feedback: 'Correct. 3.8% ÷ 0.78 ≈ 4.87%. Taxes can change which yield is actually better.' },
      { label: '2.96%', correct: false, feedback: 'That multiplies instead of dividing. Tax-equivalent yield asks what taxable rate would leave the same after-tax return.' },
      { label: '25.8%', correct: false, feedback: 'Additive percentage math does not work here. Use 3.8 ÷ 0.78.' },
    ],
  },
  {
    speaker: 'Town Hall Clerk',
    text: 'PROJECT DECISION: The town issues a muni bond to repair a school and road. Why might the federal tax exemption make the lower-looking rate attractive?',
    choices: [
      { label: 'You may keep more of the interest after federal tax', correct: true, feedback: 'Exactly. A lower stated muni yield can compete with a higher taxable yield after taxes.' },
      { label: 'The town secretly doubles the coupon', correct: false, feedback: 'No hidden doubling. The advantage comes from tax treatment.' },
      { label: 'Municipal bonds can never lose value', correct: false, feedback: 'They still have risks. The tax treatment does not remove market or credit risk.' },
    ],
  },
  {
    speaker: 'Corporate Analyst',
    text: 'RISK VS RETURN: Treasury offers 4.5%. A company offers 6.2%. Why does the company generally need to offer more?',
    choices: [
      { label: 'To compensate lenders for more credit risk', correct: true, feedback: 'Correct. More risk generally requires more potential return.' },
      { label: 'Because companies are always safer', correct: false, feedback: 'The higher yield is compensation for more risk, not proof of greater safety.' },
      { label: 'Rates have nothing to do with risk', correct: false, feedback: 'Risk and required return are connected.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'RATE-SHOCK EVENT: Your old bond pays 3%. New similar bonds now pay 6%. If you must sell the old bond today, what usually happens to its price?',
    choices: [
      { label: 'It falls', correct: true, feedback: 'Correct. Buyers prefer the new 6% bonds, so the old 3% bond generally must sell for less.' },
      { label: 'It rises', correct: false, feedback: 'Think like a buyer: why pay extra for the lower coupon when new bonds pay more?' },
      { label: 'It cannot change', correct: false, feedback: 'Bond market prices can change even when the promised coupon stays fixed.' },
    ],
  },
  {
    speaker: 'Corporate Analyst',
    text: 'CREDIT-NEWS EVENT: Company HQ reports weak earnings and its coupon arrives late. What risk just became visible?',
    choices: [
      { label: 'Credit/default risk', correct: true, feedback: 'Yes. Corporate bond payments depend on the borrower staying financially healthy.' },
      { label: 'Inflation disappeared', correct: false, feedback: 'The warning came from the borrower’s finances, not disappearing inflation.' },
      { label: 'Treasury risk', correct: false, feedback: 'This event is about the company borrower.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'WHO GETS PAID FIRST? If a company collapses, who generally has the higher claim on company assets?',
    choices: [
      { label: 'Bondholders', correct: true, feedback: 'Correct. Lenders generally rank ahead of common stockholders in the capital structure.' },
      { label: 'Common stockholders', correct: false, feedback: 'Common owners are generally farther back in line.' },
    ],
  },
  {
    speaker: 'Coupon Courier',
    text: 'SIX-WEEK PAYOUT: Your $300 practice portfolio earns $4.50, $3.80, and $6.20 from three equal $100 slices. What total interest arrived?',
    choices: [
      { label: '$14.50', correct: true, feedback: 'Correct: $4.50 + $3.80 + $6.20 = $14.50.' },
      { label: '$10.00', correct: false, feedback: 'Add all three coupon amounts, including the corporate payment.' },
      { label: '$314.50', correct: false, feedback: '$314.50 includes principal. The question asks for interest only.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'DIVERSIFICATION CHALLENGE: Treasury paid on time, the muni kept its tax benefit, and Corporate had a scare. Which plan best reduces dependence on one borrower?',
    choices: [
      { label: '$150 Treasury + $90 Muni + $60 Corporate', correct: true, feedback: 'Good. The plan spreads risk while keeping most money in the steadier borrowers.' },
      { label: '$300 Corporate', correct: false, feedback: 'That concentrates the entire portfolio in the borrower that just showed more credit risk.' },
      { label: '$300 Treasury only', correct: false, feedback: 'Very conservative, but it gives up diversification and the other return/tax features in this challenge.' },
    ],
  },
  {
    speaker: 'Maturity Desk',
    text: 'MATURITY MATH: You lent $300 and earned $14.50 of interest. If all borrowers repay principal at maturity, how much comes back in total?',
    choices: [
      { label: '$314.50', correct: true, feedback: 'Correct. Principal $300 + interest $14.50 = $314.50 returned.' },
      { label: '$14.50', correct: false, feedback: 'That is interest only. At maturity, principal also comes back if the borrower repays.' },
      { label: '$285.50', correct: false, feedback: 'Interest is added to the repaid principal, not subtracted.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'STOCKS VS BONDS: Your garden moved more but offered more growth. Bond Street paid steadier coupons. What is the strongest conclusion?',
    choices: [
      { label: 'A portfolio can use both for different jobs', correct: true, feedback: 'Exactly. Stocks can provide growth potential; bonds can add income and stability. The mix is asset allocation.' },
      { label: 'Bonds always beat stocks', correct: false, feedback: 'No single asset always wins. Their jobs and risks differ.' },
      { label: 'Stocks and bonds are identical', correct: false, feedback: 'Stocks are ownership; bonds are lending.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'Bond Street complete. You calculated coupons and tax-equivalent yield, reacted to rate and credit shocks, diversified, and reached maturity. Rex is waiting at the Tax Office.',
    continue: 'Go to the Tax Office',
    done: true,
  },
]

export const TAX_INTRO = [
  'Welcome to the TAYU Tax Office. I am Rex. Taxes help pay for shared things like roads, schools, clinics, and public safety.',
  'You will build one simplified return from evidence: wages, business profit, bond interest, a stock gain, deductions, brackets, and withholding.',
  'Do the arithmetic, move taxable and excluded income into the right buckets, catch the planted error, and then I get to use the PAID stamp.',
]

export const TAX_STEPS = [
  {
    speaker: 'Rex · Tax Assessor',
    text: 'WHY TAXES? Which example is a shared service taxes can help fund?',
    choices: [
      { label: 'Roads, schools, and public services', correct: true, feedback: 'Right. Taxes pool money for shared public services.' },
      { label: 'Only one person’s private shopping cart', correct: false, feedback: 'Taxes generally fund public purposes, not one person’s private shopping.' },
      { label: 'Nothing in the community', correct: false, feedback: 'Public budgets help pay for many shared services.' },
    ],
  },
  {
    speaker: 'W-2 Desk',
    text: 'EVIDENCE FIRST: Your W-2 shows $1,200 wages and $120 federal income tax withheld. What can you conclude right now?',
    choices: [
      { label: '$120 was already prepaid toward tax', correct: true, feedback: 'Correct. Withholding is a prepayment, not the final tax calculation.' },
      { label: 'Your final tax must be exactly $120', correct: false, feedback: 'Not yet. Final tax depends on the full return.' },
      { label: '$120 is extra wages', correct: false, feedback: 'Withholding was sent toward taxes, not added to wages.' },
    ],
  },
  {
    speaker: 'Income Desk',
    text: 'GROSS-INCOME MATH: Wages are $1,200, lemonade profit is $300, and taxable corporate-bond interest is $20. Add the taxable income sources before deductions.',
    choices: [
      { label: '$1,520', correct: true, feedback: 'Correct: $1,200 + $300 + $20 = $1,520.' },
      { label: '$1,500', correct: false, feedback: 'Do not forget the $20 taxable corporate-bond interest.' },
      { label: '$920', correct: false, feedback: 'Gross income adds income sources; it does not subtract the business profit.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'BUSINESS CHECK: Why does lemonade profit belong on a tax return even though the stand did not give you a W-2?',
    choices: [
      { label: 'It is self-employment/business income', correct: true, feedback: 'Correct. You were your own boss. A real return handles business income differently, but it still must be reported.' },
      { label: 'Business profit can never be taxable', correct: false, feedback: 'Profit from a business can be taxable even without a W-2.' },
      { label: 'Only W-2 income ever counts', correct: false, feedback: 'Tax returns can include many kinds of income.' },
    ],
  },
  {
    speaker: 'Bond Income Desk',
    text: 'EXCLUSION SORT: You received $40 municipal-bond interest and $20 corporate-bond interest. Which amount belongs in the federally taxable-interest pile in this simplified return?',
    choices: [
      { label: '$20 corporate interest only', correct: true, feedback: 'Correct. Move the $40 muni interest to EXCLUDED; the $20 corporate interest stays taxable.' },
      { label: 'All $60', correct: false, feedback: 'That incorrectly taxes the federally tax-exempt muni interest in this example.' },
      { label: '$0', correct: false, feedback: 'The $20 corporate interest remains taxable.' },
    ],
  },
  {
    speaker: 'Deductions Desk',
    text: 'DEDUCTION MATH: Practice gross income is $1,520. Subtract a $500 practice deduction. What taxable income remains?',
    choices: [
      { label: '$1,020', correct: true, feedback: 'Correct: $1,520 − $500 = $1,020.' },
      { label: '$2,020', correct: false, feedback: 'Deductions reduce taxable income. Subtract, do not add.' },
      { label: '$500', correct: false, feedback: '$500 is the deduction, not the remainder.' },
    ],
  },
  {
    speaker: 'Bracket Machine',
    text: 'PROGRESSIVE-BRACKET MATH: First $500 is taxed at 10%; the next $520 is taxed at 20%. Calculate the total tax.',
    choices: [
      { label: '$154', correct: true, feedback: 'Correct: $500×10% = $50 and $520×20% = $104; total $154.' },
      { label: '$204', correct: false, feedback: 'That taxes all $1,020 at 20%. Higher rates apply only to dollars in that bracket.' },
      { label: '$102', correct: false, feedback: 'That applies 10% to everything and ignores the second bracket.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'MARGINAL-RATE CHECK: If one extra dollar enters a higher bracket, what happens to the dollars already in the lower bracket?',
    choices: [
      { label: 'They keep their lower rate', correct: true, feedback: 'Exactly. A higher marginal bracket does not retroactively raise the rate on every earlier dollar.' },
      { label: 'Every dollar gets the top rate', correct: false, feedback: 'That is the common misconception progressive brackets are designed to clarify.' },
      { label: 'All earlier tax disappears', correct: false, feedback: 'The earlier bracket calculation remains in place.' },
    ],
  },
  {
    speaker: 'Capital Gains Desk',
    text: 'CAPITAL-GAIN MATH: You bought stock for $80 and sold it for $110. Calculate the realized gain.',
    choices: [
      { label: '$30', correct: true, feedback: 'Correct: $110 sale price − $80 cost basis = $30 capital gain.' },
      { label: '$110', correct: false, feedback: '$110 is proceeds, not profit. Subtract cost basis.' },
      { label: '$80', correct: false, feedback: '$80 is cost basis.' },
    ],
  },
  {
    speaker: 'Capital Gains Desk',
    text: 'HOLDING-PERIOD DECISION: In this simplified lesson, a short-term stock gain is treated like ordinary income. What important idea should you remember about long-term gains?',
    choices: [
      { label: 'They can use a different, often lower federal rate schedule', correct: true, feedback: 'Correct. Holding period can change federal capital-gain tax treatment.' },
      { label: 'Holding period can never matter', correct: false, feedback: 'It can matter significantly for capital-gain tax treatment.' },
      { label: 'Long-term gains are always tax-free', correct: false, feedback: 'Not always. Different rates do not mean automatically tax-free.' },
    ],
  },
  {
    speaker: 'Withholding Counter',
    text: 'REFUND OR DUE: Your calculated tax is $154 and $120 was withheld. What is the result?',
    choices: [
      { label: '$34 amount due', correct: true, feedback: 'Correct: $154 owed − $120 prepaid = $34 still due.' },
      { label: '$34 refund', correct: false, feedback: 'A refund happens when withholding exceeds tax owed. Here tax owed is larger.' },
      { label: '$274 due', correct: false, feedback: 'Withholding is a prepayment, so subtract it from tax owed.' },
    ],
  },
  {
    speaker: 'Postal Pat',
    text: 'WITHHOLDING DECISION: Why might someone adjust withholding if they repeatedly receive a very large refund?',
    choices: [
      { label: 'To aim closer to the tax actually owed during the year', correct: true, feedback: 'Right. A refund is returned overpayment; better withholding can improve cash flow during the year.' },
      { label: 'Because refunds are extra government prizes', correct: false, feedback: 'A refund generally returns money that was overpaid.' },
      { label: 'To make taxable income larger', correct: false, feedback: 'Withholding changes prepayments, not taxable income itself.' },
    ],
  },
  {
    speaker: 'E-File Desk',
    text: 'ERROR HUNT: The return taxes the $40 muni interest, leaves out the $20 corporate interest, and reports a $40 stock gain instead of $30. Which fix is complete?',
    choices: [
      { label: 'Exclude muni, include corporate, change gain to $30', correct: true, feedback: 'Great catch. You fixed all three planted errors before filing.' },
      { label: 'Only change the gain to $30', correct: false, feedback: 'The interest treatment is still reversed.' },
      { label: 'Delete all bond interest', correct: false, feedback: 'The corporate interest is still taxable in this simplified return.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'FINAL CHECK: Gross income $1,520 − deduction $500 = taxable income $1,020. Bracket tax is $154; withholding is $120. What should the filed summary show?',
    choices: [
      { label: '$1,020 taxable income, $154 tax, $34 due', correct: true, feedback: 'Correct. The evidence, arithmetic, and payment comparison all reconcile.' },
      { label: '$1,520 taxable income, $120 tax, $0 due', correct: false, feedback: 'That skips the deduction and confuses withholding with final tax.' },
      { label: '$500 taxable income, $34 tax, $154 refund', correct: false, feedback: 'Those figures mix up the deduction, tax, and withholding.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'Return complete. You added income, separated self-employment and bond income, excluded muni interest, used a deduction, calculated progressive brackets, handled a capital gain, reconciled withholding, and caught filing errors. PAID stamp time — then the Finale.',
    continue: 'Go to the Finale',
    done: true,
  },
]

// The store owns the public Module 6/7 card flow. Install a tiny browser-only
// handoff bridge so finishing a late module moves the player to the next real
// destination instead of leaving the HUD in the generic "FOLLOW YOUR NEXT STEP"
// fallback state. Dynamic import avoids a static circular dependency.
if (typeof window !== 'undefined') {
  queueMicrotask(() => {
    import('../world/store.js').then(async ({ useGame, playerPos }) => {
      const current = useGame.getState()
      if (current.__lateModuleHandoffInstalled) return
      const originalBondAct = current.bondAct
      const originalTaxAct = current.taxAct
      useGame.setState({
        __lateModuleHandoffInstalled: true,
        bondAct: (act) => {
          originalBondAct(act)
          if (act !== 'bond.finish') return
          window.setTimeout(() => {
            const live = useGame.getState()
            live.startTax?.()
            useGame.setState({ pendingWeekComplete: false, weekComplete: false, toast: 'Bond Street complete — heading to the Tax Office!' })
          }, 450)
        },
        taxAct: (act) => {
          originalTaxAct(act)
          if (act !== 'tax.finish') return
          window.setTimeout(async () => {
            const { PARTY_HOUSE } = await import('../world/config.js')
            playerPos.x = PARTY_HOUSE[0]
            playerPos.y = 1
            playerPos.z = PARTY_HOUSE[1] + 5.2
            useGame.setState({ pendingWeekComplete: false, weekComplete: false, gameComplete: true, objective: 'party', toast: 'Tax Office complete — the Finale is ready!' })
          }, 450)
        },
      })
    }).catch(() => { /* normal non-browser/test import path */ })
  })
}
