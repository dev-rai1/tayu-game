// ROUND 8 PART 5: the Learning Library. Every concept gets a UNIQUE, real,
// free, verified resource (all URLs curl-checked 200 on 7/17). The '?' menu's
// Library tab groups them BY MODULE; teaching cards carry per-concept
// Learn More buttons that open these in a new tab.

export const LEARN = {
  jars: { label: 'Money as You Grow (CFPB)', url: 'https://www.consumerfinance.gov/consumer-tools/money-as-you-grow/' },
  earn: { label: 'Earning money (MyMoney.gov)', url: 'https://www.mymoney.gov/earn' },
  needswants: { label: 'Spending wisely (MyMoney.gov)', url: 'https://www.mymoney.gov/spend' },
  business: { label: 'Financial literacy course (Khan Academy)', url: 'https://www.khanacademy.org/college-careers-more/financial-literacy' },
  budgeting: { label: 'The five money principles (MyMoney.gov)', url: 'https://www.mymoney.gov/' },
  allocation: { label: 'Asset allocation (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/getting-started/asset-allocation' },
  compound: { label: 'Compound interest calculator (Investor.gov)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
  banks: { label: 'Money Smart for Young People (FDIC)', url: 'https://www.fdic.gov/consumer-resource-center/money-smart-young-people' },
  cd: { label: 'Certificates of deposit (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/certificates-deposit' },
  debitcredit: { label: 'Credit vs debit vs prepaid (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-prepaid-card-a-credit-card-and-a-debit-card-en-433/' },
  compounddebt: { label: 'Compound interest, explained (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest' },
  carddebt: { label: 'Paying down card debt (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-pay-down-my-credit-card-debt-en-2113/' },
  debthelp: { label: 'Nonprofit credit counseling (NFCC)', url: 'https://www.nfcc.org/' },
  scams: { label: 'How to avoid a scam (FTC)', url: 'https://consumer.ftc.gov/articles/how-avoid-scam' },
  stocks: { label: 'What stocks are (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks' },
  diversify: { label: 'Diversify your investments (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/diversify-your-investments' },
  research: { label: 'Researching investments (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/getting-started/researching-investments' },
  risk: { label: 'What is risk? (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/what-risk' },
  longterm: { label: 'Save and invest (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/save-and-invest' },
  finbasics: { label: 'Investing basics (FINRA)', url: 'https://www.finra.org/investors/investing/investing-basics' },
}

// The Library tab: resources organized BY MODULE (the advisor's roadmap).
export const LIBRARY = [
  { module: 'Phase 1: The Market', items: ['jars', 'needswants'] },
  { module: 'Phase 2: The Lemonade Stand', items: ['business', 'earn', 'budgeting'] },
  { module: 'Phase 3: Budget Town', items: ['allocation', 'compound'] },
  { module: 'Phase 4: The Bank', items: ['banks', 'cd', 'debitcredit', 'carddebt', 'debthelp', 'scams'] },
  { module: 'Phase 5: The Money Garden', items: ['stocks', 'diversify', 'research', 'risk', 'longterm', 'finbasics'] },
]
