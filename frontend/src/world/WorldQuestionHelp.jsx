import { useMemo, useState } from 'react'
import { LEARN } from '../scenarios/learnLinks.js'
import { readPhysicalModuleLaunch } from './physicalModuleLaunch.js'
import { usesTouchControls } from './controlMode.js'

const GENERAL_RESOURCES = [LEARN.jars, LEARN.budgeting, LEARN.investIntro].filter(Boolean)
const BOND_RESOURCES = [
  LEARN.investIntro,
  LEARN.risk,
  LEARN.allocation,
].filter(Boolean)
const TAX_RESOURCES = [
  LEARN.studentTaxes,
  LEARN.withholding,
  LEARN.paystub,
].filter(Boolean)

export function WorldQuestionHelp() {
  const [open, setOpen] = useState(false)
  const touch = usesTouchControls()
  const physicalModule = readPhysicalModuleLaunch()
  const resources = useMemo(() => {
    if (physicalModule === 6) return BOND_RESOURCES
    if (physicalModule === 7) return TAX_RESOURCES
    return GENERAL_RESOURCES
  }, [physicalModule])

  const destination = physicalModule === 6
    ? 'Bond Street — Under Construction'
    : physicalModule === 7
      ? 'TAYU Tax Office — Under Construction'
      : 'TAYU World'

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[1450] sm:right-5 sm:top-[4.5rem]">
      <button
        type="button"
        aria-label="Open instructions and learning resources"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full border-2 border-white bg-navy text-xl font-black text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-electric/30"
      >
        ?
      </button>

      {open && (
        <section className="pointer-events-auto absolute right-0 mt-2 max-h-[72vh] w-[min(92vw,24rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/98 p-5 text-navy shadow-2xl backdrop-blur-md" aria-label="TAYU help">
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
              Walk through the 3D town to the highlighted building. Get close to a glowing person or object, then {touch ? 'tap the interaction button' : 'press E or click it'} to continue. You can keep moving between interactions.
            </p>
            {physicalModule === 6 && <p className="mt-2 text-sm font-bold text-[#557d38]">Start inside Bond Street beside Beau, then visit the three borrower booths.</p>}
            {physicalModule === 7 && <p className="mt-2 text-sm font-bold text-[#d66d28]">The Tax Office comes after Bond Street. Enter the separate orange building and work through the tax stations in order.</p>}
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
