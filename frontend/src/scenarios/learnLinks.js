// Learning resources. Every concept points to a real, free resource from a
// regulator, government agency, or established financial-education provider.
// Core and newly added URLs were re-verified on 8/7/2026. The '?' menu groups
// resources by PUBLIC module number; teaching cards can link to a specific key.

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

  // Module 5: Paycheck Planet
  paystub: { label: 'Calculating the numbers in your paycheck (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/educator-tools/youth-financial-education/teach/activities/calculating-numbers-your-paycheck/' },
  teenEarning: { label: 'Teenagers and earning: gross vs net pay (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/teen-young-adult/explore-earning/' },
  withholding: { label: 'Tax withholding (IRS)', url: 'https://www.irs.gov/individuals/employees/tax-withholding' },
  studentTaxes: { label: 'Tax information for students (IRS)', url: 'https://www.irs.gov/individuals/students' },

  // Module 6: Money Garden
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
}

// Resources organized by the six PUBLIC modules shown on Module Select.
export const LEARNING_RESOURCES = [
  { module: 'Module 1: The Market & Jars', items: ['jars', 'needswants'] },
  { module: 'Module 2: The Lemonade Stand', items: ['business', 'earn', 'budgeting'] },
  { module: 'Module 3: Budget Town', items: ['budgeting', 'allocation', 'compound'] },
  { module: 'Module 4: The Bank of TAYU', items: ['banks', 'cd', 'debitcredit', 'compounddebt', 'carddebt', 'debthelp', 'scams'] },
  { module: 'Module 5: Paycheck Planet', items: ['paystub', 'teenEarning', 'withholding', 'studentTaxes', 'earn', 'budgeting'] },
  {
    module: 'Module 6: Money Garden',
    items: ['stocks', 'investIntro', 'risk', 'diversifyYouth', 'diversify', 'research', 'timeHorizon', 'longterm', 'allocation', 'rebalance', 'assetGuide', 'finbasics'],
  },
]
