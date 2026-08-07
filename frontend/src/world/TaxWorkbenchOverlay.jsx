import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FIRST_BRACKET_RATE,
  SECOND_BRACKET_RATE,
  TAX_CASES,
  TOTAL_TAX_STEPS,
  filingStepFor,
  taxResultSummary,
  taxReturnMath,
} from '../scenarios/paycheckPlanet.js'
import { loadProfile, saveProfile } from '../services/walletStore.js'
import { recordLearningEvent } from '../services/usageAnalytics.js'
import { deactivatePaycheckWorld } from './paycheckMode.js'
import { useGame } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CLIENTS, taxStationForStep } from './taxDistrictLayout.js'
import './taxWorkbench.css'

const money = (value) => `$${Math.max(0, Math.round(Number(value || 0))).toLocaleString('en-US')}`
const numberValue = (value) => Number(String(value ?? '').replace(/[$,\s]/g, ''))

function PanelShell({ eyebrow, title, subtitle, onClose, children }) {
  return (
    <section
      data-tax-station-panel="true"
      aria-label={title}
      className="tax-workbench-enter pointer-events-auto max-h-[72dvh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] border-2 border-white/70 bg-[#fffdf8] p-4 text-navy shadow-2xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && <div className="text-[11px] font-black uppercase tracking-[0.18em] text-electric">{eyebrow}</div>}
          <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm font-semibold leading-relaxed text-navy/65">{subtitle}</p>}
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/10 bg-white font-black text-navy/55 shadow-sm" aria-label="Close station panel">×</button>
        )}
      </div>
      {children}
    </section>
  )
}

function Feedback({ feedback }) {
  if (!feedback) return null
  const good = feedback.kind === 'success'
  return (
    <div className={`tax-pop mt-4 rounded-2xl border p-3 text-sm font-bold leading-relaxed ${good ? 'border-teal/40 bg-teal/10 text-[#08785e]' : 'tax-shake border-[#e46a3a]/35 bg-[#fff0e8] text-[#9b3d1d]'}`} role="status">
      {good ? '✓ ' : 'Try again: '}{feedback.text}
    </div>
  )
}

function GuidePanel({ phase, onStart, onClose, onFinish }) {
  if (phase === 'complete') {
    return (
      <PanelShell eyebrow="Maya · Tax Guide" title="You filed the practice return" subtitle="You stayed in the actual TAYU town, moved between stations, and made the filing decisions yourself." onClose={onClose}>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {['Read the document', 'Did the tax math', 'Caught the filing result'].map((label) => <div key={label} className="rounded-2xl bg-teal/10 p-3 text-center text-sm font-black">✓ {label}</div>)}
        </div>
        <button type="button" onClick={onFinish} className="mt-4 min-h-[52px] w-full rounded-2xl bg-electric px-5 font-black text-white">Finish Module 5</button>
      </PanelShell>
    )
  }

  return (
    <PanelShell eyebrow="Maya · Tax Guide" title="Welcome to the Tax Lab" subtitle="This time you do not leave the map. Walk around this district, talk to a taxpayer, and use each physical station in order." onClose={onClose}>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy/10 bg-white p-3"><div className="text-xs font-black text-electric">1 · CHOOSE A PERSON</div><p className="mt-1 text-sm font-semibold">Talk to Ari, Sam, or Jordan. Their W-2 numbers lead to different outcomes.</p></div>
        <div className="rounded-2xl border border-navy/10 bg-white p-3"><div className="text-xs font-black text-electric">2 · WALK THE LAB</div><p className="mt-1 text-sm font-semibold">The glowing station is the next place to go. The town stays visible and playable.</p></div>
        <div className="rounded-2xl border border-navy/10 bg-white p-3"><div className="text-xs font-black text-electric">3 · MAKE DECISIONS</div><p className="mt-1 text-sm font-semibold">You will sort W-2 fields, build bracket math, place a credit, calculate the result, and catch an error.</p></div>
      </div>
      <div className="mt-4 rounded-2xl border border-sun/50 bg-sun/15 p-3 text-sm font-semibold">The numbers are simplified practice values, not current tax law.</div>
      <button type="button" onClick={onStart} className="mt-4 min-h-[52px] w-full rounded-2xl bg-electric px-5 font-black text-white">I’m ready · let me walk to a taxpayer</button>
    </PanelShell>
  )
}

