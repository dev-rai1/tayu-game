import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from './store.js'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'
import { PointerDragChoice } from './PointerDragChoice.jsx'

// ============================================================================
// Modules 6 (Bond Street) and 7 (Tax Office) live challenge panel.
//
// This runs over the normal town scene as an animated, decision-first overlay
// modelled on the lemonade stand: every beat is a small task (type the number,
// drag your answer, split a portfolio, sort income), a WRONG answer plays a
// shake + "try again" so nobody is stranded, and a RIGHT answer pops confetti
// and a cheer before it moves on. It is never a plain quiz.
//
// Progression contract: a pick goes through cardAct, which REMOVES the question
// card first and then pushes the feedback card. (The old bug called bondAct /
// taxAct directly, so the question card was never removed and the panel looked
// frozen - you tapped an answer and nothing happened.)
// ============================================================================

const money = (s = '') => Number(String(s).replace(/[^0-9.\-]/g, ''))
const accent = { 6: '#f4b942', 7: '#d86b45' }
const accentDeep = { 6: '#b6801f', 7: '#a44a2c' }

// Every type-in calculation gets a question-specific learning hint instead of
// the old generic "read the numbers carefully" message. The hints explain the
// operation/formula and the expected input format without simply giving away
// the final answer.
const NUMERIC_HINTS = {
  6: {
    2: 'Hint: Annual interest = amount lent × interest rate as a decimal. Change 4.5% to 0.045, then calculate 200 × 0.045. Enter the dollar number only (no $ sign).',
    3: 'Hint: Tax-equivalent yield = municipal yield ÷ (1 − tax rate). Change 22% to 0.22, find 1 − 0.22 first, then divide 3.8 by that result. Enter the percentage number only, such as 4.87.',
    9: 'Hint: The question asks for interest only. Add the three payments: 4.50 + 3.80 + 6.20. Do not add the $300 principal. Enter the dollar number only.',
    11: 'Hint: At maturity, principal is repaid along with the interest you earned. Add the $300 principal and $14.50 interest. Enter the total dollar number only.',
  },
  7: {
    2: 'Hint: Gross income here means add all taxable income sources before deductions. Add wages + lemonade profit + taxable corporate-bond interest: 1,200 + 300 + 20. Enter the dollar number only.',
    5: 'Hint: A deduction reduces taxable income. Start with gross income of 1,520 and subtract the 500 deduction. Enter the amount that remains.',
    6: 'Hint: Tax each bracket separately, then add the tax amounts. First calculate 500 × 0.10, then 520 × 0.20, then add those two results. Enter total tax only.',
    8: 'Hint: A capital gain is sale price − what you originally paid (cost basis). Calculate 110 − 80. Enter the gain only.',
    10: 'Hint: Withholding is tax already prepaid. Compare $154 total tax with $120 already withheld by calculating 154 − 120. Enter the amount still due.',
  },
}

// --- confetti / coin burst played on a correct answer -----------------------
function Celebrate({ week }) {
  const bits = useMemo(() => {
    const glyphs = week === 6 ? ['🪙', '💰', '📜', '⭐', '✨', '🏛️'] : ['✅', '🧾', '💵', '⭐', '✨', '🎯']
    return Array.from({ length: 18 }, (_, i) => ({
      g: glyphs[i % glyphs.length],
      left: 6 + Math.random() * 88,
      delay: Math.random() * 0.18,
      dur: 0.9 + Math.random() * 0.7,
      drift: (Math.random() * 2 - 1) * 60,
      rot: (Math.random() * 2 - 1) * 240,
      size: 18 + Math.random() * 16,
    }))
  }, [week])
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute', left: `${b.left}%`, top: '-8%', fontSize: b.size,
            animation: `lgcFall ${b.dur}s cubic-bezier(.25,.7,.4,1) ${b.delay}s forwards`,
            ['--drift']: `${b.drift}px`, ['--rot']: `${b.rot}deg`,
          }}
        >{b.g}</span>
      ))}
    </div>
  )
}

