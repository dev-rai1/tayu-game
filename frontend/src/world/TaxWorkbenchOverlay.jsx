import { useCallback, useEffect, useRef, useState } from 'react'
import { TAX_CASES, TAX_INTRO_STEPS, TOTAL_TAX_STEPS, filingStepFor, taxResultSummary, taxReturnMath } from '../scenarios/paycheckPlanet.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import { deactivatePaycheckWorld } from './paycheckMode.js'
import { useGame } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import './taxWorkbench.css'

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`

function ProgressDots({ stepNumber }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Tax filing step ${stepNumber} of ${TOTAL_TAX_STEPS}`}>
      {Array.from({ length: TOTAL_TAX_STEPS }, (_, index) => (
        <span key={index} className={`h-2.5 rounded-full transition-all ${index + 1 === stepNumber ? 'w-8 bg-electric' : index + 1 < stepNumber ? 'w-3 bg-teal' : 'w-3 bg-navy/15'}`} />
      ))}
    </div>
  )
}

function W2Scanner({ taxCase, work, onAction }) {
  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
      <div className="tax-paper-float relative overflow-hidden rounded-3xl border-2 border-navy/10 bg-white p-5 shadow-lg">
        <div className="tax-scan-line absolute inset-x-0 h-1 bg-electric/60" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3 border-b-2 border-navy/10 pb-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-electric">Practice document</div>
            <div className="font-display text-2xl font-black">W-2 Wage Statement</div>
          </div>
          <div className="rounded-xl bg-navy px-3 py-2 text-xs font-black text-white">SAMPLE</div>
        </div>
        <p className="mt-3 text-sm font-semibold text-navy/65">Tap the two boxes you would copy onto a tax return. The scanner sends them into your return workspace.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onAction('wagesFound', 'w2_box_1')} className={`min-h-[108px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${work.wagesFound ? 'tax-pop border-teal bg-teal/10' : 'border-electric/25 bg-[#eef8ff] hover:border-electric'}`}>
            <span className="block text-[11px] font-black uppercase tracking-wide text-navy/45">Box 1</span>
            <span className="mt-1 block text-sm font-extrabold">Wages, tips, other compensation</span>
            <span className="mt-2 block font-display text-2xl font-black">{money(taxCase.wages)}</span>
            <span className="mt-1 block text-xs font-bold text-teal">{work.wagesFound ? '✓ Sent to return' : 'Tap to scan'}</span>
          </button>
          <button type="button" onClick={() => onAction('withheldFound', 'w2_box_2')} className={`min-h-[108px] rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${work.withheldFound ? 'tax-pop border-teal bg-teal/10' : 'border-electric/25 bg-[#eef8ff] hover:border-electric'}`}>
            <span className="block text-[11px] font-black uppercase tracking-wide text-navy/45">Box 2</span>
            <span className="mt-1 block text-sm font-extrabold">Federal income tax withheld</span>
            <span className="mt-2 block font-display text-2xl font-black">{money(taxCase.withheld)}</span>
            <span className="mt-1 block text-xs font-bold text-teal">{work.withheldFound ? '✓ Sent to return' : 'Tap to scan'}</span>
          </button>
        </div>
      </div>
      <div className="rounded-3xl bg-navy p-5 text-white shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-teal">Your return workspace</div>
        <div className="mt-4 space-y-3">
          <div className={`rounded-2xl border p-4 transition ${work.wagesFound ? 'border-teal/70 bg-teal/10' : 'border-white/15 bg-white/5'}`}>
            <div className="text-xs font-bold text-white/55">WAGES</div>
            <div className="mt-1 font-display text-2xl font-black">{work.wagesFound ? money(taxCase.wages) : '—'}</div>
          </div>
          <div className={`rounded-2xl border p-4 transition ${work.withheldFound ? 'border-teal/70 bg-teal/10' : 'border-white/15 bg-white/5'}`}>
            <div className="text-xs font-bold text-white/55">FEDERAL TAX WITHHELD</div>
            <div className="mt-1 font-display text-2xl font-black">{work.withheldFound ? money(taxCase.withheld) : '—'}</div>
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-relaxed text-white/70">You are pulling numbers from a document instead of answering a quiz question.</p>
      </div>
    </div>
  )
}

