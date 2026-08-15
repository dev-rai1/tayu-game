// Learning resources. Every concept points to a real, free resource from a
// regulator, government agency, or established financial-education provider.
// Core URLs were re-verified in August 2026. The module-menu resources tab and
// in-game teaching cards share these same entries so help stays consistent.

export const LEARN = {
  jars: { label: 'Money as You Grow (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/' },
  earn: { label: 'Earning money (MyMoney.gov)', url: 'https://www.mymoney.gov/earn' },
  needswants: { label: 'Spending wisely (MyMoney.gov)', url: 'https://www.mymoney.gov/spend' },
  business: { label: 'Financial literacy course (Khan Academy)', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy' },
  budgeting: { label: 'The five money principles (MyMoney.gov)', url: 'https://www.mymoney.gov/' },
  allocation: { label: 'Asset allocation and diversification (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/getting-started/asset-allocation' },
  compound: { label: 'Compound interest calculator (Investor.gov)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
  banks: { label: 'Money Smart for Young People (FDIC)', url: 'https://www.fdic.gov/consumer-resource-center/money-smart-young-people' },
  cd: { label: 'Certificates of deposit (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/certificates-deposit' },
  debitcredit: { label: 'Credit vs debit vs prepaid (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-prepaid-card-a-credit-card-and-a-debit-card-en-433/' },
  compounddebt: { label: 'Compound interest, explained (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest' },
  carddebt: { label: 'Paying down card debt (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-pay-down-my-credit-card-debt-en-2113/' },
  debthelp: { label: 'Nonprofit credit counseling (NFCC)', url: 'https://www.nfcc.org/' },
  scams: { label: 'How to avoid a scam (FTC)', url: 'https://consumer.ftc.gov/articles/how-avoid-scam' },

  // Module 5: Money Garden
  stocks: { label: 'What stocks are (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks' },
  diversify: { label: 'Diversify your investments (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/diversify-your-investments' },
  diversifyYouth: { label: 'What is diversification? Student resource (Investor.gov)', url: 'https://www.investor.gov/additional-resources/information/youth/teachers-classroom-resources/what-diversification' },
  research: { label: 'Researching investments (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/getting-started/researching-investments' },
  risk: { label: 'What is risk? (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/what-risk' },
  timeHorizon: { label: 'Time horizon (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/time-horizon' },
  longterm: { label: 'Save and invest (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest' },
  rebalance: { label: 'Rebalancing, explained (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/rebalancing' },
  assetGuide: { label: 'Beginner guide to allocation, diversification, and rebalancing (Investor.gov)', url: 'https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset' },
  investIntro: { label: 'Introduction to investing (Investor.gov)', url: 'https://www.investor.gov/introduction-investing' },
  finbasics: { label: 'Investing basics (FINRA)', url: 'https://www.finra.org/investors/investing/investing-basics' },

  // Module 6: Bond Street
  bonds: { label: 'Bonds — FAQs (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds' },
  corporateBonds: { label: 'Corporate bonds (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products' },
  municipalBonds: { label: 'Municipal bonds (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products-0' },

  // Module 7: TAYU Tax Office
  paystub: { label: 'Calculating the numbers in your paycheck (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/teach/activities/calculating-numbers-your-paycheck/' },
  teenEarning: { label: 'Teenagers and earning: gross vs net pay (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/teen-young-adult/explore-earning/' },
  withholding: { label: 'Tax withholding (IRS)', url: 'https://www.irs.gov/individuals/employees/tax-withholding' },
  studentTaxes: { label: 'Tax information for students (IRS)', url: 'https://www.irs.gov/individuals/students' },
  taxTutorials: { label: 'Understanding Taxes student tutorials (IRS)', url: 'https://apps.irs.gov/app/understandingTaxes/student/tax_tutorials.jsp' },
}

// Resources organized by the seven PUBLIC modules shown on Module Select.
export const LEARNING_RESOURCES = [
  { number: 1, module: 'The Market & Jars', items: ['jars', 'needswants'] },
  { number: 2, module: 'The Lemonade Stand', items: ['business', 'earn', 'budgeting'] },
  { number: 3, module: 'Budget Town', items: ['budgeting', 'allocation', 'compound'] },
  { number: 4, module: 'The Bank of TAYU', items: ['banks', 'cd', 'debitcredit', 'compounddebt', 'carddebt', 'debthelp', 'scams'] },
  { number: 5, module: 'Money Garden', items: ['stocks', 'investIntro', 'risk', 'diversifyYouth', 'diversify', 'research', 'timeHorizon', 'longterm', 'allocation', 'rebalance', 'assetGuide', 'finbasics'] },
  { number: 6, module: 'Bond Street', items: ['bonds', 'corporateBonds', 'municipalBonds', 'risk', 'allocation'] },
  { number: 7, module: 'TAYU Tax Office', items: ['paystub', 'teenEarning', 'withholding', 'studentTaxes', 'taxTutorials'] },
]
