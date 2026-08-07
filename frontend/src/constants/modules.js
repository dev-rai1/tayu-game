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
    desc: 'Choose a job, watch taxes come out of a paycheck, plan take-home pay, and handle a future expense inside the 3D world.',
    color: '#FF8A3D',
  },
  {
    n: 6,
    badge: 'garden',
    title: 'Money Garden — Modules 6A + 6B',
    grades: 'Grades 6–12',
    minutes: 'Two separate 6–8 min modules',
    desc: 'Module 6A — Investing Foundations: research businesses, diversify, and use evidence instead of price alone. Module 6B — Markets, Risk & Patience: handle surprises, warning signs, hype, patience, and rebalancing.',
    color: '#00b37f',
    parts: [
      {
        id: 'A',
        label: 'Module 6A',
        title: 'Investing Foundations',
        minutes: '6–8 min',
        desc: 'Research businesses, spread risk, and use evidence instead of price alone.',
        color: '#00b37f',
      },
      {
        id: 'B',
        label: 'Module 6B',
        title: 'Markets, Risk & Patience',
        minutes: '6–8 min',
        desc: 'Protect ready cash, react to warning signs, resist hype, practice patience, and rebalance.',
        color: '#7850F0',
      },
    ],
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
    copy: 'All six core modules are available. The investing finale is clearly split into Module 6A (Investing Foundations) and Module 6B (Markets, Risk & Patience).',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Credit scores and debt', 'Insurance and risk', 'Careers, earnings, and benefits'],
  },
  {
    title: 'High School', grades: 'Grades 9–12', color: '#00a77a',
    copy: 'All six core modules establish a shared baseline. The investing finale is split into Module 6A and Module 6B, with deeper teacher prompts for withholding, banking, gig-work reserves, and investing.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Tax filing', 'College costs and financial aid', 'Retirement and long-term investing', 'Fintech, fraud, and digital money', 'Personal financial roadmap'],
  },
]