function DeductionWorkbench({ math, work, onAction }) {
  return (
    <div className="rounded-3xl border-2 border-navy/10 bg-[#fffaf0] p-5 shadow-lg">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="text-xs font-black text-navy/45">WAGES</div>
          <div className="font-display text-3xl font-black">{money(math.wages)}</div>
        </div>
        <div className="text-center font-display text-3xl font-black text-navy/35">−</div>
        <button type="button" onClick={() => onAction('deductionApplied', 'apply_deduction')} className={`tax-stamp-button min-h-[100px] rounded-2xl border-2 p-4 text-center transition active:scale-[0.97] ${work.deductionApplied ? 'border-teal bg-teal/10' : 'border-[#ff8a3d]/35 bg-white hover:border-[#ff8a3d]'}`}>
          <div className="text-xs font-black text-[#c95f14]">PRACTICE DEDUCTION</div>
          <div className="font-display text-3xl font-black">{money(math.deduction)}</div>
          <div className="mt-1 text-xs font-extrabold">{work.deductionApplied ? '✓ STAMPED' : 'PRESS TO APPLY'}</div>
        </button>
        <div className="text-center font-display text-3xl font-black text-navy/35">=</div>
        <div className={`rounded-2xl p-4 text-center shadow-sm transition ${work.deductionApplied ? 'tax-pop bg-teal text-navy' : 'bg-white text-navy/35'}`}>
          <div className="text-xs font-black">TAXABLE INCOME</div>
          <div className="font-display text-3xl font-black">{work.deductionApplied ? money(math.taxableIncome) : '?'}</div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-navy/65">The deduction lowers the income that enters the tax brackets.</p>
    </div>
  )
}

function BracketMachine({ math, work, onAction }) {
  const firstTax = Math.round(math.firstBracketIncome * 0.10)
  const secondTax = Math.round(math.secondBracketIncome * 0.12)
  const needsSecond = math.secondBracketIncome > 0
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <button type="button" onClick={() => onAction('firstBracketDone', 'run_10_percent_bracket')} className={`relative overflow-hidden rounded-3xl border-2 p-5 text-left transition active:scale-[0.98] ${work.firstBracketDone ? 'border-teal bg-teal/10' : 'border-electric/25 bg-white hover:border-electric'}`}>
        {work.firstBracketDone && <div className="tax-coin-flow absolute right-5 top-5 text-3xl" aria-hidden="true">● ● ●</div>}
        <div className="text-xs font-black uppercase tracking-[0.14em] text-electric">Bracket lane 1</div>
        <div className="mt-1 font-display text-3xl font-black">10%</div>
        <p className="mt-2 font-semibold text-navy/70">Send the first {money(math.firstBracketIncome)} of taxable income through this lane.</p>
        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">{money(math.firstBracketIncome)} × 10% = <strong className="text-sun">{work.firstBracketDone ? money(firstTax) : 'run lane'}</strong></div>
      </button>
      <button type="button" disabled={!needsSecond || !work.firstBracketDone} onClick={() => onAction('secondBracketDone', 'run_12_percent_bracket')} className={`relative overflow-hidden rounded-3xl border-2 p-5 text-left transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${work.secondBracketDone || !needsSecond ? 'border-teal bg-teal/10' : 'border-brandpurple/25 bg-white hover:border-brandpurple'}`}>
        {work.secondBracketDone && <div className="tax-coin-flow absolute right-5 top-5 text-3xl" aria-hidden="true">● ●</div>}
        <div className="text-xs font-black uppercase tracking-[0.14em] text-brandpurple">Bracket lane 2</div>
        <div className="mt-1 font-display text-3xl font-black">12%</div>
        <p className="mt-2 font-semibold text-navy/70">{needsSecond ? `Only the next ${money(math.secondBracketIncome)} goes through this lane.` : 'There is no income left for this bracket in this case.'}</p>
        <div className="mt-4 rounded-2xl bg-navy p-4 text-white">{money(math.secondBracketIncome)} × 12% = <strong className="text-sun">{!needsSecond ? '$0' : work.secondBracketDone ? money(secondTax) : 'locked'}</strong></div>
      </button>
      <div className={`md:col-span-2 rounded-3xl border-2 p-5 text-center transition ${work.firstBracketDone && (!needsSecond || work.secondBracketDone) ? 'tax-pop border-teal bg-teal/10' : 'border-navy/10 bg-white'}`}>
        <div className="text-xs font-black uppercase tracking-[0.14em] text-navy/45">Tax before credits</div>
        <div className="mt-1 font-display text-4xl font-black">{work.firstBracketDone && (!needsSecond || work.secondBracketDone) ? money(math.taxBeforeCredits) : 'Run the bracket lanes'}</div>
      </div>
    </div>
  )
}

