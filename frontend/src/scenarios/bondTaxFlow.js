// Modules 6 (Bond Street) and 7 (TAYU Tax Office).
// These flows deliberately favor short decisions, comparisons, and real arithmetic
// over lecture cards. Wrong answers give targeted feedback and retry; correct
// answers move the player through the district.

export const BOND_INTRO = [
  'Welcome to Bond Street! I am Ben.',
  'Stocks make you an owner. Bonds make you a lender.',
  'Meet three borrowers, compare their offers, and build a bond plan.',
]

export const BOND_STEPS = [
  {
    speaker: 'Ben · Bond Guide',
    text: 'Three booths are open. Treasury is the U.S. government, Municipal is a town, and Corporate is a company. Which booth is usually the lowest-risk borrower?',
    choices: [
      { label: 'Treasury', correct: true, feedback: 'Yes. U.S. Treasury debt is generally treated as the lowest-credit-risk choice of these three.' },
      { label: 'Municipal', correct: false, feedback: 'A municipal bond can be strong, but the Treasury booth is generally the lower-credit-risk choice here.' },
      { label: 'Corporate', correct: false, feedback: 'Companies can fail, so corporate bonds usually need to offer more yield to compensate for more credit risk.' },
    ],
  },
  {
    speaker: 'Treasury Teller',
    text: 'Math stop: You lend $100 at 4% simple annual interest for one year. How much interest do you earn?',
    choices: [
      { label: '$4', correct: true, feedback: 'Correct: $100 × 0.04 = $4 of interest.' },
      { label: '$40', correct: false, feedback: 'That would be 40%. Convert 4% to 0.04 first, then multiply.' },
      { label: '$104', correct: false, feedback: '$104 is principal plus interest. The question asks for interest only.' },
    ],
  },
  {
    speaker: 'Municipal Teller',
    text: 'Two bonds both pay $5 of interest. The municipal bond interest is federally tax-exempt; the corporate interest is taxable. If everything else were equal, which leaves you with more after federal tax?',
    choices: [
      { label: 'Municipal bond', correct: true, feedback: 'Right. If the interest is federally tax-exempt, you keep more of that $5 after federal tax.' },
      { label: 'Corporate bond', correct: false, feedback: 'The corporate interest is taxable in this example, so some of the $5 may go to federal tax.' },
      { label: 'Always exactly equal', correct: false, feedback: 'Not when one interest payment is tax-exempt and the other is taxable.' },
    ],
  },
  {
    speaker: 'Corporate Teller',
    text: 'Decision stop: Treasury offers 4%. A riskier company offers 7%. Why would the company usually need to offer a higher rate?',
    choices: [
      { label: 'To compensate lenders for more risk', correct: true, feedback: 'Exactly. More default risk generally means investors demand a higher yield.' },
      { label: 'Because corporate bonds are always safer', correct: false, feedback: 'It is the opposite here: the company is riskier, so it must make the offer more attractive.' },
      { label: 'Because interest has nothing to do with risk', correct: false, feedback: 'Risk and required return are closely linked. More risk usually requires more potential return.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'Rate-shock challenge: Your old bond pays 3%. New similar bonds now pay 6%. If you try to sell the old 3% bond, what usually happens to its price?',
    choices: [
      { label: 'It falls', correct: true, feedback: 'Correct. Buyers prefer the new 6% bonds, so the older 3% bond generally must sell for less.' },
      { label: 'It rises', correct: false, feedback: 'Think like a buyer: why pay extra for 3% when new similar bonds pay 6%?' },
      { label: 'Rates cannot affect bond prices', correct: false, feedback: 'They do. Bond prices and market interest rates generally move in opposite directions.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'Failure scenario: A company collapses. Who generally has the higher claim on company assets?',
    choices: [
      { label: 'Bondholders', correct: true, feedback: 'Yes. Lenders generally rank ahead of common stockholders in the capital structure.' },
      { label: 'Common stockholders', correct: false, feedback: 'Common owners are usually farther back in line. Bondholders generally have the higher claim.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'Final portfolio choice: You want steadier income and lower risk, but you still want some extra yield. Which plan is most balanced?',
    choices: [
      { label: '$60 Treasury + $30 Municipal + $10 Corporate', correct: true, feedback: 'Strong fit. Most money is in the lower-risk booths, with a smaller slice taking extra corporate risk.' },
      { label: '$100 Corporate', correct: false, feedback: 'That concentrates all your money in the highest-risk booth, which does not match the goal.' },
      { label: '$100 in one friend’s IOU', correct: false, feedback: 'That is concentrated and hard to evaluate. Diversifying across stronger borrowers better fits the goal.' },
    ],
  },
  {
    speaker: 'Ben · Bond Guide',
    text: 'Bond Street complete. You compared credit risk, calculated interest, handled rate risk, and built a diversified lending plan.',
    continue: 'Finish Bond Street',
    done: true,
  },
]

export const TAX_INTRO = [
  'Welcome to the TAYU Tax Office. I am Rex.',
  'You will build one simplified return by making choices and checking the math.',
  'Start at the W-2 desk, then move through deductions, brackets, gains, and e-file.',
]

export const TAX_STEPS = [
  {
    speaker: 'W-2 Desk',
    text: 'Your W-2 shows $1,200 of wages and $120 of federal income tax withheld. What does “withheld” mean?',
    choices: [
      { label: '$120 was already sent toward your tax bill', correct: true, feedback: 'Correct. Withholding is tax sent in during the year on your behalf.' },
      { label: '$120 is extra wages you received', correct: false, feedback: 'No. Withholding is money sent toward taxes, not extra take-home pay.' },
      { label: 'You automatically owe exactly $120', correct: false, feedback: 'Withholding is a prepayment. Your final tax can be lower or higher after the return is calculated.' },
    ],
  },
  {
    speaker: 'Income Desk',
    text: 'Math stop: You earned $1,200 in wages and $300 of lemonade profit. Before any exclusions or deductions, what is your total income from these two sources?',
    choices: [
      { label: '$1,500', correct: true, feedback: 'Correct: $1,200 + $300 = $1,500.' },
      { label: '$900', correct: false, feedback: 'You subtracted. For total income, add the income sources.' },
      { label: '$1,200', correct: false, feedback: 'Do not forget the $300 lemonade profit.' },
    ],
  },
  {
    speaker: 'Bond Income Desk',
    text: 'You also received $40 of municipal-bond interest and $20 of taxable corporate-bond interest. Which amount is generally included in federal taxable interest here?',
    choices: [
      { label: '$20', correct: true, feedback: 'Right. The corporate interest is taxable here; the municipal interest is federally tax-exempt in this simplified example.' },
      { label: '$60', correct: false, feedback: 'That taxes the municipal interest too. In this example, the $40 muni interest is excluded federally.' },
      { label: '$0', correct: false, feedback: 'The $20 corporate-bond interest is still taxable.' },
    ],
  },
  {
    speaker: 'Deductions Desk',
    text: 'Practice return: Your income included for this simplified calculation is $1,520. You get a $500 practice deduction. What taxable income remains?',
    choices: [
      { label: '$1,020', correct: true, feedback: 'Correct: $1,520 − $500 = $1,020 taxable income.' },
      { label: '$2,020', correct: false, feedback: 'A deduction reduces taxable income. Subtract, do not add.' },
      { label: '$500', correct: false, feedback: '$500 is the deduction itself, not the amount left after the deduction.' },
    ],
  },
  {
    speaker: 'Bracket Desk',
    text: 'Bracket math: In this practice game, the first $500 is taxed at 10% and the next $520 at 20%. What is the tax?',
    choices: [
      { label: '$154', correct: true, feedback: 'Correct: $500×10% = $50 and $520×20% = $104. Total = $154.' },
      { label: '$204', correct: false, feedback: 'That taxes all $1,020 at 20%. A progressive bracket applies each rate only to the dollars in that bracket.' },
      { label: '$102', correct: false, feedback: 'That is 10% of all taxable income, but the upper $520 uses the 20% practice rate.' },
    ],
  },
  {
    speaker: 'Capital Gains Desk',
    text: 'You bought a stock for $80 and later sold it for $110. What is the capital gain?',
    choices: [
      { label: '$30', correct: true, feedback: 'Correct: sale price $110 − cost $80 = $30 gain.' },
      { label: '$110', correct: false, feedback: '$110 is the sale price, not the gain. Subtract what you paid.' },
      { label: '$80', correct: false, feedback: '$80 is your cost basis, not the profit.' },
    ],
  },
  {
    speaker: 'E-File Desk',
    text: 'The computer says: “Tax the $40 municipal interest and ignore the $20 corporate interest.” What should you do?',
    choices: [
      { label: 'Flag it and reverse those two treatments', correct: true, feedback: 'Great catch. In this simplified federal example, the muni interest is excluded and the corporate interest is taxable.' },
      { label: 'File it exactly as shown', correct: false, feedback: 'That would keep the planted error. Check which interest is tax-exempt and which is taxable.' },
      { label: 'Delete all interest from the return', correct: false, feedback: 'The taxable corporate interest still belongs in the return.' },
    ],
  },
  {
    speaker: 'Rex · Tax Assessor',
    text: 'Return complete. You read withholding, added income, excluded muni interest, used a deduction, calculated brackets, found a capital gain, and caught an e-file error.',
    continue: 'Finish Tax Office',
    done: true,
  },
]
