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
    badge: 'garden',
    title: 'Money Garden — Modules 5A + 5B',
    grades: 'Grades 6–12',
    minutes: 'Two separate 6–8 min modules',
    desc: 'Module 5A — Investing Foundations: research businesses, diversify, and use evidence instead of price alone. Module 5B — Markets, Risk & Patience: handle surprises, warning signs, hype, patience, rebalancing, and the stock-versus-bond bridge.',
    color: '#00b37f',
    parts: [
      {
        id: 'A',
        label: 'Module 5A',
        title: 'Investing Foundations',
        minutes: '6–8 min',
        desc: 'Research businesses, spread risk, and use evidence instead of price alone.',
        color: '#00b37f',
      },
      {
        id: 'B',
        label: 'Module 5B',
        title: 'Markets, Risk & Patience',
        minutes: '6–8 min',
        desc: 'Protect ready cash, react to warning signs, resist hype, practice patience, understand bond risk, and rebalance.',
        color: '#7850F0',
      },
    ],
    worldModule: 5,
  },
  {
    n: 6,
    badge: 'tax',
    title: 'Bond Street → Tax Office',
    grades: 'Grades 6–12',
    minutes: '15–20 min',
    desc: 'Carry money forward from the Money Garden, allocate it across Treasury, municipal, and corporate bonds, then enter the Tax Office to work through gross income, deductions, brackets, withholding, and a refund or amount due.',
    color: '#FF8A3D',
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
    copy: 'All six core modules are available. The investing sequence is split into Module 5A and Module 5B, followed by Bond Street and the Tax Office in Module 6.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['Credit scores and debt', 'Insurance and risk', 'Careers, earnings, and benefits'],
  },
  {
    title: 'High School', grades: 'Grades 9–12', color: '#00a77a',
    copy: 'All six core modules establish a shared baseline. Module 5A and 5B deepen investing decisions, then Module 6 carries the same money into Bond Street before the Tax Office.',
    currentModules: MODULE_CATALOG,
    plannedModules: ['College costs and financial aid', 'Retirement and long-term investing', 'Fintech, fraud, and digital money', 'Personal financial roadmap'],
  },
]