function CreditStation({ math, work, onAction }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-navy/10 bg-white p-6 shadow-lg">
      <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-3xl bg-navy p-5 text-center text-white">
          <div className="text-xs font-black text-white/55">TAX BEFORE CREDIT</div>
          <div className="font-display text-4xl font-black">{money(math.taxBeforeCredits)}</div>
        </div>
        <button type="button" onClick={() => onAction('creditApplied', 'apply_tax_credit')} className={`tax-credit-token relative z-10 grid min-h-[120px] min-w-[120px] place-items-center rounded-full border-4 border-dashed font-black shadow-xl transition active:scale-90 ${work.creditApplied ? 'tax-credit-slide border-teal bg-teal text-navy' : 'border-[#ff8a3d] bg-sun text-navy'}`}>
          <span><span className="block text-xs">CREDIT</span><span className="font-display text-2xl">−{money(math.credit)}</span><span className="mt-1 block text-[10px]">{work.creditApplied ? 'APPLIED ✓' : 'TAP ME'}</span></span>
        </button>
        <div className={`rounded-3xl p-5 text-center transition ${work.creditApplied ? 'tax-pop bg-teal text-navy' : 'bg-navy/5 text-navy/35'}`}>
          <div className="text-xs font-black">FINAL TAX</div>
          <div className="font-display text-4xl font-black">{work.creditApplied ? money(math.finalTax) : '?'}</div>
        </div>
      </div>
      <p className="mt-5 text-center text-sm font-semibold text-navy/65">A tax credit comes off the tax itself after the bracket calculation.</p>
    </div>
  )
}

function ReconcileScale({ math, work, onAction }) {
  const result = math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'
  return (
    <div className="rounded-3xl border-2 border-navy/10 bg-[#eef8ff] p-6 shadow-lg">
      <div className={`tax-balance mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-end gap-4 ${work.compared ? (math.refund >= math.amountDue ? 'tax-balance-left' : 'tax-balance-right') : ''}`}>
        <div className="rounded-3xl bg-electric p-5 text-center text-white shadow-lg">
          <div className="text-xs font-black text-white/65">ALREADY WITHHELD</div>
          <div className="font-display text-4xl font-black">{money(math.withheld)}</div>
        </div>
        <div className="pb-4 font-display text-3xl font-black text-navy/35">VS</div>
        <div className="rounded-3xl bg-navy p-5 text-center text-white shadow-lg">
          <div className="text-xs font-black text-white/65">FINAL TAX</div>
          <div className="font-display text-4xl font-black">{money(math.finalTax)}</div>
        </div>
      </div>
      <button type="button" onClick={() => onAction('compared', 'compare_withholding_to_tax')} className="mx-auto mt-5 block min-h-[54px] w-full max-w-md rounded-2xl bg-electric px-6 font-extrabold text-white active:scale-[0.99]">{work.compared ? 'Compared ✓' : 'Compare the two totals'}</button>
      {work.compared && (
        <div className="tax-pop mx-auto mt-5 max-w-xl rounded-3xl bg-teal p-5 text-center text-navy shadow-lg">
          <div className="text-xs font-black uppercase tracking-[0.16em]">Practice return result</div>
          <div className="mt-1 font-display text-4xl font-black">{result}</div>
          <p className="mt-2 font-semibold">{math.refund > 0 ? 'More was withheld than the final tax, so the difference comes back.' : math.amountDue > 0 ? 'The final tax is larger than withholding, so the difference is still due.' : 'Withholding exactly matches final tax.'}</p>
        </div>
      )}
    </div>
  )
}

