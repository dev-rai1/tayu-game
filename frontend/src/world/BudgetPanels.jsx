// BUDGET TOWN v3 PANELS (Round 8, Part 2). Two decision panels only:
// Beat 1 - the three-options intro (tap each card, watch its 2s animation).
// Beat 2 - the three +/- sliders and the LIVE PIE with per-slice feedback.
// Beats 3 and 4 play as cards + OFF-SCREEN world animation - no panel.
import { useState } from 'react'
import { useGame } from './store.js'
import { OPTION_CARDS, sliceLine, splitNudge, GROCERY_ITEMS, FOOD_BUDGET, MIN_FOODS, GROCERY_GATE } from '../scenarios/budgetTown.js'

const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })
const COLORS = { pocket: '#9aa6b8', bank: '#1464F0', garden: '#00b37f' }
const NAMES = { pocket: 'Pocket', bank: 'Bank', garden: 'Money Garden' }

// a tiny 2-second line animation: flat / slope / wiggle
function Spark({ kind, playing }) {
  const paths = {
    flat: 'M4 22 L96 22',
    slope: 'M4 30 C 40 26, 70 16, 96 8',
    wiggle: 'M4 26 C 20 10, 30 34, 46 16 S 74 30, 96 6',
  }
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full">
      <path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"
        style={playing ? { strokeDasharray: 160, strokeDashoffset: 160, animation: 'sparkdraw 2s ease forwards' } : { strokeDasharray: 'none' }} />
      <style>{'@keyframes sparkdraw { to { stroke-dashoffset: 0; } }'}</style>
    </svg>
  )
}

// Beat 1: the three homes for money
function OptionsPanel() {
  const bt = useGame((s) => s.bt)
  const btTryOption = useGame((s) => s.btTryOption)
  const btOptionsDone = useGame((s) => s.btOptionsDone)
  const [playing, setPlaying] = useState(null)
  const allTried = OPTION_CARDS.every((c) => bt.tried[c.id])
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="budget-options-title" className="pop-in w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <h2 id="budget-options-title" className="text-sm font-extrabold uppercase tracking-wide text-electric">Budget Town - Three homes for money</h2>
        <div className="mt-1 text-sm font-bold text-navy/70">Tap each one to see what it does. ({OPTION_CARDS.filter((c) => bt.tried[c.id]).length}/3 tried)</div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {OPTION_CARDS.map((c) => (
            <button key={c.id} aria-pressed={!!bt.tried[c.id]}
              onClick={() => { setPlaying(c.id); btTryOption(c.id); setTimeout(() => setPlaying((p) => (p === c.id ? null : p)), 2100) }}
              className={`rounded-2xl border-2 p-3 text-left transition active:scale-95 ${bt.tried[c.id] ? 'border-teal bg-teal/10' : 'border-navy/15 bg-navy/5'}`}>
              <div className="font-display text-sm font-extrabold" style={{ color: c.color }}>{c.title}</div>
              <div style={{ color: c.color }}><Spark kind={c.anim} playing={playing === c.id} /></div>
              <div className="mt-1 text-xs font-bold leading-snug text-navy/75">{c.line}</div>
              {bt.tried[c.id] && <div className="mt-1 text-[10px] font-extrabold uppercase text-teal">Seen!</div>}
            </button>
          ))}
        </div>
        <button disabled={!allTried} onClick={btOptionsDone}
          className="btn-primary mt-4 min-h-[52px] w-full px-5 disabled:opacity-40">
          {allTried ? "Got it - let's split my money!" : 'Tap all three first'}
        </button>
      </div>
    </div>
  )
}

// Beat 2: the LIVE PIE - the heart of Budget Town
function SplitPie({ split, total, onPick, picked }) {
  const ids = ['pocket', 'bank', 'garden']
  let acc = 0
  const segs = ids.map((id) => {
    const frac = (split[id] || 0) / Math.max(1, total)
    const seg = { id, from: acc, to: acc + frac }
    acc = seg.to
    return seg
  })
  const grad = segs.map((s) => `${COLORS[s.id]} ${Math.round(s.from * 360)}deg ${Math.round(s.to * 360)}deg`).join(', ')
  return (
    <div className="grid place-items-center">
      <div className="h-32 w-32 rounded-full shadow-inner transition-all duration-500" style={{ background: `conic-gradient(${grad})` }} />
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {ids.map((id) => (
          <button key={id} onClick={() => onPick(id)} onMouseEnter={() => onPick(id)}
            className={`rounded-xl px-2.5 py-1.5 text-[11px] font-extrabold text-white transition active:scale-95 ${picked === id ? 'ring-2 ring-navy' : ''}`}
            style={{ background: COLORS[id] }}>
            {NAMES[id]} {Math.round(((split[id] || 0) / Math.max(1, total)) * 100)}%
          </button>
        ))}
      </div>
    </div>
  )
}