// --- animated coach reaction (a little face that reacts to the answer) ------
function Coach({ mood, week }) {
  const face = mood === 'right' ? '🤩' : mood === 'wrong' ? '🤔' : '🙂'
  return (
    <div
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-3xl shadow-inner"
      style={{
        background: mood === 'right' ? 'rgba(0,179,127,.14)' : mood === 'wrong' ? 'rgba(216,107,69,.14)' : 'rgba(20,100,240,.10)',
        animation: mood === 'right' ? 'lgcPop .5s ease' : mood === 'wrong' ? 'lgcShake .42s ease' : 'none',
      }}
      aria-hidden
    >{face}</div>
  )
}

function Feedback({ card, act, week }) {
  const btn = card?.buttons?.[0]
  if (!card || !/^(bondfb|taxfb)/.test(String(card.id))) return null
  const correct = /\.next$/.test(String(btn?.act))
  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-[104px] z-[345] w-[min(94vw,38rem)] -translate-x-1/2 overflow-hidden rounded-[30px] border-2 p-5 shadow-2xl backdrop-blur-xl"
      style={{
        borderColor: correct ? 'rgba(0,179,127,.45)' : 'rgba(216,107,69,.4)',
        background: correct ? 'linear-gradient(150deg,#f2fff9,#e7fff4)' : 'linear-gradient(150deg,#fff7f2,#ffeee6)',
        animation: correct ? 'lgcRise .32s ease' : 'lgcShake .42s ease',
      }}
    >
      {correct && <Celebrate week={week} />}
      <div className="relative z-20 flex items-start gap-3">
        <Coach mood={correct ? 'right' : 'wrong'} week={week} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-black uppercase tracking-[.18em]" style={{ color: correct ? '#0a8f66' : '#b5502e' }}>
            {correct ? 'Nice work' : 'Not quite - try again'}
          </div>
          <div className="mt-1 text-lg font-extrabold leading-snug text-navy">{card.text}</div>
        </div>
      </div>
      <button
        onClick={() => act(btn?.act)}
        className="relative z-20 mt-4 min-h-[52px] w-full rounded-2xl px-5 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95 sm:w-auto"
        style={{ background: correct ? '#0a8f66' : '#d86b45' }}
      >{btn?.label || (correct ? 'Continue' : 'Try again')}</button>
    </div>
  )
}

// --- type-in numeric task ("work it out, then type the number") -------------
function NumericChallenge({ step, onPick, accentHex, hint }) {
  const correctIndex = step.choices.findIndex((c) => c.correct)
  const expected = money(step.choices[correctIndex]?.label)
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const submit = () => {
    const n = Number(value)
    if (!Number.isFinite(n) || value.trim() === '') return
    if (Math.abs(n - expected) < Math.max(0.011, Math.abs(expected) * 0.003)) onPick(correctIndex)
    else {
      setShake(true); setTimeout(() => setShake(false), 440)
      const wrong = step.choices.findIndex((c, i) => i !== correctIndex)
      onPick(wrong < 0 ? 0 : wrong)
    }
  }
  return (
    <div className="mt-5 rounded-[24px] border-2 border-navy/10 bg-white/85 p-5" style={{ animation: shake ? 'lgcShake .42s ease' : 'none' }}>
      <div className="text-sm font-extrabold text-navy/60">🧮 Work it out, then type your answer.</div>
      <div className="mt-3 flex items-center gap-3">
        <input
          autoFocus inputMode="decimal" value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type a number"
          className="min-w-0 flex-1 rounded-2xl border-2 border-navy/15 bg-[#fffaf0] px-4 py-4 text-2xl font-black text-navy outline-none transition focus:ring-4"
          style={{ ['--tw-ring-color']: `${accentHex}33`, borderColor: value ? accentHex : undefined }}
        />
        <button onClick={submit} className="rounded-2xl px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95" style={{ background: accentHex }}>Check</button>
      </div>
      <div className="mt-3 rounded-xl bg-navy/[.045] px-3 py-2 text-xs font-bold leading-relaxed text-navy/65">
        {hint || 'Hint: identify what the question asks for, choose the matching operation, and enter only the final number.'}
      </div>
    </div>
  )
}

