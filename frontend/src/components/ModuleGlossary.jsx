import { useState } from 'react'
import { say } from '../services/speech.js'
import { LEARN, LEARNING_RESOURCES } from '../scenarios/learnLinks.js'

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
    title: 'Money Garden · Modules 5A + 5B',
    terms: [
      ['Stock', 'A small ownership interest in a company.'],
      ['Share', 'One unit of stock ownership.'],
      ['Return', 'The gain or loss in an investment’s value over time.'],
      ['Risk', 'The uncertainty that an investment may lose value or earn less than expected.'],
      ['Diversification', 'Spreading money across different investments so one result matters less. It reduces some risk but cannot remove all risk.'],
      ['Concentration risk', 'The extra risk created when too much of a portfolio depends on one investment.'],
      ['Research', 'Looking at credible information about an investment and the business behind it before making a decision.'],
      ['Time horizon', 'How long until you expect to need the money for your goal.'],
      ['Rebalancing', 'Adjusting holdings after prices change so a portfolio moves back toward its intended mix and risk level.'],
      ['Hype', 'Excitement or attention that can push people to act without enough evidence.'],
    ],
  },
  6: {
    title: 'Bond Street',
    terms: [
      ['Bond', 'A loan an investor makes to a company or government.'],
      ['Issuer', 'The company or government that borrows the money by selling the bond.'],
      ['Principal', 'The amount borrowed that is generally repaid when the bond matures.'],
      ['Interest', 'Money the issuer pays the bondholder for lending money.'],
      ['Maturity', 'The date when the bond reaches the end of its term and principal is due.'],
      ['Credit risk', 'The risk that the issuer may not make promised payments.'],
      ['Treasury', 'A debt security issued by the U.S. Treasury on behalf of the federal government.'],
      ['Municipal bond', 'A bond issued by a state, city, county, or other government entity.'],
      ['Corporate bond', 'A bond issued by a company.'],
    ],
  },
  7: {
    title: 'TAYU Tax Office',
    terms: [
      ['Tax return', 'A form used to report tax information and figure out whether tax is still due or money should be refunded.'],
      ['W-2', 'A yearly form from an employer that reports wages and certain taxes withheld.'],
      ['Wages', 'Money earned from working. The practice W-2 uses wages as the starting income number.'],
      ['Withholding', 'Tax money an employer sends to the government during the year for the worker.'],
      ['Deduction', 'An amount that can reduce the income used to calculate tax. The game uses one simplified practice deduction.'],
      ['Taxable income', 'The income left after allowed deductions in the practice return. Tax rates are applied to this amount.'],
      ['Tax bracket', 'A range of taxable income that uses a particular tax rate. Different parts of income can use different rates.'],
      ['Tax credit', 'An amount that reduces calculated tax directly.'],
      ['Refund', 'Money returned when the practice amount withheld is more than final tax.'],
      ['Amount due', 'Money still owed when final tax is more than the practice amount withheld.'],
    ],
  },
}

const PLAY_STEPS = [
  ['Pick a module', 'Choose your recommended next module, replay a finished one, or explore another available module.'],
  ['Move around the world', 'Desktop: use WASD to walk. Touch devices: use the on-screen MOVE pad. Follow the path toward the highlighted building or activity.'],
  ['Talk and interact', 'Desktop: press E when an interaction prompt appears. Touch devices: use the DO button. This starts conversations and activities in the 3D world.'],
  ['Do the activity — not just buttons', 'Different challenges use different controls. You may type a number, drag an answer card into the basket, move sliders to build a portfolio, sort items into categories, or make another hands-on choice.'],
  ['Watch what your decision does', 'After a decision, look at the 3D world. Modules 6 and 7 animate the result around Bond Street or the Tax Office scene before you continue.'],
  ['Module 6 · Bond Street', 'Walk to Bond Street and talk to Ben. Work through bond decisions using drag-and-drop, typed calculations, and the portfolio sliders. Drag cards all the way into the answer basket and release them there.'],
  ['Module 7 · TAYU Tax Office', 'Walk up the Tax Office path and talk to Rex. Complete the practice return using typed math, drag-and-drop decisions, and the taxable-versus-excluded sorting activity.'],
  ['Need to leave?', 'The Module Menu button inside the 3D world brings you back to the module menu without making you log in again.'],
]

