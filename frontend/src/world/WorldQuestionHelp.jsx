import { useMemo, useState } from 'react'
import { LEARN, LEARNING_RESOURCES } from '../scenarios/learnLinks.js'
import { readPhysicalModuleLaunch } from './physicalModuleLaunch.js'
import { usesTouchControls } from './controlMode.js'
import { useGame } from './store.js'

const GENERAL_RESOURCES = [LEARN.jars, LEARN.budgeting, LEARN.investIntro].filter(Boolean)

const MODULE_DESTINATIONS = {
  1: 'The Market & Jars',
  2: 'The Lemonade Stand',
  3: 'Budget Town',
  4: 'The Bank of TAYU',
  5: 'Money Garden',
  6: 'Bond Street',
  7: 'TAYU Tax Office',
}

const MODULE_INSTRUCTIONS = {
  6: 'You arrive in front of Bond Street. Talk to Ben, then make decisions at the Treasury, Municipal, and Corporate booths. Expect interest math, risk comparisons, and a final portfolio choice.',
  7: 'You arrive at the TAYU Tax Office. Talk to Rex, then work through the W-2, income, deductions, bracket, capital-gains, and e-file decisions. The module includes real arithmetic, not just reading.',
}

function resourcesFor(moduleNumber) {
  const group = LEARNING_RESOURCES.find((entry) => entry.number === moduleNumber)
  if (!group) return GENERAL_RESOURCES
  return group.items.map((key) => LEARN[key]).filter(Boolean)
}

export function WorldQuestionHelp() {
  const [open, setOpen] = useState(false)
  const week = useGame((state) => state.week)
  const touch = usesTouchControls
  const physicalModule = readPhysicalModuleLaunch()
  const moduleNumber = physicalModule || (week === 6 || week === 7 ? week : null)

  const resources = useMemo(() => resourcesFor(moduleNumber), [moduleNumber])
  const destination = MODULE_DESTINATIONS[moduleNumber] || 'TAYU World'

  return (
    <div className="tayu-qhelp-dock pointer-events-none absolute left-4 top-[5.75rem] z-[1450] sm:left-5 sm:top-[6rem]">
      <button
        type="button"
        aria-label="Open instructions and learning resources"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border-2 border-white text-xl font-black text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-electric/30"
        style={{ background: '#071426' }}
      >
        ?
      </button>

      {open && (
        <section
          className="pointer-events-auto absolute left-0 mt-2 max-h-[72vh] w-[min(92vw,24rem)] overflow-y-auto rounded-3xl border border-slate-200 p-5 text-navy shadow-2xl"
          style={{ background: '#ffffff' }}
          aria-label="TAYU help"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-electric">Help & learning</div>
              <h2 className="mt-1 font-display text-xl font-black">{destination}</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black">Close</button>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <h3 className="font-display text-base font-black">Instructions</h3>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-navy/75">
              Walk through the 3D town to the highlighted destination. Get close to a glowing person or object, then {touch ? 'tap the interaction button' : 'press E or click it'} to continue. Follow the choices and feedback instead of rushing through the cards.
            </p>
            {MODULE_INSTRUCTIONS[moduleNumber] && (
              <p className={`mt-2 text-sm font-bold ${moduleNumber === 6 ? 'text-[#557d38]' : 'text-[#d66d28]'}`}>
                {MODULE_INSTRUCTIONS[moduleNumber]}
              </p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-display text-base font-black">Controls</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-bold">
              <div className="rounded-xl border border-slate-200 p-3">Move<br/><span className="text-navy/60">{touch ? 'On-screen joystick' : 'W A S D / arrow keys'}</span></div>
              <div className="rounded-xl border border-slate-200 p-3">Interact<br/><span className="text-navy/60">{touch ? 'Blue action button' : 'E or click'}</span></div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-base font-black">Learning resources</h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-navy/60">These links match the concepts taught in this module.</p>
            <div className="mt-2 flex flex-col gap-2">
              {resources.map((resource) => (
                <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-electric transition hover:bg-slate-50">
                  {resource.label} ↗
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
