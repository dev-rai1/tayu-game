export const MODULE_CATALOG = [
  { n: 1, badge: 'jars', title: 'The Market & Jars', grades: 'Grades K-2', desc: 'Allowance, spend/save/give jars, and needs versus wants at the shop.', color: '#1464F0' },
  { n: 2, badge: 'lemonade', title: 'The Lemonade Stand', grades: 'Grades 2-4', desc: 'Costs, fair pricing, wages, profit, and a simple tax on profit.', color: '#FFD700' },
  { n: 3, badge: 'budget', title: 'Budget Town', grades: 'Grades 3-5', desc: 'Living within your means, needs first, and planning a real day.', color: '#00DCA0' },
  { n: 4, badge: 'bank', title: 'The Bank of TAYU', grades: 'Grades 4-6', desc: 'Accounts, interest, debit versus credit, borrowing costs, and scam safety.', color: '#7850F0' },
  { n: 5, badge: 'garden', title: 'The Money Garden', grades: 'Grades 4-6', desc: 'Investing, diversification, research, risk, and patience through market changes.', color: '#00b37f' },
]

export const EDUCATOR_GRADE_BANDS = [
  {
    title: 'Elementary School', grades: 'Grades K-5', color: '#1464F0',
    copy: 'Modules 1-5 build everyday money habits through concrete, playful choices that grow with students.',
    currentModules: MODULE_CATALOG,
    plannedModules: [],
  },
  {
    title: 'Middle School', grades: 'Grades 6-8', color: '#7850F0',
    copy: 'Modules 4-5 provide a grade-6 bridge into banking, investing, risk, credit, and more independent decisions.',
    currentModules: MODULE_CATALOG.filter((module) => [4, 5].includes(module.n)),
    plannedModules: ['Credit scores and debt', 'Taxes and paychecks', 'Insurance and risk', 'Careers, earnings, and benefits'],
  },
  {
    title: 'High School', grades: 'Grades 9-12', color: '#00a77a',
    copy: 'The high-school pathway will prepare students for the financial decisions they will make during and after graduation.',
    currentModules: [],
    plannedModules: ['College costs and financial aid', 'Tax filing', 'Retirement and long-term investing', 'Fintech, fraud, and digital money', 'Personal financial roadmap'],
  },
]