function speakModule(module) {
  const text = module.terms.map(([word, meaning]) => `${word}. ${meaning}`).join(' ')
  say(`${module.title}. ${text}`)
}

function MenuHelpTabs({ onSelect }) {
  return (
    <nav aria-label="Module menu help" className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[700] flex -translate-x-1/2 gap-2 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl backdrop-blur-md">
      <button type="button" onClick={() => onSelect('instructions')} className="min-h-[44px] whitespace-nowrap rounded-xl bg-navy px-4 text-sm font-extrabold text-white">How to Play</button>
      <button type="button" onClick={() => onSelect('resources')} className="min-h-[44px] whitespace-nowrap rounded-xl border border-navy/10 bg-[#eef8ff] px-4 text-sm font-extrabold text-navy">Learning Resources</button>
    </nav>
  )
}

export function ModuleGlossary({ open, onClose, modules = [1, 2, 3, 4, 5, 6, 7] }) {
  const [menuTab, setMenuTab] = useState(null)
  const activeTab = open ? 'glossary' : menuTab
  const visibleModules = modules.map((number) => [number, WORDS[number]]).filter(([, module]) => module)
  const visibleResources = LEARNING_RESOURCES.filter((group) => !modules?.length || modules.includes(group.number))

  const close = () => {
    setMenuTab(null)
    if (open) onClose?.()
  }

  if (!activeTab) return <MenuHelpTabs onSelect={setMenuTab} />

  return (
    <div className="fixed inset-0 z-[800] overflow-y-auto bg-navy/80 p-4 backdrop-blur-sm sm:p-6">
      <section role="dialog" aria-modal="true" aria-labelledby="module-help-title" className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-5 text-navy shadow-2xl sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Module menu help</div>
            <h2 id="module-help-title" className="mt-1 font-display text-3xl font-extrabold">
              {activeTab === 'instructions' ? 'How to play TAYU' : activeTab === 'resources' ? 'Learning resources' : 'Money words in kid language'}
            </h2>
            <p className="mt-2 max-w-2xl font-semibold text-navy/70">
              {activeTab === 'resources' ? 'These are the same trusted resources referenced throughout the game.' : activeTab === 'instructions' ? 'Use this anytime you need a quick reminder of the controls or game flow.' : 'Open only the module you need. These definitions stay outside active gameplay so they do not cover buttons or characters.'}
            </p>
          </div>
          <button type="button" onClick={close} className="min-h-[44px] shrink-0 rounded-xl bg-navy px-4 font-extrabold text-white">Close</button>
        </div>

        {!open && (
          <div className="mt-5 flex flex-wrap gap-2 border-b border-navy/10 pb-4">
            <button type="button" onClick={() => setMenuTab('instructions')} className={`rounded-xl px-4 py-2 text-sm font-extrabold ${activeTab === 'instructions' ? 'bg-navy text-white' : 'bg-[#eef8ff] text-navy'}`}>How to Play</button>
            <button type="button" onClick={() => setMenuTab('resources')} className={`rounded-xl px-4 py-2 text-sm font-extrabold ${activeTab === 'resources' ? 'bg-navy text-white' : 'bg-[#eef8ff] text-navy'}`}>Learning Resources</button>
          </div>
        )}

        {activeTab === 'instructions' && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PLAY_STEPS.map(([title, copy], index) => (
              <div key={title} className="rounded-2xl border-2 border-navy/10 bg-[#eef8ff] p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.14em] text-electric">Step {index + 1}</div>
                <h3 className="mt-1 font-display text-xl font-extrabold text-navy">{title}</h3>
                <p className="mt-2 font-semibold leading-relaxed text-navy/75">{copy}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="mt-6 space-y-3">
            {visibleResources.map((group, index) => (
              <details key={group.number} open={index === 0} className="rounded-2xl border-2 border-navy/10 bg-[#eef8ff] p-4">
                <summary className="cursor-pointer font-display text-xl font-extrabold text-electric">Module {group.number}: {group.module}</summary>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {group.items.map((key) => {
                    const resource = LEARN[key]
                    if (!resource) return null
                    return (
                      <a key={key} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl bg-white p-3 font-extrabold text-navy shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        {resource.label} <span aria-hidden="true">↗</span>
                      </a>
                    )
                  })}
                </div>
              </details>
            ))}
          </div>
        )}

        {activeTab === 'glossary' && (
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
        )}
      </section>
    </div>
  )
}