function ClientPanel({ taxCase, client, work, feedback, onPrediction, onAccept, onClose }) {
  if (!taxCase || !client) return null
  return (
    <PanelShell eyebrow={`${client.name} · taxpayer`} title="Do not guess the refund from withholding alone" subtitle={client.line} onClose={onClose}>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-navy p-4 text-white"><div className="text-xs font-black text-white/55">W-2 BOX 1 · WAGES</div><div className="mt-1 font-display text-3xl font-black">{money(taxCase.wages)}</div></div>
        <div className="rounded-2xl bg-electric p-4 text-white"><div className="text-xs font-black text-white/65">W-2 BOX 2 · WITHHELD</div><div className="mt-1 font-display text-3xl font-black">{money(taxCase.withheld)}</div></div>
      </div>
      <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-4">
        <div className="text-sm font-black">Before doing any tax math, what can you actually conclude?</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Prediction">
          {[
            ['refund', 'They definitely get a refund'],
            ['due', 'They definitely owe more'],
            ['unknown', 'We cannot know yet'],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => onPrediction(id)} className={`min-h-[58px] rounded-xl border-2 p-2 text-sm font-extrabold transition ${work.prediction === id ? (work.predictionCorrect ? 'border-teal bg-teal/10' : 'border-[#e46a3a] bg-[#fff0e8]') : 'border-navy/10 bg-white hover:border-electric'}`}>{label}</button>
          ))}
        </div>
      </div>
      <Feedback feedback={feedback} />
      <button type="button" disabled={!work.predictionCorrect} onClick={onAccept} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-5 font-black text-navy disabled:cursor-not-allowed disabled:opacity-35">{work.predictionCorrect ? `Take ${client.name}’s case` : 'Make the evidence-based decision first'}</button>
    </PanelShell>
  )
}

