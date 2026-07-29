export const MODULE_CATALOG = [
  {
    n: 1,
    badge: 'jars',
    title: 'The Market & Jars',
    grades: 'Grades K–12 · foundation',
    minutes: '5–7 min',
    desc: 'Make allowance, needs-versus-wants, and spend/save/give choices.',
    color: '#1464F0',
  },
  {
    n: 2,
    badge: 'lemonade',
    title: 'The Lemonade Stand',
    grades: 'Grades K–12',
    minutes: '10–15 min',
    desc: 'Test batches, pricing, hours, wages, demand, profit, and tax through trial and error.',
    color: '#FFD700',
  },
  {
    n: 3,
    badge: 'budget',
    title: 'Budget Town',
    grades: 'Grades 3–12',
    minutes: '7–10 min',
    desc: 'Cover needs, compare wants, build a food basket, and prepare for a surprise.',
    color: '#00DCA0',
  },
  {
    n: 4,
    badge: 'bank',
    title: 'The Bank of TAYU',
    grades: 'Grades 6–12',
    minutes: '7–10 min',
    desc: 'Choose accounts, compare debit and credit, manage borrowing, and spot a scam.',
    color: '#7850F0',
  },
  {
    n: 5,
    badge: 'garden',
    title: 'The Money Garden',
    grades: 'Grades 6–12',
    minutes: 'Two 6–8 min parts',
    desc: 'Part 1 builds investing basics. Part 2 uses market clues, risk, patience, and rebalancing.',
    color: '#00b37f',
  },
]

export const EDUCATOR_GRADE_BANDS = [
  {
    title: 'Elementary School', grades: 'Grades K–5', color: '#1464F0',
    copy: 'Grades K–2 are recommended Modules 1–2. Grades 3–5 add Budget Town as Module 3.',
    currentModules: MODULE_CATALOG.filter((module) => [1, 2, 3].includes(module.n)),
    plannedModules: [],
  },
  {
    title: 'Middle School', grades: 'Grades 6–8', color: '#7850F0',
    copy: 'All five modules remain available as a building-block sequence, with the Money Garden divided into two shorter parts.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Credit scores and debt', 'Taxes and paychecks', 'Insurance and risk', 'Careers, earnings, and benefits'],
  },
  {
    title: 'High School', grades: 'Grades 9–12', color: '#00a77a',
    copy: 'All five modules establish a shared baseline, followed by advanced teacher discussion prompts in banking and investing.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['College costs and financial aid', 'Tax filing', 'Retirement and long-term investing', 'Fintech, fraud, and digital money', 'Personal financial roadmap'],
  },
]