// --- drag-your-answer-into-the-basket task ----------------------------------
function DragChoice({ step, onPick }) {
  const basketRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(false)
  const inside = (x, y) => {
    const r = basketRef.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }
  const start = (e, i) => {
    if (e.button !== undefined && e.button !== 0) return
    e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ i, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY })
    setOver(inside(e.clientX, e.clientY))
  }
  const move = (e, i) => {
    if (!drag || drag.i !== i || drag.pointerId !== e.pointerId) return
    e.preventDefault(); setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d)); setOver(inside(e.clientX, e.clientY))
  }
  const finish = (e, i) => {
    if (!drag || drag.i !== i || drag.pointerId !== e.pointerId) return
    e.preventDefault(); const hit = inside(e.clientX, e.clientY)
    try { e.currentTarget.releasePointerCapture?.(e.pointerId) } catch { /* noop */ }
    setDrag(null); setOver(false); if (hit) onPick(i)
  }
  const cancel = (e, i) => { if (!drag || drag.i !== i) return; try { e.currentTarget.releasePointerCapture?.(e.pointerId) } catch { /* noop */ } setDrag(null); setOver(false) }
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-[1fr_.8fr]">
      <div className="grid gap-2">
        {step.choices.map((c, i) => {
          const active = drag?.i === i
          const dx = active ? drag.x - drag.startX : 0
          const dy = active ? drag.y - drag.startY : 0
          return (
            <div
              key={c.label} role="button" tabIndex={0}
              aria-label={`Drag ${c.label} to the answer basket`}
              onPointerDown={(e) => start(e, i)} onPointerMove={(e) => move(e, i)}
              onPointerUp={(e) => finish(e, i)} onPointerCancel={(e) => cancel(e, i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(i) } }}
              style={{ touchAction: 'none', userSelect: 'none', transform: active ? `translate3d(${dx}px,${dy}px,0) rotate(${Math.max(-5, Math.min(5, dx / 30))}deg) scale(1.04)` : undefined, zIndex: active ? 999 : 1, position: 'relative' }}
              className={`rounded-2xl border-2 px-4 py-3 font-bold text-navy transition ${active ? 'cursor-grabbing border-[#f4b942] bg-white shadow-2xl ring-4 ring-[#f4b942]/20' : 'cursor-grab border-navy/10 bg-[#fffaf0] shadow-sm hover:-translate-y-0.5 hover:shadow-md'}`}
            ><span className="mr-2 inline-block text-navy/35">⠿</span>{c.label}</div>
          )
        })}
      </div>
      <div ref={basketRef} className={`grid min-h-[160px] place-items-center rounded-[26px] border-[3px] border-dashed p-5 text-center transition duration-150 ${over ? 'scale-[1.035] border-[#f4b942] bg-[#fff0bd] shadow-[0_0_0_7px_rgba(244,185,66,.16)]' : 'border-navy/20 bg-white/55'}`}>
        <div>
          <div className={`text-4xl transition ${over ? 'scale-125' : 'scale-100'}`}>🧺</div>
          <div className="mt-2 font-black text-navy">{over ? 'Release to choose' : 'Drag your answer here'}</div>
          <div className="text-xs font-bold text-navy/45">Mouse, trackpad, and touch all work. Enter on a focused card works too.</div>
        </div>
      </div>
    </div>
  )
}

