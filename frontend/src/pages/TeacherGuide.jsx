import { Link } from 'react-router-dom'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from '../constants/modules.js'
import { GRADE_PATHS } from '../constants/learningPaths.js'

const GUIDE = {
  1: {
    goals: ['Separate needs from wants', 'Use spend, save, and give for different purposes', 'Explain a tradeoff'],
    decisions: ['Divide an allowance among three jars', 'Choose a healthy food and drink within a limit'],
    discuss: ['What did you give up when you put more money in one jar?', 'Which purchase was a need, and why?'],
    evidence: 'Listen for students naming the purpose of each jar and explaining what they could no longer afford.',
    stop: 'Stop after the Market checkout for a short introductory session.',
    extension: 'Defend the allocation as an opportunity-cost decision and explain how a different goal would change the percentages.',
  },
  2: {
    goals: ['Distinguish revenue, costs, profit, and tax', 'Connect price and supply to demand', 'Improve a plan through trial and error'],
    decisions: ['Choose a batch, price, hours, recipe, sign, and wage', 'Change choices after seeing results'],
    discuss: ['Which choice changed profit most?', 'Why can selling more still fail to create profit?'],
    evidence: 'Look for students comparing rounds and using sold-out, leftover, revenue, and cost information as evidence.',
    stop: 'One sales round can stand alone. A full lesson usually needs two or three rounds.',
    extension: 'Estimate break-even sales, distinguish fixed from variable costs, and describe how a changed assumption affects unit economics.',
  },
  3: {
    goals: ['Put needs before optional spending', 'Build a budget that fits an income', 'Keep emergency cash available'],
    decisions: ['Cover housing, food, transportation, and health', 'Choose whether to buy a want', 'Prepare for a surprise'],
    discuss: ['What made the plan survive the surprise?', 'When can a want responsibly fit into a budget?'],
    evidence: 'Watch whether students protect needs and explain why ready cash differs from money intended to grow.',
    stop: 'Pause after the daily budget summary or continue through the emergency test.',
    extension: 'Classify fixed, variable, and irregular expenses, then justify an emergency-fund target.',
  },
  4: {
    goals: ['Compare checking, savings, and CDs', 'Distinguish debit from credit', 'Explain borrowing costs and scam warning signs'],
    decisions: ['Choose where bank money should live', 'Pay a credit-card bill in full or partially', 'Respond to a suspicious prize request'],
    discuss: ['Why might someone choose savings instead of checking?', 'What made the prize message suspicious?'],
    evidence: 'Listen for students connecting access to interest and recognizing credit as borrowed money.',
    stop: 'Pause after account choices, debit versus credit, or the scam scenario.',
    extension: 'Compare APY, liquidity, interest charges, and credit utilization.',
  },
  5: {
    goals: ['Distinguish gross pay, taxes, and take-home pay', 'Calculate a simple percentage tax', 'Allocate take-home pay for now, later, giving, and a possible tax reserve'],
    decisions: ['Choose a job and calculate its tax withholding', 'Allocate every take-home dollar', 'Decide whether a later fund can cover an upcoming expense'],
    discuss: ['Why should a plan use take-home pay rather than gross pay?', 'When might a worker need an extra tax reserve?', 'How did saving for later change the final decision?'],
    evidence: 'Look for correct tax arithmetic, an allocation that does not exceed take-home pay, and a decision supported by comparing the later fund with the event cost.',
    stop: 'Pause after the paycheck calculation, after the cash-flow plan, or complete the future-expense test.',
    extension: 'Compare employee withholding with gig income, explain why real tax rates vary, and discuss why this simulation is educational rather than tax advice.',
  },
  6: {
    goals: ['Use evidence rather than hype', 'Spread risk across investments', 'Keep emergency cash and rebalance over time'],
    decisions: ['Research companies, diversify, and interpret market movement', 'Respond to surprises, warning signs, hype, and concentration risk'],
    discuss: ['Which clue described the business rather than only its price?', 'How did diversification change the outcome?'],
    evidence: 'Look for students explaining a choice with customers, company health, risk, time horizon, or portfolio balance.',
    stop: 'Use the built-in intermission after Part 1. Each part is designed as its own 6–8 minute session.',
    extension: 'Connect volatility, time horizon, concentration, and risk tolerance, then write an investment-policy rule.',
  },
}

function Pill({ children }) {
  return <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white/75">{children}</span>
}

