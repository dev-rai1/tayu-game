export const MODULE_CATALOG = [
  {
    n: 1,
    badge: 'jars',
    title: 'The Market & Jars',
    grades: 'Grades K–12 · foundation',
    minutes: '5–7 min',
    desc: 'Build your first money plan by choosing what to spend now, save for later, and give to others.',
    color: '#1464F0',
  },
  {
    n: 2,
    badge: 'lemonade',
    title: 'The Lemonade Stand',
    grades: 'Grades K–12',
    minutes: '10–15 min',
    desc: 'Run a business by testing batches, price, open hours, the cost of your own work, demand, profit, and tax.',
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
    badge: 'tax',
    title: 'Paycheck Planet',
    grades: 'Grades 6–12',
    minutes: '8–12 min',
    desc: 'Choose a job, calculate taxes withheld from a paycheck, plan take-home pay, and respond to a future expense.',
    color: '#FF8A3D',
    route: '/tax-paycheck',
  },
  {
    n: 6,
    badge: 'garden',
    title: 'Money Garden',
    grades: 'Grades 6–12',
    minutes: 'Two 6–8 min parts',
    desc: 'The investing finale: use pretend stocks, market clues, risk, patience, and rebalancing to grow a balanced portfolio.',
    color: '#00b37f',
    worldModule: 5,
    finale: true,
  },
]

export const MODULE_COUNT = MODULE_CATALOG.length
export const WORLD_CHAPTER_COUNT = 5

export const EDUCATOR_GRADE_BANDS = [
  {
    title: 'Elementary School', grades: 'Grades K–5', color: '#1464F0',
    copy: 'Grades K–2 are recommended Modules 1–2. Grades 3–5 add Budget Town as Module 3.',
    currentModules: MODULE_CATALOG.filter((module) => [1, 2, 3].includes(module.n)),
    plannedModules: [],
  },
  {
    title: 'Middle School', grades: 'Grades 6–8', color: '#7850F0',
    copy: 'All six learning modules are available. Money Garden is Module 6 and serves as the investing finale after Paycheck Planet.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Credit scores and debt', 'Insurance and risk', 'Careers, earnings, and benefits'],
  },
  {
    title: 'High School', grades: 'Grades 9–12', color: '#00a77a',
    copy: 'All six learning modules establish a shared baseline. Money Garden is Module 6 and the investing finale, with deeper teacher prompts for withholding, banking, gig-work reserves, and investing.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Tax filing', 'College costs and financial aid', 'Retirement and long-term investing', 'Fintech, fraud, and digital money', 'Personal financial roadmap'],
  },
]