// --- build-a-$300-bond-mix slider task (Module 6, diversification) -----------
function AllocationChallenge({ onPick, accentHex }) {
  const [t, setT] = useState(100), [m, setM] = useState(100), [c, setC] = useState(100)
  const total = t + m + c
  const check = () => onPick(t === 150 && m === 90 && c === 60 ? 0 : 1)
  const row = (label, val, set, color) => (
    <div className="grid grid-cols-[7rem_1fr_4rem] items-center gap-3">
      <b className="text-sm text-navy">{label}</b>
      <input type="range" min="0" max="300" step="10" value={val} onChange={(e) => set(Number(e.target.value))} style={{ accentColor: color }} />
      <span className="rounded-xl bg-white px-2 py-1 text-center font-black text-navy">${val}</span>
    </div>
  )
  return (
    <div className="mt-5 rounded-[26px] border-2 border-navy/10 bg-[#fffaf0]/90 p-5">
      <div className="mb-4 flex items-center justify-between">
        <b className="text-navy">🎛️ Build a $300 bond mix</b>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${total === 300 ? 'bg-teal/20 text-navy' : 'bg-orange-100 text-orange-800'}`}>Total ${total}</span>
      </div>
      <div className="grid gap-4">{row('Treasury', t, setT, '#4267b2')}{row('Municipal', m, setM, '#2c9a72')}{row('Corporate', c, setC, '#d9763f')}</div>
      <button onClick={check} disabled={total !== 300} className="mt-5 w-full rounded-2xl px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-35 sm:w-auto" style={{ background: accentHex }}>Lock portfolio</button>
      {total !== 300 && <div className="mt-2 text-xs font-bold text-navy/45">Move the sliders until the three lends total exactly $300.</div>}
    </div>
  )
}

// --- sort-the-income task (Module 7, taxable vs excluded) --------------------
function TaxSort({ onPick, accentHex }) {
  const [muni, setMuni] = useState(null), [corp, setCorp] = useState(null)
  const cell = (title, amount, val, set) => (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <b>{title}</b><div className="text-2xl font-black">${amount}</div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => set('taxable')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black transition ${val === 'taxable' ? 'border-navy bg-navy text-white' : 'border-navy/15 hover:border-navy/35'}`}>TAXABLE</button>
        <button onClick={() => set('excluded')} className={`flex-1 rounded-xl border-2 p-2 text-xs font-black transition ${val === 'excluded' ? 'border-navy bg-navy text-white' : 'border-navy/15 hover:border-navy/35'}`}>EXCLUDED</button>
      </div>
    </div>
  )
  return (
    <div className="mt-5 rounded-[26px] border-2 border-navy/10 bg-[#f9f5ec] p-5">
      <div className="mb-3 text-sm font-extrabold text-navy/60">🗂️ Drop each income into the right pile.</div>
      <div className="grid grid-cols-2 gap-3">{cell('Municipal interest', 40, muni, setMuni)}{cell('Corporate interest', 20, corp, setCorp)}</div>
      <button onClick={() => onPick(muni === 'excluded' && corp === 'taxable' ? 0 : 1)} disabled={!muni || !corp} className="mt-4 w-full rounded-2xl px-5 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-35 sm:w-auto" style={{ background: accentHex }}>Send to return</button>
    </div>
  )
}

function ChallengeArt({ week, step }) {
  const mode = week === 6 ? 'bond' : 'tax'
  return (
    <div className={`relative mb-4 h-20 overflow-hidden rounded-[22px] ${week === 6 ? 'bg-gradient-to-r from-[#263b64] via-[#8d7132] to-[#263b64]' : 'bg-gradient-to-r from-[#743b2f] via-[#d7a86e] to-[#6f332b]'}`}>
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(90deg,transparent 49%,rgba(255,255,255,.35) 50%,transparent 51%)', backgroundSize: '32px 100%', animation: 'lateSlide 4s linear infinite' }} />
      {week === 6
        ? <><div className="absolute left-5 top-4 text-4xl animate-bounce">🪙</div><div className="absolute left-1/3 top-5 text-3xl animate-pulse">📜</div><div className="absolute right-8 top-4 text-4xl" style={{ animation: 'lateFloat 2.8s ease-in-out infinite' }}>🏛️</div></>
        : <><div className="absolute left-5 top-4 text-4xl" style={{ animation: 'lateFloat 2.2s ease-in-out infinite' }}>📄</div><div className="absolute left-1/3 top-4 text-4xl animate-pulse">🧮</div><div className="absolute right-8 top-4 text-4xl" style={{ animation: 'lateStamp 2.7s ease-in-out infinite' }}>✅</div></>}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[.16em] text-white">{mode} challenge {step + 1}</div>
    </div>
  )
}

function ProgressBar({ index, total, week }) {
  const pct = Math.round(((index) / Math.max(1, total)) * 100)
  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy/10">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(6, pct)}%`, background: `linear-gradient(90deg,${accent[week]},${accentDeep[week]})` }} />
      </div>
      <span className="shrink-0 text-xs font-black text-navy/50">{index + 1}/{total}</span>
    </div>
  )
}

const KEYFRAMES = `
@keyframes lateSlide{to{background-position:64px 0}}
@keyframes lateFloat{50%{transform:translateY(-9px) rotate(5deg)}}
@keyframes lateStamp{50%{transform:translateY(7px) rotate(-7deg) scale(.92)}}
@keyframes lgcFall{to{transform:translate(var(--drift),120%) rotate(var(--rot));opacity:0}}
@keyframes lgcPop{0%{transform:scale(.5)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes lgcShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
@keyframes lgcRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`