function FilingDesk({ math, work, onReview, onSign }) {
  const rows = [
    ['reviewW2', 'W-2 copied', `${money(math.wages)} wages · ${money(math.withheld)} withheld`],
    ['reviewMath', 'Tax math checked', `${money(math.taxableIncome)} taxable · ${money(math.finalTax)} final tax`],
    ['reviewResult', 'Refund / due checked', math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'],
  ]
  const ready = work.reviewW2 && work.reviewMath && work.reviewResult
  return (
    <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-3xl border-2 border-navy/10 bg-white p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-navy/10 pb-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.15em] text-electric">Practice tax return</div>
            <div className="font-display text-2xl font-black">Final review</div>
          </div>
          <div className="rounded-xl bg-sun px-3 py-2 text-xs font-black text-navy">NOT REAL TAX FILING</div>
        </div>
        <div className="mt-4 space-y-3">
          {rows.map(([key, label, detail]) => (
            <button key={key} type="button" onClick={() => onReview(key)} className={`w-full rounded-2xl border-2 p-4 text-left transition active:scale-[0.99] ${work[key] ? 'border-teal bg-teal/10' : 'border-navy/10 hover:border-electric'}`}>
              <div className="flex items-center justify-between gap-3">
                <div><div className="font-extrabold">{label}</div><div className="mt-1 text-sm font-semibold text-navy/60">{detail}</div></div>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-black ${work[key] ? 'bg-teal text-navy' : 'bg-navy/10 text-navy/35'}`}>{work[key] ? '✓' : '○'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-3xl bg-navy p-5 text-white shadow-lg">
        <div className="text-xs font-black uppercase tracking-[0.15em] text-teal">E-file station</div>
        <div className="tax-envelope mt-5 rounded-2xl border-2 border-dashed border-sun/70 bg-white/10 p-5 text-center">
          <div className="text-5xl" aria-hidden="true">✉</div>
          <div className="mt-2 font-display text-xl font-black">Practice return packet</div>
        </div>
        <button type="button" disabled={!ready || work.signed} onClick={onSign} className="mt-5 min-h-[56px] w-full rounded-2xl bg-teal px-5 text-lg font-black text-navy transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">{work.signed ? 'Sending practice return…' : ready ? 'Sign & file practice return' : 'Check all 3 items first'}</button>
        {work.signed && <div className="tax-envelope-fly mt-3 text-center text-sm font-extrabold text-teal">Packet sent to the practice filing desk →</div>}
      </div>
    </div>
  )
}

function TaxStepWorkspace({ taxCase, stepNumber, work, onAction, onReview, onSign, onNext }) {
  const math = taxReturnMath(taxCase)
  const meta = filingStepFor(taxCase, stepNumber)
  const [hintOpen, setHintOpen] = useState(false)

  useEffect(() => setHintOpen(false), [stepNumber])

  const ready = stepNumber === 1
    ? work.wagesFound && work.withheldFound
    : stepNumber === 2
      ? work.deductionApplied
      : stepNumber === 3
        ? work.firstBracketDone && (math.secondBracketIncome === 0 || work.secondBracketDone)
        : stepNumber === 4
          ? work.creditApplied
          : stepNumber === 5
            ? work.compared
            : false

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-electric">{meta.eyebrow}</div>
          <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{meta.title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-navy/65">Do the action on the workbench. There are no A/B/C quiz answers.</p>
        </div>
        <ProgressDots stepNumber={stepNumber} />
      </div>

      <div className="mt-5">
        {stepNumber === 1 && <W2Scanner taxCase={taxCase} work={work} onAction={onAction} />}
        {stepNumber === 2 && <DeductionWorkbench math={math} work={work} onAction={onAction} />}
        {stepNumber === 3 && <BracketMachine math={math} work={work} onAction={onAction} />}
        {stepNumber === 4 && <CreditStation math={math} work={work} onAction={onAction} />}
        {stepNumber === 5 && <ReconcileScale math={math} work={work} onAction={onAction} />}
        {stepNumber === 6 && <FilingDesk math={math} work={work} onReview={onReview} onSign={onSign} />}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setHintOpen((value) => !value)} className="min-h-[44px] rounded-xl border-2 border-electric/20 bg-electric/5 px-4 text-sm font-extrabold text-electric active:scale-[0.99]">{hintOpen ? 'Hide hint' : 'Need a hint?'}</button>
        {stepNumber < 6 && <button type="button" disabled={!ready} onClick={onNext} className="min-h-[50px] rounded-xl bg-electric px-6 font-extrabold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35">{ready ? 'Continue to next filing step' : 'Finish the workbench action first'}</button>}
      </div>

      {hintOpen && <div className="tax-pop mt-3 rounded-2xl border border-electric/20 bg-[#eef8ff] p-4 text-sm font-semibold leading-relaxed text-navy/75" role="note"><strong className="text-electric">Hint:</strong> {meta.hint}</div>}
    </>
  )
}

export function TaxWorkbenchOverlay() {
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)
  const work = useTaxLab((s) => s.work)
  const initialized = useRef(false)
  const math = taxReturnMath(taxCase)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const profile = loadProfile() || {}
    const saved = profile.taxLabProgress
    const savedCase = TAX_CASES.find((item) => item.id === saved?.caseId) || null
    if (saved && !saved.completed && savedCase) {
      useTaxLab.getState().restore({ phase: saved.phase, taxCase: savedCase, stepNumber: saved.stepNumber })
    } else {
      useTaxLab.getState().reset()
    }
    recordLearningEvent({ moduleName: 'tax', type: 'module_start', outcome: 'started', detail: 'interactive_tax_workbench' }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!initialized.current || phase === 'complete') return
    saveProfile({
      taxLabProgress: {
        phase,
        caseId: taxCase?.id || null,
        stepNumber,
        completed: false,
      },
    })
  }, [phase, stepNumber, taxCase?.id])

  const recordInteraction = useCallback((outcome) => {
    recordLearningEvent({ moduleName: 'tax', type: 'tax_workbench_action', outcome, detail: `step=${stepNumber};case=${taxCase?.id || 'none'}` }).catch(() => {})
  }, [stepNumber, taxCase?.id])

  const chooseCase = useCallback((selected) => {
    useTaxLab.getState().chooseCase(selected)
    recordLearningEvent({ moduleName: 'tax', type: 'w2_case_choice', outcome: selected.id, detail: `wages=${selected.wages};withheld=${selected.withheld}` }).catch(() => {})
  }, [])

  const onAction = useCallback((key, outcome) => {
    useTaxLab.getState().markAction(key)
    recordInteraction(outcome)
  }, [recordInteraction])

  const onReview = useCallback((key) => {
    useTaxLab.getState().toggleReview(key)
    recordInteraction(key)
  }, [recordInteraction])

  const onSign = useCallback(() => {
    useTaxLab.getState().sign()
    recordInteraction('sign_and_file')
  }, [recordInteraction])

  const finishReturn = useCallback(() => {
    if (!taxCase) return
    const profile = loadProfile() || {}
    const result = taxReturnMath(taxCase)
    saveProfile({
      badges: [...new Set([...(profile.badges || []), 'tax'])],
      taxLab: {
        caseId: taxCase.id,
        wages: result.wages,
        withheld: result.withheld,
        deduction: result.deduction,
        taxableIncome: result.taxableIncome,
        taxBeforeCredits: result.taxBeforeCredits,
        credit: result.credit,
        finalTax: result.finalTax,
        refund: result.refund,
        amountDue: result.amountDue,
        stepsCompleted: TOTAL_TAX_STEPS,
        completedAt: new Date().toISOString(),
      },
      taxLabProgress: {
        phase: 'complete',
        caseId: taxCase.id,
        stepNumber: TOTAL_TAX_STEPS,
        completed: true,
      },
    })
    useTaxLab.getState().complete()
    recordLearningEvent({ moduleName: 'tax', type: 'module_complete', outcome: 'completed', detail: `interactive_tax_filing;case=${taxCase.id};finalTax=${result.finalTax};refund=${result.refund};due=${result.amountDue}` }).catch(() => {})
  }, [taxCase])

  useEffect(() => {
    if (phase !== 'steps' || stepNumber !== TOTAL_TAX_STEPS || !work.signed) return undefined
    const timer = setTimeout(finishReturn, 1250)
    return () => clearTimeout(timer)
  }, [finishReturn, phase, stepNumber, work.signed])

  const finishModule = useCallback(() => {
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    deactivatePaycheckWorld()
  }, [])

  return (
    <div data-tax-workbench="true" className="fixed inset-0 z-[1000] overflow-y-auto bg-navy/30 p-3 backdrop-blur-[2px] sm:p-5">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center py-2 sm:py-5">
        <section role="dialog" aria-modal="true" aria-label={phase === 'complete' ? 'Module 5 complete' : 'Interactive tax filing workbench'} className="tax-workbench-enter w-full rounded-[2rem] border-2 border-white/40 bg-[#fffdf8] p-4 text-navy shadow-2xl sm:p-6">
          {phase === 'intro' && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Module 5 · Tax Filing Lab</div><h1 className="mt-1 font-display text-3xl font-black sm:text-4xl">Work through a tax return</h1></div>
                <div className="rounded-2xl bg-teal/15 px-4 py-2 text-sm font-black text-[#08785e]">Hands-on simulation</div>
              </div>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-navy/70 sm:text-lg">Instead of taking a quiz, you will scan a W-2, stamp in a deduction, run income through tax brackets, apply a credit, balance withholding against tax, and send a practice return.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {TAX_INTRO_STEPS.map((line, index) => <div key={line} className="rounded-2xl border border-navy/10 bg-white p-3 shadow-sm"><span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-full bg-electric font-black text-white">{index + 1}</span><span className="text-sm font-semibold leading-snug">{line}</span></div>)}
              </div>
              <div className="mt-4 rounded-2xl border border-sun/50 bg-sun/15 p-3 text-sm font-semibold">Practice values are intentionally simplified and are not current real-world tax rules.</div>
              <button type="button" onClick={() => useTaxLab.getState().openCasePicker()} className="mt-5 min-h-[56px] w-full rounded-2xl bg-electric px-5 text-lg font-black text-white active:scale-[0.99]">Enter the filing workbench</button>
            </>
          )}

          {phase === 'case' && (
            <>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-electric">Choose a practice folder</div>
              <h2 className="mt-1 font-display text-3xl font-black">Open one W-2 folder</h2>
              <p className="mt-2 font-semibold text-navy/65">This only changes the numbers in your simulation. It is not a quiz question.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {TAX_CASES.map((item) => (
                  <button key={item.id} type="button" onClick={() => chooseCase(item)} className="tax-folder min-h-[180px] rounded-3xl border-2 border-electric/20 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-electric hover:shadow-lg active:scale-[0.98]">
                    <div className="text-4xl" aria-hidden="true">📁</div><div className="mt-3 text-xs font-black uppercase tracking-wide text-electric">{item.label}</div><div className="mt-2 font-display text-2xl font-black">{money(item.wages)} wages</div><div className="text-sm font-bold text-navy/60">{money(item.withheld)} already withheld</div><div className="mt-3 text-xs font-semibold text-navy/50">{item.note}</div><div className="mt-3 text-sm font-black text-teal">Open folder →</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'steps' && taxCase && <TaxStepWorkspace taxCase={taxCase} stepNumber={stepNumber} work={work} onAction={onAction} onReview={onReview} onSign={onSign} onNext={() => useTaxLab.getState().nextStep()} />}

          {phase === 'complete' && taxCase && (
            <div className="text-center">
              <div className="tax-complete-pulse mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal text-4xl font-black text-navy">✓</div>
              <div className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-teal">Module 5 complete</div>
              <h2 className="mt-1 font-display text-4xl font-black">Practice return filed</h2>
              <p className="mt-2 font-extrabold text-electric">{taxResultSummary(taxCase)}</p>
              <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-2 rounded-3xl bg-[#eef8ff] p-4 text-left text-sm sm:grid-cols-3">
                <div><span className="block text-navy/45">Wages</span><strong>{money(math.wages)}</strong></div><div><span className="block text-navy/45">Taxable income</span><strong>{money(math.taxableIncome)}</strong></div><div><span className="block text-navy/45">Final tax</span><strong>{money(math.finalTax)}</strong></div><div><span className="block text-navy/45">Withheld</span><strong>{money(math.withheld)}</strong></div><div><span className="block text-navy/45">Refund</span><strong>{money(math.refund)}</strong></div><div><span className="block text-navy/45">Amount due</span><strong>{money(math.amountDue)}</strong></div>
              </div>
              <p className="mx-auto mt-4 max-w-2xl font-semibold leading-relaxed text-navy/65">You completed the workflow by doing the filing actions, not by choosing multiple-choice answers.</p>
              <button type="button" onClick={finishModule} className="mt-5 min-h-[56px] w-full max-w-md rounded-2xl bg-electric px-5 text-lg font-black text-white active:scale-[0.99]">Finish Module 5</button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