function W2Station({ taxCase, work, feedback, onField, onCommit, onClose }) {
  const fields = useMemo(() => [
    { key: 'employerId', box: 'Employer ID', label: 'Employer identification number', value: '12-3456789' },
    { key: 'wages', box: 'Box 1', label: 'Wages, tips, other compensation', value: money(taxCase.wages) },
    { key: 'ssWages', box: 'Box 3', label: 'Social Security wages', value: money(taxCase.wages + 600) },
    { key: 'withheld', box: 'Box 2', label: 'Federal income tax withheld', value: money(taxCase.withheld) },
    { key: 'stateTax', box: 'Box 17', label: 'State income tax', value: money(Math.round(taxCase.withheld * 0.55)) },
  ], [taxCase])
  const ready = work.selectedW2Fields.includes('wages') && work.selectedW2Fields.includes('withheld')

  return (
    <PanelShell eyebrow="Station 1 · W-2 scanner" title="Pull only the federal return numbers" subtitle="The scanner contains real-looking distractors. Select the two fields this simplified federal return needs." onClose={onClose}>
      <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="tax-paper-float relative overflow-hidden rounded-2xl border-2 border-navy/10 bg-white p-4">
          <div className="tax-scan-line absolute inset-x-0 h-1 bg-electric/60" aria-hidden="true" />
          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((field) => {
              const selected = work.selectedW2Fields.includes(field.key)
              return (
                <button key={field.key} type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', field.key)} onClick={() => onField(field.key)} className={`rounded-xl border-2 p-3 text-left transition active:scale-[0.98] ${selected ? 'border-teal bg-teal/10' : 'border-navy/10 hover:border-electric'}`}>
                  <span className="block text-[10px] font-black uppercase tracking-wide text-electric">{field.box}</span><span className="block text-sm font-extrabold">{field.label}</span><span className="mt-1 block font-display text-xl font-black">{field.value}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-navy p-4 text-white" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onField(event.dataTransfer.getData('text/plain'))}>
          <div className="text-xs font-black uppercase tracking-wide text-teal">Return slots</div>
          <div className="mt-3 space-y-2">
            <div className={`rounded-xl border p-3 ${work.selectedW2Fields.includes('wages') ? 'border-teal bg-teal/10' : 'border-white/15'}`}><div className="text-xs text-white/55">WAGES</div><strong>{work.selectedW2Fields.includes('wages') ? money(taxCase.wages) : 'Drop / select Box 1'}</strong></div>
            <div className={`rounded-xl border p-3 ${work.selectedW2Fields.includes('withheld') ? 'border-teal bg-teal/10' : 'border-white/15'}`}><div className="text-xs text-white/55">FEDERAL WITHHOLDING</div><strong>{work.selectedW2Fields.includes('withheld') ? money(taxCase.withheld) : 'Drop / select Box 2'}</strong></div>
          </div>
        </div>
      </div>
      <Feedback feedback={feedback} />
      <button type="button" disabled={!ready} onClick={onCommit} className="mt-4 min-h-[50px] w-full rounded-2xl bg-electric px-5 font-black text-white disabled:opacity-35">Lock these fields into the return</button>
    </PanelShell>
  )
}

function DeductionStation({ math, work, feedback, onPlace, onDone, onClose }) {
  const drop = (target) => (event) => { event.preventDefault(); onPlace(target) }
  return (
    <PanelShell eyebrow="Station 2 · deduction desk" title="Decide where a deduction belongs" subtitle="A deduction lowers taxable income before the bracket machine. A credit is different and comes later." onClose={onClose}>
      <div className="mt-4 flex flex-col items-center gap-4">
        <button type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', 'deduction')} className="tax-stamp-button rounded-2xl border-4 border-dashed border-[#ff8a3d] bg-sun/25 px-6 py-4 text-center"><span className="block text-xs font-black text-[#c95f14]">DRAG OR TAP THIS DEDUCTION</span><span className="font-display text-3xl font-black">−{money(math.deduction)}</span></button>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <button type="button" onDragOver={(event) => event.preventDefault()} onDrop={drop('income')} onClick={() => onPlace('income')} className={`min-h-[110px] rounded-2xl border-2 p-4 text-left ${work.deductionTarget === 'income' ? 'border-teal bg-teal/10' : 'border-electric/20 bg-white'}`}><div className="text-xs font-black text-electric">BEFORE BRACKETS</div><div className="mt-1 font-display text-xl font-black">Wages → taxable income</div><p className="mt-1 text-sm font-semibold text-navy/60">Drop here if the deduction should reduce income first.</p></button>
          <button type="button" onDragOver={(event) => event.preventDefault()} onDrop={drop('tax')} onClick={() => onPlace('tax')} className="min-h-[110px] rounded-2xl border-2 border-brandpurple/20 bg-white p-4 text-left"><div className="text-xs font-black text-brandpurple">AFTER BRACKETS</div><div className="mt-1 font-display text-xl font-black">Final tax bill</div><p className="mt-1 text-sm font-semibold text-navy/60">Drop here if it should subtract directly from tax.</p></button>
        </div>
        {work.deductionApplied && <div className="tax-pop w-full rounded-2xl bg-teal/10 p-4 text-center"><div className="text-sm font-black">{money(math.wages)} − {money(math.deduction)}</div><div className="font-display text-3xl font-black">{money(math.taxableIncome)} taxable income</div></div>}
      </div>
      <Feedback feedback={feedback} />
      {work.deductionApplied && <button type="button" onClick={onDone} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-5 font-black text-navy">Stamp complete · back to the map</button>}
    </PanelShell>
  )
}

function BracketStation({ math, work, feedback, onInput, onRun, onDone, onClose }) {
  const inputs = work.bracketInputs
  return (
    <PanelShell eyebrow="Station 3 · bracket machine" title="Build the bracket split yourself" subtitle={`Taxable income is ${money(math.taxableIncome)}. The first ${money(5000)} uses 10%; only dollars above that use 12%.`} onClose={onClose}>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border-2 border-electric/25 bg-white p-4"><div className="text-xs font-black text-electric">10% LANE</div><label className="mt-2 block text-sm font-bold">Income sent into lane</label><input inputMode="numeric" value={inputs.firstIncome} onChange={(event) => onInput('firstIncome', event.target.value)} className="mt-1 w-full rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="$ amount" /><label className="mt-3 block text-sm font-bold">Tax produced by this lane</label><input inputMode="numeric" value={inputs.firstTax} onChange={(event) => onInput('firstTax', event.target.value)} className="mt-1 w-full rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="10% result" /></div>
        <div className="rounded-2xl border-2 border-brandpurple/25 bg-white p-4"><div className="text-xs font-black text-brandpurple">12% LANE</div><label className="mt-2 block text-sm font-bold">Income sent into lane</label><input inputMode="numeric" value={inputs.secondIncome} onChange={(event) => onInput('secondIncome', event.target.value)} className="mt-1 w-full rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="$ amount" /><label className="mt-3 block text-sm font-bold">Tax produced by this lane</label><input inputMode="numeric" value={inputs.secondTax} onChange={(event) => onInput('secondTax', event.target.value)} className="mt-1 w-full rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="12% result" /></div>
      </div>
      <button type="button" onClick={onRun} className="mt-4 min-h-[50px] w-full rounded-2xl bg-electric px-5 font-black text-white">Run my numbers through the machine</button>
      {work.bracketValidated && <div className="tax-pop mt-4 rounded-2xl bg-teal/10 p-4 text-center"><div className="text-sm font-bold">Tax before credits</div><div className="font-display text-4xl font-black">{money(math.taxBeforeCredits)}</div></div>}
      <Feedback feedback={feedback} />
      {work.bracketValidated && <button type="button" onClick={onDone} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-5 font-black text-navy">Machine complete · walk to the credit counter</button>}
    </PanelShell>
  )
}

function CreditStation({ math, work, feedback, onPlace, onInput, onValidate, onDone, onClose }) {
  const drop = (target) => (event) => { event.preventDefault(); onPlace(target) }
  const placedCorrectly = work.creditTarget === 'tax'
  return (
    <PanelShell eyebrow="Station 4 · credit counter" title="Place the credit in the right stage" subtitle="You already calculated tax. Decide whether the credit changes taxable income or the tax bill itself." onClose={onClose}>
      <div className="mt-4 grid items-stretch gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <button type="button" onDragOver={(event) => event.preventDefault()} onDrop={drop('income')} onClick={() => onPlace('income')} className="rounded-2xl border-2 border-electric/20 bg-white p-4 text-left"><div className="text-xs font-black text-electric">TAXABLE INCOME</div><div className="font-display text-2xl font-black">{money(math.taxableIncome)}</div></button>
        <button type="button" draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', 'credit')} className={`tax-credit-token self-center rounded-full border-4 border-dashed px-4 py-5 text-center font-black ${placedCorrectly ? 'tax-credit-slide border-teal bg-teal/20' : 'border-[#ff8a3d] bg-sun/30'}`}><span className="block text-[10px]">CREDIT</span>−{money(math.credit)}</button>
        <button type="button" onDragOver={(event) => event.preventDefault()} onDrop={drop('tax')} onClick={() => onPlace('tax')} className={`rounded-2xl border-2 p-4 text-left ${placedCorrectly ? 'border-teal bg-teal/10' : 'border-brandpurple/20 bg-white'}`}><div className="text-xs font-black text-brandpurple">TAX BEFORE CREDIT</div><div className="font-display text-2xl font-black">{money(math.taxBeforeCredits)}</div></button>
      </div>
      {placedCorrectly && <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-4"><label className="text-sm font-black">Now calculate final tax after the credit</label><div className="mt-2 flex items-center gap-2"><span className="font-bold">{money(math.taxBeforeCredits)} − {money(math.credit)} =</span><input inputMode="numeric" value={work.creditFinalInput} onChange={(event) => onInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="$ final tax" /></div><button type="button" onClick={onValidate} className="mt-3 min-h-[44px] w-full rounded-xl bg-electric px-4 font-black text-white">Check final tax</button></div>}
      {work.creditApplied && <div className="tax-pop mt-4 rounded-2xl bg-teal/10 p-4 text-center"><div className="text-sm font-bold">Final tax</div><div className="font-display text-4xl font-black">{money(math.finalTax)}</div></div>}
      <Feedback feedback={feedback} />
      {work.creditApplied && <button type="button" onClick={onDone} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-5 font-black text-navy">Credit applied · back to the map</button>}
    </PanelShell>
  )
}

function ReconcileStation({ math, work, feedback, onKind, onAmount, onCheck, onDone, onClose }) {
  return (
    <PanelShell eyebrow="Station 5 · refund scale" title="Decide the outcome and calculate the difference" subtitle="Withholding is money already sent during the year. Compare it with final tax, then calculate only the difference." onClose={onClose}>
      <div className="tax-balance mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="rounded-2xl bg-electric p-4 text-center text-white"><div className="text-xs font-black text-white/65">WITHHELD</div><div className="font-display text-3xl font-black">{money(math.withheld)}</div></div>
        <div className="pb-4 font-display text-2xl font-black text-navy/35">VS</div>
        <div className="rounded-2xl bg-navy p-4 text-center text-white"><div className="text-xs font-black text-white/65">FINAL TAX</div><div className="font-display text-3xl font-black">{money(math.finalTax)}</div></div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {['refund', 'due', 'even'].map((kind) => <button key={kind} type="button" onClick={() => onKind(kind)} className={`min-h-[48px] rounded-xl border-2 font-black ${work.reconcileKind === kind ? 'border-electric bg-electric/10' : 'border-navy/10 bg-white'}`}>{kind === 'refund' ? 'Refund' : kind === 'due' ? 'Amount due' : 'Exactly even'}</button>)}
      </div>
      <div className="mt-3 rounded-2xl border border-navy/10 bg-white p-4"><label className="text-sm font-black">What is the dollar difference?</label><input inputMode="numeric" value={work.reconcileAmount} onChange={(event) => onAmount(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-navy/10 px-3 py-2 font-display text-xl font-black" placeholder="$ difference" /></div>
      <button type="button" onClick={onCheck} className="mt-3 min-h-[50px] w-full rounded-2xl bg-electric px-5 font-black text-white">Set the balance scale</button>
      {work.compared && <div className="tax-pop mt-4 rounded-2xl bg-teal/10 p-4 text-center"><div className="text-sm font-bold">Correct result</div><div className="font-display text-3xl font-black">{math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'}</div></div>}
      <Feedback feedback={feedback} />
      {work.compared && <button type="button" onClick={onDone} className="mt-4 min-h-[50px] w-full rounded-2xl bg-teal px-5 font-black text-navy">Balance understood · walk to e-file</button>}
    </PanelShell>
  )
}

function FilingStation({ math, work, feedback, onPickField, onCorrection, onCheckCorrection, onSignature, onFile, onClose }) {
  const plantedWrongTax = math.finalTax + 100
  const resultText = math.refund > 0 ? `${money(math.refund)} refund` : math.amountDue > 0 ? `${money(math.amountDue)} amount due` : '$0 even'
  const rows = [
    ['wages', 'Wages', money(math.wages)],
    ['taxable', 'Taxable income', money(math.taxableIncome)],
    ['finalTax', 'Final tax', money(plantedWrongTax)],
    ['withheld', 'Federal tax withheld', money(math.withheld)],
    ['result', 'Refund / amount due', resultText],
  ]
  const signatureReady = String(work.signatureText || '').trim().toUpperCase() === 'FILE'

  return (
    <PanelShell eyebrow="Station 6 · e-file desk" title="Catch the planted error before you file" subtitle="A real review is not checking boxes. One field below is wrong. Find it, correct it, then authorize the practice filing." onClose={onClose}>
      <div className="mt-4 rounded-2xl border-2 border-navy/10 bg-white p-4">
        <div className="text-xs font-black uppercase tracking-wide text-electric">Practice return review copy</div>
        <div className="mt-3 space-y-2">
          {rows.map(([key, label, value]) => <button key={key} type="button" onClick={() => onPickField(key)} className={`flex w-full items-center justify-between gap-3 rounded-xl border-2 p-3 text-left ${work.reviewField === key ? (key === 'finalTax' ? 'border-teal bg-teal/10' : 'border-[#e46a3a] bg-[#fff0e8]') : 'border-navy/10'}`}><span className="font-bold">{label}</span><strong className="font-display text-xl">{value}</strong></button>)}
        </div>
      </div>
      {work.reviewField === 'finalTax' && <div className="mt-3 rounded-2xl border border-teal/30 bg-teal/10 p-4"><label className="text-sm font-black">You found the bad field. Enter the correct final tax.</label><input inputMode="numeric" value={work.reviewCorrection} onChange={(event) => onCorrection(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-navy/10 bg-white px-3 py-2 font-display text-xl font-black" placeholder="$ correct final tax" /><button type="button" onClick={onCheckCorrection} className="mt-3 min-h-[44px] w-full rounded-xl bg-electric px-4 font-black text-white">Repair the return</button></div>}
      {work.reviewCorrected && <div className="tax-pop mt-3 rounded-2xl bg-teal/10 p-4"><div className="font-black">Return repaired: final tax = {money(math.finalTax)}</div><p className="mt-1 text-sm font-semibold">Type <strong>FILE</strong> to confirm you reviewed the numbers before sending this practice return.</p><input value={work.signatureText || ''} onChange={(event) => onSignature(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-navy/10 bg-white px-3 py-2 font-black uppercase" placeholder="Type FILE" /></div>}
      <Feedback feedback={feedback} />
      {work.reviewCorrected && <button type="button" disabled={!signatureReady || work.signed} onClick={onFile} className="mt-4 min-h-[52px] w-full rounded-2xl bg-teal px-5 font-black text-navy disabled:opacity-35">{work.signed ? 'Practice return transmitting…' : 'Send reviewed practice return'}</button>}
    </PanelShell>
  )
}

function CompletePanel({ taxCase, onFinish, onClose }) {
  const math = taxReturnMath(taxCase)
  return (
    <PanelShell eyebrow="Module 5 complete" title="Practice return filed" subtitle={taxResultSummary(taxCase)} onClose={onClose}>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#eef8ff] p-4 text-sm sm:grid-cols-3">
        <div><span className="block text-navy/45">Wages</span><strong>{money(math.wages)}</strong></div><div><span className="block text-navy/45">Taxable</span><strong>{money(math.taxableIncome)}</strong></div><div><span className="block text-navy/45">Final tax</span><strong>{money(math.finalTax)}</strong></div><div><span className="block text-navy/45">Withheld</span><strong>{money(math.withheld)}</strong></div><div><span className="block text-navy/45">Refund</span><strong>{money(math.refund)}</strong></div><div><span className="block text-navy/45">Due</span><strong>{money(math.amountDue)}</strong></div>
      </div>
      <p className="mt-4 text-sm font-semibold text-navy/65">You had to interpret a document, place a deduction and credit correctly, calculate bracket amounts, decide refund vs. due, and catch an error before filing.</p>
      <button type="button" onClick={onFinish} className="mt-4 min-h-[52px] w-full rounded-2xl bg-electric px-5 font-black text-white">Finish Module 5</button>
    </PanelShell>
  )
}

export function TaxWorkbenchOverlay() {
  const phase = useTaxLab((s) => s.phase)
  const taxCase = useTaxLab((s) => s.taxCase)
  const candidateCase = useTaxLab((s) => s.candidateCase)
  const stepNumber = useTaxLab((s) => s.stepNumber)
  const panel = useTaxLab((s) => s.panel)
  const feedback = useTaxLab((s) => s.feedback)
  const worldNotice = useTaxLab((s) => s.worldNotice)
  const work = useTaxLab((s) => s.work)
  const initialized = useRef(false)
  const math = taxReturnMath(taxCase)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const profile = loadProfile() || {}
    const saved = profile.taxLabProgress
    const savedCase = TAX_CASES.find((item) => item.id === saved?.caseId) || null
    if (saved && !saved.completed && savedCase) useTaxLab.getState().restore({ phase: saved.phase, taxCase: savedCase, stepNumber: saved.stepNumber })
    else useTaxLab.getState().reset()
    recordLearningEvent({ moduleName: 'tax', type: 'module_start', outcome: 'started', detail: 'in_world_decision_lab' }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!initialized.current || phase === 'complete') return
    saveProfile({ taxLabProgress: { phase, caseId: taxCase?.id || null, stepNumber, completed: false } })
  }, [phase, stepNumber, taxCase?.id])

  const recordInteraction = useCallback((outcome, detail = '') => {
    recordLearningEvent({ moduleName: 'tax', type: 'tax_decision_action', outcome, detail: `step=${stepNumber};case=${taxCase?.id || candidateCase?.id || 'none'}${detail ? `;${detail}` : ''}` }).catch(() => {})
  }, [candidateCase?.id, stepNumber, taxCase?.id])

  const success = (text) => useTaxLab.getState().setFeedback({ kind: 'success', text })
  const retry = (key, text) => {
    useTaxLab.getState().incrementMistake(key)
    useTaxLab.getState().setFeedback({ kind: 'retry', text })
    recordInteraction('retry', key)
  }
  const finishStep = (outcome) => {
    recordInteraction(outcome)
    useTaxLab.getState().advanceStep()
  }

  const client = TAX_CLIENTS.find((item) => item.caseId === candidateCase?.id)

  const onPrediction = (prediction) => {
    useTaxLab.getState().setWorkValue('prediction', prediction)
    if (prediction === 'unknown') {
      useTaxLab.getState().setWorkValue('predictionCorrect', true)
      success('Correct. Withholding is only money already paid. You need deductions, brackets, credits, and the final comparison before you know the outcome.')
      recordInteraction('prediction_evidence_based')
    } else {
      useTaxLab.getState().setWorkValue('predictionCorrect', false)
      retry('predictionMistakes', 'The W-2 shows wages and withholding, but not final tax. You cannot know refund vs. due yet.')
    }
  }

  const onW2Field = (field) => {
    if (field === 'wages' || field === 'withheld') {
      useTaxLab.getState().addW2Field(field)
      success(field === 'wages' ? 'Box 1 is the wages figure used to begin this return.' : 'Box 2 is federal income tax already withheld during the year.')
      recordInteraction(`w2_${field}`)
    } else retry('w2Mistakes', 'That field is real information, but it is not one of the two numbers this simplified federal return asks you to copy.')
  }

  const onDeductionPlace = (target) => {
    useTaxLab.getState().setWorkValue('deductionTarget', target)
    if (target === 'income') {
      useTaxLab.getState().setWorkValue('deductionApplied', true)
      success('Right. A deduction lowers taxable income before tax brackets are applied.')
      recordInteraction('deduction_before_brackets')
    } else {
      useTaxLab.getState().setWorkValue('deductionApplied', false)
      retry('deductionMistakes', 'Subtracting directly from tax is what a credit does. Move the deduction to the income side.')
    }
  }

  const onRunBrackets = () => {
    const firstTax = Math.round(math.firstBracketIncome * FIRST_BRACKET_RATE)
    const secondTax = Math.round(math.secondBracketIncome * SECOND_BRACKET_RATE)
    const inputs = work.bracketInputs
    const correct = numberValue(inputs.firstIncome) === math.firstBracketIncome
      && numberValue(inputs.secondIncome) === math.secondBracketIncome
      && numberValue(inputs.firstTax) === firstTax
      && numberValue(inputs.secondTax) === secondTax
    if (correct) {
      useTaxLab.getState().setWorkValue('bracketValidated', true)
      success(`${money(firstTax)} + ${money(secondTax)} = ${money(math.taxBeforeCredits)} tax before credits.`)
      recordInteraction('bracket_machine_correct')
    } else {
      useTaxLab.getState().setWorkValue('bracketValidated', false)
      retry('bracketMistakes', `Split taxable income first: at most ${money(5000)} can go through 10%. Everything above that goes through 12%. Then multiply each lane by its rate.`)
    }
  }

  const onCreditPlace = (target) => {
    useTaxLab.getState().setWorkValue('creditTarget', target)
    useTaxLab.getState().setWorkValue('creditApplied', false)
    if (target === 'tax') {
      success('Correct placement. A credit subtracts from tax after the bracket calculation. Now calculate the new final tax.')
      recordInteraction('credit_after_brackets')
    } else retry('creditMistakes', 'That would make the credit behave like a deduction. Credits reduce tax itself, not taxable income.')
  }

  const onValidateCredit = () => {
    if (work.creditTarget === 'tax' && numberValue(work.creditFinalInput) === math.finalTax) {
      useTaxLab.getState().setWorkValue('creditApplied', true)
      success(`Correct: ${money(math.taxBeforeCredits)} − ${money(math.credit)} = ${money(math.finalTax)} final tax.`)
      recordInteraction('credit_math_correct')
    } else retry('creditMistakes', 'Subtract the credit from tax before credits. Check the subtraction and try again.')
  }

  const onCheckReconcile = () => {
    const correctKind = math.refund > 0 ? 'refund' : math.amountDue > 0 ? 'due' : 'even'
    const correctAmount = Math.max(math.refund, math.amountDue)
    if (work.reconcileKind === correctKind && numberValue(work.reconcileAmount) === correctAmount) {
      useTaxLab.getState().setWorkValue('compared', true)
      success(math.refund > 0 ? 'Withholding is larger than final tax, so the extra comes back as a refund.' : math.amountDue > 0 ? 'Final tax is larger than withholding, so the difference is still due.' : 'The two amounts match exactly.')
      recordInteraction('reconcile_correct')
    } else {
      useTaxLab.getState().setWorkValue('compared', false)
      retry('reconcileMistakes', 'Compare which number is larger, then subtract the smaller amount from the larger amount. That tells you both the direction and the difference.')
    }
  }

  const onPickReviewField = (field) => {
    useTaxLab.getState().setWorkValue('reviewField', field)
    useTaxLab.getState().setWorkValue('reviewCorrected', false)
    if (field === 'finalTax') {
      success('You caught the planted error. The final tax is $100 too high on this review copy. Repair it before filing.')
      recordInteraction('review_error_found')
    } else retry('reviewMistakes', 'That row matches the work you already completed. Compare the final-tax row with your credit calculation.')
  }

  const onCheckCorrection = () => {
    if (work.reviewField === 'finalTax' && numberValue(work.reviewCorrection) === math.finalTax) {
      useTaxLab.getState().setWorkValue('reviewCorrected', true)
      success('The return now matches your earlier tax calculation. It is ready for authorization.')
      recordInteraction('review_error_repaired')
    } else retry('reviewMistakes', 'Use the final tax you calculated after applying the credit, not the planted value on the review copy.')
  }

  const finishReturn = useCallback(() => {
    if (!taxCase) return
    const profile = loadProfile() || {}
    const result = taxReturnMath(taxCase)
    const mistakes = work.predictionMistakes + work.w2Mistakes + work.deductionMistakes + work.bracketMistakes + work.creditMistakes + work.reconcileMistakes + work.reviewMistakes
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
        mistakes,
        stepsCompleted: TOTAL_TAX_STEPS,
        mode: 'in_world_decision_lab',
        completedAt: new Date().toISOString(),
      },
      taxLabProgress: { phase: 'complete', caseId: taxCase.id, stepNumber: TOTAL_TAX_STEPS, completed: true },
    })
    useTaxLab.getState().complete()
    recordLearningEvent({ moduleName: 'tax', type: 'module_complete', outcome: 'completed', detail: `in_world_decision_lab;case=${taxCase.id};mistakes=${mistakes};finalTax=${result.finalTax};refund=${result.refund};due=${result.amountDue}` }).catch(() => {})
  }, [taxCase, work])

  useEffect(() => {
    if (phase !== 'steps' || stepNumber !== 6 || !work.signed) return undefined
    const timer = setTimeout(finishReturn, 900)
    return () => clearTimeout(timer)
  }, [finishReturn, phase, stepNumber, work.signed])

  const finishModule = useCallback(() => {
    try { useGame.getState().adminClearUi() } catch { /* no-op */ }
    deactivatePaycheckWorld()
  }, [])

  const onFile = () => {
    useTaxLab.getState().sign()
    success('Sending your reviewed practice return…')
    recordInteraction('sign_and_file')
  }

  const activePanel = (() => {
    if (panel === 'guide') return <GuidePanel phase={phase} onStart={() => useTaxLab.getState().startCaseSelection()} onClose={() => useTaxLab.getState().closePanel()} onFinish={finishModule} />
    if (panel === 'client') return <ClientPanel taxCase={candidateCase} client={client} work={work} feedback={feedback} onPrediction={onPrediction} onAccept={() => candidateCase && useTaxLab.getState().chooseCase(candidateCase)} onClose={() => useTaxLab.getState().closePanel()} />
    if (!taxCase) return null
    if (panel === 'w2') return <W2Station taxCase={taxCase} work={work} feedback={feedback} onField={onW2Field} onCommit={() => finishStep('w2_fields_committed')} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'deduction') return <DeductionStation math={math} work={work} feedback={feedback} onPlace={onDeductionPlace} onDone={() => finishStep('deduction_completed')} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'brackets') return <BracketStation math={math} work={work} feedback={feedback} onInput={(key, value) => useTaxLab.getState().setBracketInput(key, value)} onRun={onRunBrackets} onDone={() => finishStep('brackets_completed')} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'credit') return <CreditStation math={math} work={work} feedback={feedback} onPlace={onCreditPlace} onInput={(value) => useTaxLab.getState().setWorkValue('creditFinalInput', value)} onValidate={onValidateCredit} onDone={() => finishStep('credit_completed')} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'reconcile') return <ReconcileStation math={math} work={work} feedback={feedback} onKind={(kind) => useTaxLab.getState().setWorkValue('reconcileKind', kind)} onAmount={(value) => useTaxLab.getState().setWorkValue('reconcileAmount', value)} onCheck={onCheckReconcile} onDone={() => finishStep('reconcile_completed')} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'filing') return <FilingStation math={math} work={work} feedback={feedback} onPickField={onPickReviewField} onCorrection={(value) => useTaxLab.getState().setWorkValue('reviewCorrection', value)} onCheckCorrection={onCheckCorrection} onSignature={(value) => useTaxLab.getState().setWorkValue('signatureText', value)} onFile={onFile} onClose={() => useTaxLab.getState().closePanel()} />
    if (panel === 'complete' || phase === 'complete') return <CompletePanel taxCase={taxCase} onFinish={finishModule} onClose={() => useTaxLab.getState().closePanel()} />
    return null
  })()

  return (
    <div data-tax-field-ui="true" className="pointer-events-none fixed inset-0 z-[900]">
      <div className="pointer-events-none absolute left-1/2 top-3 w-[min(92vw,42rem)] -translate-x-1/2 rounded-2xl border border-white/50 bg-navy/90 px-4 py-2 text-center text-white shadow-lg backdrop-blur-sm">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-teal">Module 5 · in-world Tax Lab</div>
        <div className="text-sm font-extrabold">{phase === 'steps' ? `Step ${stepNumber}: ${taxStationForStep(stepNumber).label} · ` : ''}{worldNotice}</div>
      </div>
      {activePanel && <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 sm:p-5">{activePanel}</div>}
    </div>
  )
}
