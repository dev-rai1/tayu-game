import { say } from '../services/speech.js'

const WORDS = {
  1: {
    title: 'Market and Three Jars',
    terms: [
      ['Need', 'Something important for health, safety, school, or daily life.'],
      ['Want', 'Something fun or helpful that you can live without.'],
      ['Spend', 'Use money to buy something now.'],
      ['Save', 'Keep money for later.'],
      ['Give', 'Use money to help another person, group, or cause.'],
      ['Checkout', 'The place where you pay for the items you chose.'],
    ],
  },
  2: {
    title: 'Lemonade Stand',
    terms: [
      ['Cost', 'The money you pay to make or buy something.'],
      ['Price', 'The amount a customer pays.'],
      ['Sale', 'One item bought by a customer.'],
      ['Revenue', 'All the money customers paid before costs are removed.'],
      ['Profit', 'The money left after you subtract costs from revenue.'],
      ['Supplies', 'The items you need to run the stand.'],
      ['Wage', 'Money paid for work.'],
    ],
  },
  3: {
    title: 'Budget Town',
    terms: [
      ['Budget', 'A plan for how to use your money.'],
      ['Income', 'Money you receive.'],
      ['Expense', 'Money you spend.'],
      ['Rent', 'Money paid to live in a home you do not own.'],
      ['Emergency', 'A serious surprise that may need money right away.'],
    ],
  },
  4: {
    title: 'Bank of TAYU',
    terms: [
      ['Checking account', 'A bank account used for everyday payments.'],
      ['Savings account', 'A bank account used to keep money for later.'],
      ['Debit card', 'A card that uses money already in your bank account.'],
      ['Credit card', 'A card that lets you borrow money and pay it back.'],
      ['Interest', 'Money paid for saving, or money charged for borrowing.'],
      ['Scam', 'A trick used to steal money or information.'],
    ],
  },
  5: {
    title: 'Money Garden',
    terms: [
      ['Invest', 'Put money into something that may grow in value over time.'],
      ['Risk', 'The chance that you could lose money or get less than expected.'],
      ['Diversify', 'Spread money across different choices instead of only one.'],
      ['Price dip', 'A short time when a price moves down.'],
      ['Long term', 'A longer period of time, often months or years.'],
    ],
  },
}

function speakModule(module) {
  const text = module.terms.map(([word, meaning]) => `${word}. ${meaning}`).join(' ')
  say(`${module.title}. ${text}`)
}

export function ModuleGlossary({ open, onClose, modules = [1, 2, 3, 4, 5] }) {
  if (!open) return null
  const visibleModules = modules.map((number) => [number, WORDS[number]]).filter(([, module]) => module)

  return (
    <div className="fixed inset-0 z-[800] overflow-y-auto bg-navy/80 p-4 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="money-words-title" className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-5 text-navy shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Help section</div>
            <h2 id="money-words-title" className="mt-1 font-display text-3xl font-extrabold">Money words in kid language</h2>
            <p className="mt-2 max-w-2xl font-semibold text-navy/70">Open only the module you need. These definitions stay outside the game so they do not cover buttons or characters.</p>
          </div>
          <button type="button" onClick={onClose} className="min-h-[44px] shrink-0 rounded-xl bg-navy px-4 font-extrabold text-white">Close</button>
        </div>

        <div className="mt-6 space-y-3">
          {visibleModules.map(([number, module], index) => (
            <details key={number} open={index === 0} className="rounded-2xl border-2 border-navy/10 bg-[#eef8ff] p-4">
              <summary className="cursor-pointer font-display text-xl font-extrabold text-electric">Module {number}: {module.title}</summary>
              <button type="button" onClick={() => speakModule(module)} className="mt-3 min-h-[44px] rounded-xl bg-teal px-4 text-sm font-extrabold text-navy">Read this section aloud</button>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {module.terms.map(([word, meaning]) => (
                  <div key={word} className="rounded-2xl bg-white p-4 shadow-sm">
                    <dt className="font-display text-lg font-extrabold text-navy">{word}</dt>
                    <dd className="mt-1 font-semibold leading-relaxed text-navy/75">{meaning}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