function SplitPanel() {
  const bt = useGame((s) => s.bt)
  const btSetSplit = useGame((s) => s.btSetSplit)
  const btConfirmSplit = useGame((s) => s.btConfirmSplit)
  const [picked, setPicked] = useState(null)
  const total = bt.leftover
  const nudge = splitNudge(bt.split, total)
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="budget-split-title" className="pop-in w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <h2 id="budget-split-title" className="text-sm font-extrabold uppercase tracking-wide text-electric">Split your ${fmt(total)}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            {['pocket', 'bank', 'garden'].map((id) => (
              <div key={id} className="flex items-center justify-between rounded-2xl bg-navy/5 px-3 py-2">
                <div className="text-sm font-extrabold" style={{ color: COLORS[id] }}>{NAMES[id]}</div>
                <div className="flex items-center gap-1.5">
                  <button aria-label={`Put one dollar less in ${NAMES[id]}`} onClick={() => { btSetSplit(id, bt.split[id] - 1); setPicked(id) }}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 font-display text-lg font-extrabold text-navy active:scale-90">-</button>
                  <div className="w-12 text-center font-display text-base font-extrabold text-navy">${fmt(bt.split[id])}</div>
                  <button aria-label={`Put one dollar more in ${NAMES[id]}`} onClick={() => { btSetSplit(id, bt.split[id] + 1); setPicked(id) }}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 font-display text-lg font-extrabold text-navy active:scale-90">+</button>
                </div>
              </div>
            ))}
          </div>
          <SplitPie split={bt.split} total={total} onPick={setPicked} picked={picked} />
        </div>
        {/* the advisor's exact per-slice feedback, live with real percentages */}
        <div aria-live="polite" className="mt-3 min-h-[44px] rounded-2xl bg-navy/5 px-3 py-2 text-sm font-bold leading-snug text-navy/80">
          {picked
            ? sliceLine(picked, Math.round(((bt.split[picked] || 0) / Math.max(1, total)) * 100))
            : 'Tap a slice to hear what your plan means.'}
        </div>
        {nudge && <div className="mt-2 rounded-2xl bg-sun/20 px-3 py-2 text-sm font-bold text-navy/80">{nudge}</div>}
        <button onClick={btConfirmSplit} className="btn-primary mt-3 min-h-[52px] w-full px-5">This is my plan!</button>
      </div>
    </div>
  )
}

// R9 5.1: the GROCERY BASKET mini-game - grab foods (needs) and a treat or
// two (wants) within the food budget. Tummies first: at least 3 real foods.
function GroceryPanel() {
  const btGroceryDone = useGame((s) => s.btGroceryDone)
  const [picked, setPicked] = useState([])
  const cost = GROCERY_ITEMS.filter((i) => picked.includes(i.id)).reduce((v, i) => v + i.cost, 0)
  const foods = GROCERY_ITEMS.filter((i) => picked.includes(i.id) && i.need).length
  const toggle = (it) => {
    if (picked.includes(it.id)) setPicked(picked.filter((x) => x !== it.id))
    else if (cost + it.cost <= FOOD_BUDGET) setPicked([...picked, it.id])
  }
  const ready = foods >= MIN_FOODS
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-3 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="grocery-title" className="pop-in w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 id="grocery-title" className="text-sm font-extrabold uppercase tracking-wide text-electric">Fill the basket</h2>
          <div className="rounded-full bg-navy px-3 py-1 text-xs font-extrabold text-white">${cost} of ${FOOD_BUDGET}</div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GROCERY_ITEMS.map((it) => {
            const on = picked.includes(it.id)
            const full = !on && cost + it.cost > FOOD_BUDGET
            return (
              <button key={it.id} onClick={() => toggle(it)} disabled={full} aria-pressed={on}
                className={`rounded-2xl border-2 p-2.5 text-center transition active:scale-95 disabled:opacity-35 ${on ? (it.need ? 'border-teal bg-teal/10' : 'border-sun bg-sun/15') : 'border-navy/15 bg-navy/5'}`}>
                <div className="font-display text-sm font-extrabold text-navy">{it.name}</div>
                <div className="text-xs font-bold text-navy/60">${it.cost}</div>
                <div className={`mt-1 text-[10px] font-extrabold uppercase ${it.need ? 'text-teal' : 'text-[#b8860b]'}`}>{it.need ? 'Food' : 'Treat'}</div>
              </button>
            )
          })}
        </div>
        <div aria-live="polite" className={`mt-3 rounded-2xl px-3 py-2 text-sm font-bold leading-snug ${ready ? 'bg-teal/15 text-navy' : 'bg-sun/20 text-navy/80'}`}>
          {ready ? `${foods} foods and ${picked.length - foods} treat${picked.length - foods === 1 ? '' : 's'} - a smart basket!` : GROCERY_GATE}
        </div>
        <button disabled={!ready} onClick={() => btGroceryDone(picked)} className="btn-primary mt-3 min-h-[52px] w-full px-5 disabled:opacity-40">
          Check out (${cost})
        </button>
      </div>
    </div>
  )
}

export function BudgetPanel() {
  const bt = useGame((s) => s.bt)
  const btPanel = useGame((s) => s.btPanel)
  if (!bt || btPanel === null) return null
  if (btPanel === 'grocery') return <GroceryPanel />
  if (btPanel === 'options') return <OptionsPanel />
  if (btPanel === 'split') return <SplitPanel />
  return null
}