export default function TeacherGuide() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal">TAYU educator guide</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">Teach through choices, consequences, and reflection</h1>
          <p className="mt-2 max-w-3xl font-semibold text-white/70">Students make a choice, observe what happens, explain the result, and revise. Ask guiding questions before giving an answer.</p>
        </div>
        <div className="flex flex-wrap gap-2"><Link to="/modules?teacherPreview=1" className="btn-primary">Preview modules</Link><Link to="/teacher" className="rounded-xl bg-white/10 px-4 py-3 font-extrabold">Back to classroom</Link></div>
      </header>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-teal/30 bg-white/5 p-5"><Pill>Before play</Pill><h2 className="mt-3 text-lg font-extrabold">Set one purpose</h2><p className="mt-2 text-sm font-semibold text-white/65">Name the goal, make imperfect choices safe, and ask students to notice what changes.</p></div>
        <div className="rounded-2xl border border-sun/30 bg-white/5 p-5"><Pill>During play</Pill><h2 className="mt-3 text-lg font-extrabold">Ask for evidence</h2><p className="mt-2 text-sm font-semibold text-white/65">Ask “What clue are you using?” and “What will you change next?” Avoid supplying the exact answer.</p></div>
        <div className="rounded-2xl border border-brandpurple/30 bg-white/5 p-5"><Pill>After play</Pill><h2 className="mt-3 text-lg font-extrabold">Debrief the tradeoff</h2><p className="mt-2 text-sm font-semibold text-white/65">Ask what the student gained, gave up, and would revise.</p></div>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-2xl font-extrabold">Recommended paths</h2>
        <p className="mt-1 text-sm font-semibold text-white/60">A classroom assignment overrides these general recommendations.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{GRADE_PATHS.map((path) => <div key={path.id} className="rounded-2xl bg-black/20 p-4"><div className="text-xs font-extrabold uppercase tracking-wide text-teal">{path.label}</div><div className="mt-1 text-lg font-extrabold">{path.title}</div><p className="mt-2 text-sm text-white/65">{path.copy}</p><div className="mt-3 text-sm font-extrabold text-sun">Modules {path.modules.join(', ')}</div></div>)}</div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Module-by-module guide</h2>
        <div className="mt-4 space-y-4">{MODULE_CATALOG.map((module) => {
          const guide = GUIDE[module.n]
          return <article key={module.n} className="rounded-3xl border-2 bg-white/5 p-5" style={{ borderColor: `${module.color}66` }}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: module.color }}>Module {module.n} · {module.grades}</div><h3 className="mt-1 font-display text-2xl font-extrabold">{module.title}</h3><p className="mt-1 text-sm font-semibold text-white/65">{module.desc}</p></div><Pill>{module.minutes}</Pill></div><div className="mt-5 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl bg-black/20 p-4"><h4 className="font-extrabold text-teal">Learning goals</h4><ul className="mt-2 space-y-1 text-sm font-semibold text-white/70">{guide.goals.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-black/20 p-4"><h4 className="font-extrabold text-sun">Decisions students make</h4><ul className="mt-2 space-y-1 text-sm font-semibold text-white/70">{guide.decisions.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-black/20 p-4"><h4 className="font-extrabold text-brandpurple">Discussion prompts</h4><ul className="mt-2 space-y-1 text-sm font-semibold text-white/70">{guide.discuss.map((item) => <li key={item}>• {item}</li>)}</ul></div><div className="rounded-2xl bg-black/20 p-4"><h4 className="font-extrabold text-electric">Evidence to watch</h4><p className="mt-2 text-sm font-semibold text-white/70">{guide.evidence}</p><p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs font-bold text-white/60"><b>Stopping point:</b> {guide.stop}</p></div></div><div className="mt-4 rounded-2xl border border-[#00a77a]/50 bg-[#00a77a]/10 p-4"><div className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#59e0b7]">Optional high school extension</div><p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">{guide.extension}</p></div></article>
        })}</div>
      </section>

      <section className="mt-8 rounded-3xl bg-teal p-6 text-navy"><h2 className="font-display text-2xl font-extrabold">Five-minute debrief</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/70 p-4"><b>1. Choice</b><p className="mt-1 text-sm font-semibold">What did you decide?</p></div><div className="rounded-2xl bg-white/70 p-4"><b>2. Evidence</b><p className="mt-1 text-sm font-semibold">What happened because of it?</p></div><div className="rounded-2xl bg-white/70 p-4"><b>3. Revision</b><p className="mt-1 text-sm font-semibold">What would you keep or change?</p></div></div></section>

      <section className="mt-8 grid gap-3 md:grid-cols-3">{EDUCATOR_GRADE_BANDS.map((band) => <div key={band.title} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="text-xs font-extrabold uppercase" style={{ color: band.color }}>{band.grades}</div><h2 className="mt-1 text-xl font-extrabold">{band.title}</h2><p className="mt-2 text-sm font-semibold text-white/65">{band.copy}</p></div>)}</section>
    </main>
  )
}