export function LateGameChallengePanel() {
  const week = useGame((s) => s.week)
  const bondStep = useGame((s) => s.bondStep)
  const taxStep = useGame((s) => s.taxStep)
  const cards = useGame((s) => s.cards)
  const dialog = useGame((s) => s.dialog)
  const cardAct = useGame((s) => s.cardAct)
  const card = cards[0]
  const isLate = week === 6 || week === 7
  const [instance, setInstance] = useState(0)
  const stepIndex = week === 6 ? bondStep : taxStep
  const steps = week === 6 ? BOND_STEPS : TAX_STEPS
  const step = steps[stepIndex]
  const prefix = week === 6 ? 'bond' : 'tax'

  // A pick MUST go through cardAct: it removes the current question card first,
  // then bondAct/taxAct pushes the feedback card. Calling the raw action here
  // was the "tap does nothing / never advances" bug.
  const pick = (i) => { setInstance((x) => x + 1); cardAct(`${prefix}.pick:${i}`) }

  useEffect(() => { setInstance((x) => x + 1) }, [stepIndex, week])

  if (!isLate || dialog || !card) return null

  if (/^(bondfb|taxfb)/.test(String(card.id))) {
    return (<><style>{KEYFRAMES}</style><Feedback card={card} act={cardAct} week={week} /></>)
  }
  if (!step) return null

  if (step.done) {
    return (
      <div className="pointer-events-auto absolute left-1/2 top-[104px] z-[345] w-[min(94vw,38rem)] -translate-x-1/2 overflow-hidden rounded-[30px] border-2 border-white/70 bg-[#fffdf7]/95 p-6 text-center shadow-2xl">
        <style>{KEYFRAMES}</style>
        <Celebrate week={week} />
        <div className="relative z-20 text-5xl" style={{ animation: 'lgcPop .5s ease' }}>🎉</div>
        <h3 className="relative z-20 mt-2 text-2xl font-black text-navy">{week === 6 ? 'Bond Street complete!' : 'Tax return filed!'}</h3>
        <p className="relative z-20 mt-2 font-bold text-navy/65">{step.text}</p>
        <button onClick={() => cardAct(`${prefix}.finish`)} className="relative z-20 mt-4 rounded-2xl px-6 py-3 font-black text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95" style={{ background: accentDeep[week] }}>{step.continue || 'Finish'}</button>
      </div>
    )
  }

  // Only true arithmetic questions should use a number-entry box. Conceptual
  // W-2 and error-hunt questions stay as choice interactions instead of asking
  // players to guess an arbitrary number hidden inside a text answer.
  const numeric = week === 6 ? [2, 3, 9, 11].includes(stepIndex) : [2, 5, 6, 8, 10].includes(stepIndex)
  const accentHex = accent[week]
  const numericHint = NUMERIC_HINTS[week]?.[stepIndex]

  return (
    <div
      key={`${week}-${stepIndex}-${instance}`}
      className="pointer-events-auto absolute left-1/2 top-[86px] z-[340] max-h-[calc(100vh-104px)] w-[min(96vw,44rem)] -translate-x-1/2 overflow-y-auto rounded-[32px] border-2 border-white/70 p-5 shadow-2xl backdrop-blur-xl"
      style={{ background: week === 6 ? 'linear-gradient(145deg,rgba(255,250,232,.97),rgba(238,244,255,.96))' : 'linear-gradient(145deg,rgba(255,247,235,.97),rgba(255,238,230,.96))', boxShadow: `0 24px 80px ${accent[week]}33`, animation: 'lgcRise .3s ease' }}
    >
      <style>{KEYFRAMES}</style>
      <ChallengeArt week={week} step={stepIndex} />
      <div className="flex items-start gap-3">
        <Coach mood="idle" week={week} />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-black uppercase tracking-[.2em]" style={{ color: accent[week] }}>{step.speaker}</div>
          <h3 className="mt-1 text-xl font-black leading-snug text-navy">{step.text}</h3>
        </div>
      </div>
      {week === 6 && stepIndex === 10
        ? <AllocationChallenge onPick={pick} accentHex={accentHex} />
        : week === 7 && stepIndex === 4
          ? <TaxSort onPick={pick} accentHex={accentHex} />
          : numeric
            ? <NumericChallenge step={step} onPick={pick} accentHex={accentHex} hint={numericHint} />
            : <PointerDragChoice step={step} onPick={pick} />}
      <ProgressBar index={stepIndex} total={steps.length} week={week} />
    </div>
  )
}
