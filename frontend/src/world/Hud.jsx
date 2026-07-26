import { useEffect, useRef, useState } from 'react'
import { useGame } from './store.js'
import { JARS } from './config.js'
import {
  BUNDLES, PROFIT_GOAL, HOURS_OPTIONS, QUALITY, SIGNS, WAGE_RATES,
  PRICE_MIN, PRICE_MAX, PRICE_STEP, PRICE_STEP_BIG,
} from '../scenarios/lemonade.js'
import { COMPANIES, COMPANY_IDS, totalValue, firstBuyPrice } from '../scenarios/moneyGarden.js'
import { weekSpec, TOTAL_WEEKS, COMPANY_CHOICE } from '../scenarios/marketScenarios.js'
import { LEARN, LIBRARY } from '../scenarios/learnLinks.js'
import { MuteButton } from '../components/MuteButton.jsx'
import { say } from '../services/speech.js'
import { BudgetPanel } from './BudgetPanels.jsx'
import { TrustMeter } from './BankPanels.jsx'

const JAR_LABEL = { spend: 'SPEND', save: 'SAVE', give: 'GIVE' }
const JAR_TEXT = { spend: 'text-electric', save: 'text-teal', give: 'text-brandpurple' }
const JAR_HEX = { spend: '#1464F0', save: '#00DCA0', give: '#7850F0' }
const LOGO = '/assets/tayu-logo.webp' // the new TAYU logo asset (A7)
// N1: UA sniffing alone missed some phones/tablets (the 'no two-finger hint on
// mobile' bug) - maxTouchPoints catches everything with a real touchscreen.
import { isTouch as IS_TOUCH } from './MobileControls.jsx'

function useCountUp(value) {
  const [shown, setShown] = useState(value)
  const raf = useRef()
  useEffect(() => {
    cancelAnimationFrame(raf.current)
    const start = shown, diff = value - start, t0 = performance.now(), dur = 500
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1)
      setShown(Math.round((start + diff * p) * 100) / 100)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return shown
}

const fmt = (n) => (Number.isInteger(n) ? `${n}` : n.toFixed(2))

// Week-1 jar chips (the jar lesson lives ONLY in Module 1 - comment 28).
// R10 v8 7.1: one-tap read-aloud on every message (early readers)
function SpeakButton({ text, dark = false }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return (
    <button
      aria-label="Read this out loud"
      onClick={(e) => { e.stopPropagation(); say(text) }}
      className={`mt-2 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-xs font-extrabold transition active:scale-95 ${dark ? 'bg-white/15 text-white' : 'bg-navy/10 text-navy'}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      Read aloud
    </button>
  )
}

function JarHud() {
  const alloc = useGame((s) => s.allocations)
  const mailboxOpened = useGame((s) => s.mailboxOpened)
  const week = useGame((s) => s.week)
  const spend = useCountUp(alloc.spend)
  const save = useCountUp(alloc.save)
  const give = useCountUp(alloc.give)
  if (week !== 1 || !mailboxOpened) return null
  const chips = [
    ['SPEND', spend, JAR_HEX.spend],
    ['SAVE', save, JAR_HEX.save],
    ['GIVE', give, JAR_HEX.give],
  ]
  return (
    <div className="absolute left-4 top-[4.5rem] flex flex-col gap-1.5">
      {chips.map(([label, val, hex]) => (
        <div key={label} className="glass--navy flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ borderColor: hex }}>
          <span className="text-xs font-extrabold tracking-wide" style={{ color: hex }}>{label}</span>
          <span className="text-base font-extrabold text-white">${fmt(val)}</span>
        </div>
      ))}
    </div>
  )
}

// The always-visible money readout for Weeks 2 and 3 (comments 33/28):
// ONE simple number - never make the player guess what they have.
function MoneyPill() {
  const week = useGame((s) => s.week)
  const save = useGame((s) => s.allocations.save)
  const mg = useGame((s) => s.mg)
  const bk = useGame((s) => s.bk)
  const real = week === 5 ? (mg ? totalValue(mg) : 0) : week === 4 && bk ? Math.round((bk.pocket + bk.gardenReserve + bk.bankAmount + bk.vault + bk.savings + bk.cd + bk.checking) * 100) / 100 : save
  const cash = useCountUp(real)
  // v9 3.2: the number going UP gets a little +$ pop - a score kids watch
  const prev = useRef(real)
  const [pop, setPop] = useState(null)
  useEffect(() => {
    const d = Math.round((real - prev.current) * 100) / 100
    prev.current = real
    if (d > 0) {
      const key = Date.now()
      setPop({ amt: d, key })
      const t = setTimeout(() => setPop((p) => (p?.key === key ? null : p)), 1400)
      return () => clearTimeout(t)
    }
  }, [real])
  if (week === 1) return null
  return (
    <div className="glass--navy absolute left-1/2 top-16 -translate-x-1/2 rounded-2xl px-5 py-2 text-lg font-extrabold text-white text-legible">
      Your Money: <span style={{ color: '#FFD700' }}>${fmt(cash)}</span>
      {pop && (
        <span key={pop.key} className="tayu-cash-pop" aria-hidden>+${fmt(pop.amt)}</span>
      )}
    </div>
  )
}

// I-4: the lesson card stays pinned on screen for the entire decision phase.
// R10 v8 M3: the live budget readout during the Budget Town day -
// what the day has cost so far and what is left, updating on every stop.
function DayBudgetBar() {
  const week = useGame((s) => s.week)
  const bt = useGame((s) => s.bt)
  const save = useGame((s) => s.allocations.save)
  if (week !== 3 || !bt || !['house', 'grocery', 'bus', 'clinic', 'fun'].includes(bt.stage)) return null
  const spent = Math.round((bt.needsSpent + bt.funSpent) * 100) / 100
  const total = bt.income
  const f = Math.min(1, spent / Math.max(1, total))
  return (
    <div className="glass--navy absolute right-4 top-[104px] w-48 rounded-2xl px-3 py-2 sm:top-16 sm:w-56">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold tracking-wide text-teal">TODAY</span>
        <span className="text-xs font-extrabold text-white">spent ${fmt(spent)} - left <span style={{ color: '#FFD700' }}>${fmt(save)}</span></span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f * 100}%`, background: 'linear-gradient(90deg,#1464F0,#00DCA0)' }} />
      </div>
    </div>
  )
}

function PinnedLesson() {
  const week = useGame((s) => s.week)
  const mg = useGame((s) => s.mg)
  if (week !== 5 || !mg || !['adjust', 'slider'].includes(mg.phase)) return null
  const spec = weekSpec(mg.week)
  return (
    <div className="pointer-events-none absolute left-1/2 top-[150px] z-[160] w-[min(92vw,26rem)] -translate-x-1/2 sm:top-28">
      <div className="rounded-2xl bg-white/95 px-4 py-2 text-center shadow-lg">
        <span className="text-sm font-extrabold text-electric">{spec.lesson}</span>
      </div>
    </div>
  )
}

// Week-3 progress: week number + growth toward the goal (E-II.2 pacing).
function SeedProgress() {
  const week = useGame((s) => s.week)
  const mg = useGame((s) => s.mg)
  if (week !== 5 || !mg) return null
  const total = totalValue(mg)
  const p = Math.min(1, total / mg.goal)
  return (
    <div className="glass--navy absolute right-4 top-[104px] w-44 rounded-2xl px-3 py-2 sm:top-16 sm:w-52">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-extrabold tracking-wide text-teal">WEEK {Math.min(mg.week, TOTAL_WEEKS)} of {TOTAL_WEEKS}</span>
        <span className="text-sm font-extrabold" style={{ color: '#FFD700' }}>${fmt(total)} / ${mg.goal}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p * 100}%`, background: 'linear-gradient(90deg,#00DCA0,#FFD700)' }} />
      </div>
    </div>
  )
}

// E-II.3 - the always-accessible Portfolio Panel + the docked adjust controls.
function DockedControls() {
  const mg = useGame((s) => s.mg)
  const week = useGame((s) => s.week)
  const cards = useGame((s) => s.cards)
  const dialog = useGame((s) => s.dialog)
  const panelPortfolio = useGame((s) => s.panelPortfolio)
  const openPortfolio = useGame((s) => s.openPortfolio)
  const startTheWeek = useGame((s) => s.startTheWeek)
  if (week !== 5 || !mg || mg.phase !== 'adjust' || cards.length > 0 || dialog || panelPortfolio) return null
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-5 z-[180] flex justify-center gap-3">
      <button onClick={openPortfolio} className="tayu-action-pulse min-h-[64px] rounded-2xl bg-white px-6 text-lg font-extrabold text-navy shadow-2xl transition active:scale-95">
        My Portfolio
      </button>
      <button onClick={startTheWeek} className="min-h-[64px] rounded-2xl bg-electric px-6 text-lg font-extrabold text-white shadow-2xl transition hover:bg-teal hover:text-navy active:scale-95">
        Start the Week
      </button>
    </div>
  )
}

function PortfolioPanel() {
  const open = useGame((s) => s.panelPortfolio)
  const mg = useGame((s) => s.mg)
  const close = useGame((s) => s.closePortfolio)
  const buy = useGame((s) => s.pfBuy)
  const sell = useGame((s) => s.pfSell)
  const pfBank = useGame((s) => s.pfBank)
  const pfPocket = useGame((s) => s.pfPocket)
  const cashOut = useGame((s) => s.pfCashOutAll)
  const [confirming, setConfirming] = useState(false)
  useEffect(() => { setConfirming(false) }, [open])
  if (!open || !mg) return null
  const holdings = COMPANY_IDS.reduce((v, id) => v + mg.companies[id].owned * mg.companies[id].price, 0)
  const total = Math.round(((mg.pocket || 0) + mg.cash + (mg.bank || 0) + holdings) * 100) / 100
  const toGo = Math.max(0, mg.goal - total)
  return (
    <div className="pointer-events-auto absolute inset-0 z-[290] flex items-end justify-center bg-navy/50 p-3 sm:items-center">
      <div className="pop-in w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-electric">My Portfolio</h2>
          <button onClick={close} className="rounded-xl bg-navy/10 px-4 py-2 text-sm font-extrabold text-navy active:scale-95">Close</button>
        </div>
        {/* H3/H6: pocket cushion + the persistent Bank Sprout, both liquid */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border-2 border-navy/15 p-3">
            <div className="font-extrabold text-navy">Pocket <span className="text-xs font-bold text-navy/50">(for surprises)</span></div>
            <div className="text-lg font-extrabold text-navy">${fmt(mg.pocket || 0)}</div>
            <div className="mt-1 flex gap-1">
              <button disabled={mg.cash < 1} onClick={() => pfPocket(1)} className="min-h-[40px] flex-1 rounded-lg bg-navy/10 text-xs font-extrabold text-navy active:scale-95 disabled:opacity-30">Tuck $1</button>
              <button disabled={(mg.pocket || 0) < 1} onClick={() => pfPocket(-1)} className="min-h-[40px] flex-1 rounded-lg bg-navy/10 text-xs font-extrabold text-navy active:scale-95 disabled:opacity-30">Take $1</button>
            </div>
          </div>
          <div className="rounded-2xl border-2 p-3" style={{ borderColor: '#1464F055' }}>
            <div className="font-extrabold text-navy">Bank Sprout <span className="text-xs font-bold text-electric">(slow + steady)</span></div>
            <div className="text-lg font-extrabold text-navy">${fmt(mg.bank || 0)}</div>
            <div className="mt-1 flex gap-1">
              <button disabled={mg.cash < 1} onClick={() => pfBank(1)} className="min-h-[40px] flex-1 rounded-lg bg-electric text-xs font-extrabold text-white active:scale-95 disabled:opacity-30">Put in $1</button>
              <button disabled={(mg.bank || 0) < 1} onClick={() => pfBank(-1)} className="min-h-[40px] flex-1 rounded-lg bg-navy/10 text-xs font-extrabold text-navy active:scale-95 disabled:opacity-30">Take $1</button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {COMPANY_IDS.map((id) => {
            const c = mg.companies[id]
            const spec = COMPANIES[id]
            const prev = c.history.length > 1 ? c.history[c.history.length - 2] : c.price
            return (
              <div key={id} className="rounded-2xl border-2 p-3" style={{ borderColor: spec.color + '55' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-navy">{spec.name}</span>
                    <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-extrabold" style={{ background: c.owned > 0 ? '#FFD700' : '#e5e7eb', color: '#071748' }}>You own: {c.owned}</span>
                  </div>
                  <span className="text-lg font-extrabold text-navy">
                    ${c.price}
                    <span className="ml-1 text-sm" style={{ color: c.price > prev ? '#16a34a' : c.price < prev ? '#ea580c' : '#9ca3af' }}>{c.price > prev ? 'up' : c.price < prev ? 'down' : 'flat'}</span>
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs font-semibold text-navy/60">
                  <span>Worth ${c.owned * c.price}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button disabled={mg.cash < c.price} onClick={() => buy(id)}
                    className="min-h-[52px] flex-1 rounded-xl bg-electric text-base font-extrabold text-white transition active:scale-95 disabled:opacity-35">
                    Buy 1: ${c.price}
                  </button>
                  <button disabled={c.owned <= 0} onClick={() => sell(id)}
                    className="min-h-[52px] flex-1 rounded-xl bg-navy/10 text-base font-extrabold text-navy transition active:scale-95 disabled:opacity-35">
                    Sell 1: get ${c.price}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-3 rounded-2xl bg-navy p-3 text-center text-white">
          <span className="text-sm font-bold">Your money: </span>
          <span className="text-lg font-extrabold" style={{ color: '#FFD700' }}>${fmt(total)}</span>
          <span className="ml-2 text-xs text-white/60">(${fmt(mg.cash)} ready to plant)</span>
          <span className="ml-2 text-xs text-white/60">{toGo > 0 ? `$${fmt(toGo)} to the goal` : 'GOAL REACHED!'}</span>
        </div>
        {holdings > 0 && (
          confirming ? (
            <div className="mt-2 flex gap-2">
              <button onClick={() => { cashOut(); setConfirming(false) }} className="min-h-[52px] flex-1 rounded-xl bg-[#ea580c] text-base font-extrabold text-white active:scale-95">Yes, sell all for ${fmt(holdings)}</button>
              <button onClick={() => setConfirming(false)} className="min-h-[52px] flex-1 rounded-xl bg-navy/10 text-base font-extrabold text-navy active:scale-95">Keep my seeds</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="mt-2 min-h-[52px] w-full rounded-xl bg-navy/10 text-base font-extrabold text-navy active:scale-95">
              Cash Out All
            </button>
          )
        )}
      </div>
    </div>
  )
}

// THE sequential bottom sheet (G2/F6): renders exactly ONE card at a time.
// Every instructional beat in the Money Garden flows through here.
function BottomSheet() {
  const card = useGame((s) => s.cards[0])
  const dialog = useGame((s) => s.dialog)
  const act = useGame((s) => s.cardAct)
  const setToast = useGame((s) => s.setToast)
  useEffect(() => {
    if (!card) return
    const t = setTimeout(() => setToast('Take your time! Tap a button when you are ready.'), 20000)
    return () => clearTimeout(t)
  }, [card, setToast])
  if (!card || dialog) return null
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-[92px] z-[320] flex max-h-[calc(100vh-108px)] justify-center overflow-y-auto p-4">
      <div className="pop-in w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        {card.speaker && <div className="text-sm font-extrabold uppercase tracking-wide text-electric">{card.speaker}</div>}
        <p className="mt-1 text-xl font-bold leading-snug text-navy">{card.text}</p>
        {card.nums && <p className="mt-2 rounded-xl bg-navy/5 px-3 py-1.5 text-sm font-extrabold text-navy/80">{card.nums}</p>}
        {card.nudge && <p className="mt-1 text-sm font-semibold text-electric">{card.nudge}</p>}
        {card.bars && (
          <div className="mt-2 rounded-xl bg-navy/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-16 text-[11px] font-extrabold text-navy/60">Price</span>
              <div className="h-4 rounded bg-electric" style={{ width: `${card.bars.price * 28}px` }} />
              <span className="text-xs font-extrabold text-navy">${card.bars.price}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="w-16 text-[11px] font-extrabold text-navy/60">Pay back</span>
              <div className="flex h-4 overflow-hidden rounded">
                <div className="bg-electric" style={{ width: `${card.bars.price * 28}px` }} />
                <div className="bg-brandpurple" style={{ width: `${card.bars.extra * 28}px` }} />
              </div>
              <span className="text-xs font-extrabold text-navy">${card.bars.price + card.bars.extra} <span className="text-brandpurple">(+${card.bars.extra} extra)</span></span>
            </div>
          </div>
        )}
        {card.pie && (() => {
          const total = Math.max(1, card.pie.pocket + card.pie.bank + card.pie.garden)
          const cols = { pocket: '#9aa6b8', bank: '#1464F0', garden: '#00b37f' }
          let acc = 0
          const grad = ['pocket', 'bank', 'garden'].map((id) => {
            const from = acc; acc += (card.pie[id] || 0) / total
            return `${cols[id]} ${Math.round(from * 360)}deg ${Math.round(acc * 360)}deg`
          }).join(', ')
          return <div className="mx-auto mt-2 h-20 w-20 rounded-full" style={{ background: `conic-gradient(${grad})` }} />
        })()}
        {card.learn && LEARN[card.learn] && (
          <a href={LEARN[card.learn].url} target="_blank" rel="noreferrer"
            className="mt-2 block rounded-xl bg-electric/10 px-3 py-2 text-center text-xs font-extrabold text-electric active:scale-95">
            Learn More: {LEARN[card.learn].label}
          </a>
        )}
        <SpeakButton text={[card.speaker, card.text, card.nums, card.nudge].filter(Boolean).join('. ')} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {card.buttons.map((b, i) => (
            <button
              key={i}
              disabled={b.disabled}
              onClick={() => act(b.act)}
              className={`min-h-[64px] rounded-2xl px-6 text-lg font-extrabold transition active:scale-95 disabled:opacity-35 ${i === 0 ? 'bg-electric text-white hover:bg-teal hover:text-navy' : 'bg-navy/10 text-navy hover:bg-navy/20'}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// The Harvest Summary (F13) - one calm card, the emotional payoff.
function HarvestSummary() {
  const mgPhase = useGame((s) => s.mgPhase)
  const mg = useGame((s) => s.mg)
  const act = useGame((s) => s.cardAct)
  const finish = useCountUp(mg && mgPhase === 'summary' ? totalValue(mg) : 0)
  if (mgPhase !== 'summary' || !mg) return null
  const everOwned = COMPANY_IDS.filter((id) => mg.buys.some((b) => b.c === id))
  const followed = (mg.weekLog || []).filter((w) => w.judged).length
  const played = (mg.weekLog || []).length
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="pop-in w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl">
        <div className="text-sm font-extrabold uppercase tracking-wide text-electric">Mr. Sprout</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">Your Money Garden</h2>
        <div className="mt-4 flex items-end justify-center gap-8 rounded-2xl bg-[#e9f2e0] p-4" style={{ minHeight: 120 }}>
          {everOwned.length === 0 && <p className="text-navy/60">A quiet garden this time.</p>}
          {everOwned.map((id) => {
            const c = mg.companies[id]
            const bought = firstBuyPrice(mg, id)
            const grew = c.price >= bought
            const h = 34 + Math.max(0, Math.min(60, (c.price - COMPANIES[id].min) / (COMPANIES[id].max - COMPANIES[id].min) * 60))
            return (
              <div key={id} className="flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5">
                  <div style={{ width: 10, height: h, background: '#3f9a42', borderRadius: 6 }} />
                  <div style={{ width: 16, height: 12, background: grew ? '#5fa84a' : '#a9b26a', borderRadius: '50%' }} />
                </div>
                <div style={{ width: 34, height: 14, background: '#b06a3a', borderRadius: '0 0 8px 8px' }} />
                <span className="text-[11px] font-bold text-navy">{COMPANIES[id].name}</span>
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-lg font-extrabold text-navy">
          You started with ${fmt(mg.startTotal)} <span className="text-electric">→</span> You finished with <span style={{ color: '#b8860b' }}>${fmt(finish)}</span>
        </p>
        <p className="mt-1 text-sm font-bold text-navy/70">
          {played} weeks in the garden. You followed {followed} of {played} lessons - every one was a DECISION, not luck.
        </p>
        <SpeakButton text={`You started with $${fmt(mg.startTotal)} and finished with $${fmt(totalValue(mg))}. ${played} weeks in the garden.`} />
        <button className="btn-primary mt-4 min-h-[64px] w-full text-xl" onClick={() => act('mg.finish')}>Finish</button>
      </div>
    </div>
  )
}

// ---- Round 8 Part 4: the SEED PIE - split garden money across companies ----
// Teaches HOW to choose (busy store / news / steady-vs-wiggly), never random.
function SeedPiePanel() {
  const mg = useGame((s) => s.mg)
  const week = useGame((s) => s.week)
  const plantSeeds = useGame((s) => s.plantSeeds)
  const [alloc, setAlloc] = useState(null)
  const [picked, setPicked] = useState(null)
  useEffect(() => { setAlloc(null); setPicked(null) }, [mg?.phase])
  if (week !== 5 || !mg || mg.phase !== 'slider' || weekSpec(mg.week).special !== 'seeds') return null
  const cash = Math.floor(mg.cash)
  const base = Math.floor(cash / 3)
  const a = alloc || { toy: base, snack: base, game: cash - 2 * base }
  const used = a.toy + a.snack + a.game
  const left = cash - used
  const bump = (id, d) => {
    const v = Math.max(0, a[id] + d)
    if (d > 0 && left <= 0) return
    setAlloc({ ...a, [id]: v })
    setPicked(id)
  }
  let acc = 0
  const grad = COMPANY_IDS.map((id) => {
    const from = acc; acc += (a[id] || 0) / Math.max(1, used || 1)
    return `${COMPANIES[id].color} ${Math.round(from * 360)}deg ${Math.round(acc * 360)}deg`
  }).join(', ')
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-3 backdrop-blur-sm">
      <div className="pop-in max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="text-sm font-extrabold uppercase tracking-wide text-electric">Choose your seeds</div>
        <p className="mt-1 text-sm font-bold leading-snug text-navy/75">{COMPANY_CHOICE.prompt}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            {COMPANY_IDS.map((id) => (
              <div key={id} className="flex items-center justify-between rounded-2xl bg-navy/5 px-3 py-2">
                <button onClick={() => setPicked(id)} className="text-left text-sm font-extrabold active:scale-95" style={{ color: COMPANIES[id].color }}>
                  {COMPANIES[id].name}
                </button>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => bump(id, -1)} className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 font-display text-lg font-extrabold text-navy active:scale-90">-</button>
                  <div className="w-10 text-center font-display text-base font-extrabold text-navy">${a[id]}</div>
                  <button onClick={() => bump(id, +1)} className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 font-display text-lg font-extrabold text-navy active:scale-90">+</button>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-navy/5 px-3 py-2 text-xs font-extrabold text-navy/60">Garden cash kept aside: ${left}</div>
          </div>
          <div className="grid place-items-center">
            <div className="h-32 w-32 rounded-full shadow-inner transition-all duration-500"
              style={{ background: used > 0 ? `conic-gradient(${grad})` : '#e5e7eb' }} />
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {COMPANY_IDS.map((id) => (
                <button key={id} onClick={() => setPicked(id)} onMouseEnter={() => setPicked(id)}
                  className={`rounded-xl px-2 py-1 text-[11px] font-extrabold text-white active:scale-95 ${picked === id ? 'ring-2 ring-navy' : ''}`}
                  style={{ background: COMPANIES[id].color }}>
                  {Math.round(((a[id] || 0) / Math.max(1, used || 1)) * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 min-h-[52px] rounded-2xl bg-navy/5 px-3 py-2 text-sm font-bold leading-snug text-navy/80">
          {picked ? COMPANY_CHOICE.lines[picked] : 'Tap a company to hear its story.'}
        </div>
        <p className="mt-2 rounded-2xl bg-sun/20 px-3 py-2 text-xs font-bold leading-snug text-navy/80">{COMPANY_CHOICE.closing}</p>
        {LEARN.stocks && (
          <a href={LEARN.stocks.url} target="_blank" rel="noreferrer"
            className="mt-2 block rounded-xl bg-electric/10 px-3 py-2 text-center text-xs font-extrabold text-electric active:scale-95">
            Learn More: {LEARN.stocks.label}
          </a>
        )}
        <button disabled={used <= 0} className="btn-primary mt-3 min-h-[56px] w-full text-lg disabled:opacity-40" onClick={() => plantSeeds(a)}>
          Plant my seeds!
        </button>
      </div>
    </div>
  )
}

// ---- WEEK 1 PANELS (restored) ----

// The slide-up jar panel: pick an amount, coins fly to the jar (Week 1).
function JarPanel() {
  const jar = useGame((s) => s.panelJar)
  const wallet = useGame((s) => s.wallet)
  const allocate = useGame((s) => s.allocate)
  const close = useGame((s) => s.closePanel)
  const [amt, setAmt] = useState(1)
  useEffect(() => { setAmt(Math.min(5, Math.max(1, wallet))) }, [jar, wallet])
  if (!jar) return null
  const pos = JARS[jar]
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[300] flex justify-center p-3">
      <div className="pop-in w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          {/* the jar name chip - white bg, navy text, jar-color border */}
          <span className="rounded-2xl border-4 bg-white px-4 py-1.5 font-display text-lg font-extrabold text-navy" style={{ borderColor: JAR_HEX[jar] }}>
            {JAR_LABEL[jar]} jar
          </span>
          <span className="text-sm font-bold text-navy/60">In your hand: <b style={{ color: '#FFD700' }}>${fmt(wallet)}</b></span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-3">
          <button className="h-12 w-12 rounded-full bg-navy/10 text-2xl font-bold text-navy active:scale-95" onClick={() => setAmt(Math.max(1, amt - 1))}>-</button>
          <div className="w-20 text-center text-3xl font-extrabold text-navy">${amt}</div>
          <button className="h-12 w-12 rounded-full bg-electric text-2xl font-bold text-white active:scale-95" onClick={() => setAmt(Math.min(wallet, amt + 1))}>+</button>
          <button className="min-h-[44px] rounded-xl bg-navy/10 px-3 text-sm font-extrabold text-navy active:scale-95" onClick={() => setAmt(wallet)}>All ${fmt(wallet)}</button>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="min-h-[56px] flex-1 rounded-2xl bg-navy/10 text-lg font-extrabold text-navy active:scale-95" onClick={close}>Cancel</button>
          <button className="min-h-[56px] flex-1 rounded-2xl bg-electric text-lg font-extrabold text-white active:scale-95 disabled:opacity-40" disabled={wallet < 1}
            onClick={() => allocate(jar, amt, [pos[0], 0, pos[1]])}>
            Put in ${amt}
          </button>
        </div>
      </div>
    </div>
  )
}

// The NPC speech bubble - name, one line at a time, Next / Got it!
function DialogPanel() {
  const dialog = useGame((s) => s.dialog)
  const advance = useGame((s) => s.advanceDialog)
  if (!dialog) return null
  const last = dialog.index + 1 >= dialog.lines.length
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-[92px] z-[300] flex max-h-[calc(100vh-108px)] justify-center overflow-y-auto p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="tayu-dialog-speaker" aria-describedby="tayu-dialog-line" className="pop-in w-full max-w-lg rounded-3xl border-4 border-teal bg-white p-5 shadow-2xl">
        <div id="tayu-dialog-speaker" className="text-sm font-extrabold uppercase tracking-wide text-electric">{dialog.name}</div>
        <p id="tayu-dialog-line" className="mt-1 text-xl font-bold leading-snug text-navy">{dialog.lines[dialog.index]}</p>
        <SpeakButton text={dialog.lines[dialog.index]} />
        <div className="mt-3 flex justify-end">
          <button className="min-h-[56px] rounded-2xl bg-electric px-8 text-lg font-extrabold text-white transition hover:bg-teal hover:text-navy active:scale-95" onClick={advance}>
            {last ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Penny's small auto guide bubble (short-lived, non-blocking).
function GuideBubble() {
  const guide = useGame((s) => s.guide)
  if (!guide) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-32 z-[150] flex justify-center px-4">
      <div className="pop-in max-w-md rounded-2xl border-2 border-teal bg-white px-4 py-2 text-sm font-bold text-navy shadow-lg">
        Penny: {guide.line}
      </div>
    </div>
  )
}

// The market product card - item, need/want tag, price, Buy.
function ProductPanel() {
  const item = useGame((s) => s.panelItem)
  const spend = useGame((s) => s.allocations.spend)
  const buy = useGame((s) => s.buyItem)
  const close = useGame((s) => s.closeItem)
  if (!item) return null
  const afford = spend >= item.price
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="pop-in w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="text-5xl">{item.emoji}</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-navy">{item.name}</h2>
        <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-extrabold ${item.type === 'need' ? 'bg-teal/20 text-teal' : 'bg-brandpurple/15 text-brandpurple'}`}>
          {item.type === 'need' ? 'NEED' : 'WANT'}
        </span>
        <p className="mt-2 text-sm font-bold text-navy/60">Your SPEND jar: ${fmt(spend)}</p>
        <div className="mt-4 flex gap-2">
          <button className="min-h-[56px] flex-1 rounded-2xl bg-navy/10 text-lg font-extrabold text-navy active:scale-95" onClick={close}>Cancel</button>
          <button className="min-h-[56px] flex-1 rounded-2xl bg-electric text-lg font-extrabold text-white active:scale-95 disabled:opacity-40" disabled={!afford} onClick={() => buy(item)}>
            {afford ? `Buy ($${item.price})` : 'Not enough'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- WEEK 2 PANELS (Lemonade v4) ----

function RecapPanel() {
  const lemPhase = useGame((s) => s.lemPhase)
  const save = useGame((s) => s.allocations.save)
  const done = useGame((s) => s.recapDone)
  if (lemPhase !== 'recap') return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="glass--navy pop-in w-full max-w-md p-7 text-center">
        <img src={LOGO} alt="" className="mx-auto h-14 w-14 rounded-2xl logo-breathe" />
        <h2 className="mt-2 font-display text-2xl font-extrabold text-teal text-legible">Module 2: Your Lemonade Stand</h2>
        <p className="mt-2 text-white/85">Here is your money from last week:</p>
        <div className="mt-3 rounded-2xl bg-white/5 p-4">
          <div className="text-3xl font-extrabold" style={{ color: '#FFD700' }}>${fmt(save)}</div>
          <div className="text-xs text-white/50">Your Money</div>
        </div>
        <p className="mt-3 text-sm text-white/70">Earn <b style={{ color: '#FFD700' }}>${PROFIT_GOAL} of profit</b> to cash out and become a Lemonade Tycoon!</p>
        <button className="btn-primary mt-5 min-h-[56px]" onClick={done}>Let's go!</button>
      </div>
    </div>
  )
}

// G6: town news only appears once the events feature has unlocked.
function EventBanner() {
  const ev = useGame((st) => st.lemEvent)
  const features = useGame((st) => st.lemFeatures)
  if (!ev || features < 3) return null
  return (
    <div className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white/90">
      TOWN NEWS: {ev.line}
    </div>
  )
}

function SupplyPanel() {
  const lemPhase = useGame((s) => s.lemPhase)
  const save = useGame((s) => s.allocations.save)
  const round = useGame((s) => s.lemRound)
  const choose = useGame((s) => s.chooseBundle)
  if (lemPhase !== 'supplies') return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="glass--navy pop-in w-full max-w-md p-6 text-center">
        <h2 className="font-display text-xl font-extrabold text-teal text-legible">Buy Supplies: Week {round}</h2>
        <EventBanner />
        <p className="mt-1 text-sm text-white/75">Your money: <b style={{ color: '#FFD700' }}>${fmt(save)}</b> (supplies include cups, lemons, sugar, water, and the table)</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {BUNDLES.map((b) => {
            const ok = save >= b.cost
            return (
              <button key={b.id} disabled={!ok} onClick={() => choose(b.id)}
                className="flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 border-white/25 bg-white/10 px-3 py-2 transition hover:bg-white/20 active:scale-95 disabled:opacity-35">
                <div className="text-lg font-extrabold text-white">{b.label}: ${b.cost}</div>
                <div className="text-xs font-semibold text-white/70">{b.cups} cups{ok ? '' : ' (locked)'}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// A row of small selectable chips - one lever, one row.
function LeverChips({ label, options, value, onPick, render }) {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span className="w-20 shrink-0 text-left text-xs font-bold text-white/70">{label}</span>
      <div className="flex flex-1 flex-wrap justify-end gap-1.5">
        {options.map((o) => {
          const id = o.id ?? o
          const active = (value?.id ?? value) === id
          return (
            <button key={id} onClick={() => onPick(id)}
              className={`min-h-[40px] rounded-xl px-2.5 text-sm font-extrabold transition active:scale-95 ${active ? 'bg-electric text-white' : 'bg-white/10 text-white/70'}`}>
              {render(o)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CostTemplatePanel() {
  const lemPhase = useGame((s) => s.lemPhase)
  const bundle = useGame((s) => s.lemBundle)
  const price = useGame((s) => s.lemPrice)
  const hours = useGame((s) => s.lemHours)
  const quality = useGame((s) => s.lemQuality)
  const sign = useGame((s) => s.lemSign)
  const wageRate = useGame((s) => s.lemWageRate)
  const features = useGame((s) => s.lemFeatures)
  const save = useGame((s) => s.allocations.save)
  const setPrice = useGame((s) => s.setLemPrice)
  const setHours = useGame((s) => s.setLemHours)
  const setQuality = useGame((s) => s.setLemQuality)
  const setSign = useGame((s) => s.setLemSign)
  const setWageRate = useGame((s) => s.setLemWageRate)
  const showFormula = useGame((s) => s.showFormula)
  const confirm = useGame((s) => s.confirmPrice)
  if (lemPhase !== 'template' || !bundle) return null
  // A3: the breakdown the player can actually USE - supplies + wage + per-cup
  const suppliesCost = bundle.cost + quality.addPerCup * bundle.cups + sign.cost
  const wages = wageRate * hours
  const totalCost = suppliesCost + wages
  const cpc = totalCost / bundle.cups
  const extras = quality.addPerCup * bundle.cups + sign.cost
  const canAfford = save >= Math.max(0, extras)
  const bump = (d) => setPrice(price === null ? 1 : Math.max(PRICE_MIN, Math.min(PRICE_MAX, price + d)))
  const Row = ({ label, val, strong, color }) => (
    <div className={`flex items-center justify-between rounded-lg px-3 py-1 ${strong ? 'bg-white/10' : ''}`}>
      <span className={`text-xs ${strong ? 'font-extrabold text-white' : 'font-semibold text-white/80'}`}>{label}</span>
      <span className="text-xs font-extrabold" style={{ color: color || '#fff' }}>{val}</span>
    </div>
  )
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="glass--navy pop-in max-h-[92vh] w-full max-w-md overflow-y-auto p-5">
        <h2 className="text-center font-display text-lg font-extrabold text-teal text-legible">MY LEMONADE STAND</h2>
        <EventBanner />
        <LeverChips label="Open hours" options={HOURS_OPTIONS} value={hours} onPick={setHours} render={(h) => `${h}h`} />
        <LeverChips label="My pay" options={WAGE_RATES} value={wageRate} onPick={setWageRate} render={(w) => `$${w}/h`} />
        {features >= 1 && (
          <LeverChips label="Recipe" options={QUALITY} value={quality} onPick={setQuality}
            render={(q) => q.addPerCup > 0 ? `${q.label} +$${q.addPerCup.toFixed(2)}/cup` : q.addPerCup < 0 ? `${q.label} -$${Math.abs(q.addPerCup).toFixed(2)}/cup` : q.label} />
        )}
        {features >= 2 && (
          <LeverChips label="Sign" options={SIGNS} value={sign} onPick={setSign}
            render={(g) => g.cost ? `${g.label} $${g.cost}` : g.label} />
        )}
        {/* A1/A3: the usable cost breakdown - wage line included, per-cup shown */}
        <div className="mt-3 flex flex-col gap-0.5">
          <Row label={`Supplies (${bundle.cups} cups' worth)`} val={`$${suppliesCost.toFixed(2)}`} />
          <Row label={`Your work (${hours}h at $${wageRate}/h)`} val={`$${wages.toFixed(2)}`} />
          <Row label="Total cost" val={`$${totalCost.toFixed(2)}`} strong />
          <Row label={`Cost per cup ($${totalCost.toFixed(2)} / ${bundle.cups} cups)`} val={`$${cpc.toFixed(2)}`} strong color="#FFD700" />
          <Row label="Town tax" val="10% of PROFIT" />
        </div>
        <div className="mt-3 rounded-2xl bg-white/5 p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-bold text-white/80">MY PRICE PER CUP</span>
            <button onClick={() => showFormula()} className="rounded-full bg-teal px-2.5 py-0.5 text-xs font-extrabold text-navy active:scale-95">How do I pick?</button>
          </div>
          <div className="mt-1 flex items-center justify-center gap-2">
            <button className="h-11 w-14 rounded-xl bg-white/15 text-sm font-bold active:scale-95" onClick={() => bump(-PRICE_STEP_BIG)}>-25¢</button>
            <button className="h-11 w-12 rounded-xl bg-white/10 text-xs font-bold active:scale-95" onClick={() => bump(-PRICE_STEP)}>-5¢</button>
            <div className="w-24 text-3xl font-extrabold" style={{ color: price === null ? '#8ea0c8' : '#FFD700' }}>
              {price === null ? '$ -' : `$${price.toFixed(2)}`}
            </div>
            <button className="h-11 w-12 rounded-xl bg-white/10 text-xs font-bold active:scale-95" onClick={() => bump(PRICE_STEP)}>+5¢</button>
            <button className="h-11 w-14 rounded-xl bg-electric text-sm font-bold text-white active:scale-95" onClick={() => bump(PRICE_STEP_BIG)}>+25¢</button>
          </div>
          {price === null && <div className="mt-1 text-xs font-bold text-teal">Use the formula to pick your own price!</div>}
        </div>
        {!canAfford && <p className="mt-2 text-center text-xs font-bold text-red-300">Not enough money for those extras - pick cheaper options.</p>}
        <button className="btn-primary mt-3 min-h-[60px] w-full text-xl disabled:opacity-40" disabled={!canAfford || price === null} onClick={confirm}>Open for business!</button>
      </div>
    </div>
  )
}

function PoolPanel() {
  const lemPhase = useGame((s) => s.lemPhase)
  const choose = useGame((s) => s.poolChoice)
  if (lemPhase !== 'pool') return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="glass--navy pop-in w-full max-w-md p-6 text-center">
        <h2 className="font-display text-xl font-extrabold text-teal text-legible">Theo: "Pool party, right now!"</h2>
        <p className="mt-1 text-sm text-white/70">It is during your selling hours. What do you choose?</p>
        <div className="mt-4 flex flex-col gap-2">
          <button onClick={() => choose('work')} className="min-h-[64px] rounded-2xl border-2 border-white/25 bg-white/10 px-4 py-3 text-lg font-extrabold text-white transition hover:bg-white/20 active:scale-95">Work the stand</button>
          <button onClick={() => choose('pool')} className="min-h-[64px] rounded-2xl border-2 border-white/25 bg-white/10 px-4 py-3 text-lg font-extrabold text-white transition hover:bg-white/20 active:scale-95">Go to the pool</button>
        </div>
      </div>
    </div>
  )
}

// The calm end-of-week sequence: recap -> results (A1/G4 order) -> goal ->
// ONE direct tip (G5).
function WeekEndCards({ playerName }) {
  const lemPhase = useGame((s) => s.lemPhase)
  const r = useGame((s) => s.lemResult)
  const cum = useGame((s) => s.lemCumProfit)
  const save = useGame((s) => s.allocations.save)
  const tip = useGame((s) => s.lemTip)
  const next = useGame((s) => s.lemNext)
  if (!r || !['recapCard', 'results', 'goalCard', 'tipCard'].includes(lemPhase)) return null

  const Shell = ({ title, children, cta = 'Continue', learn = null }) => (
    <div className="pointer-events-auto absolute inset-0 z-[300] flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="pop-in w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
        <h2 className="font-display text-xl font-extrabold text-electric">{title}</h2>
        <div className="mt-3">{children}</div>
        {learn && LEARN[learn] && (
          <a href={LEARN[learn].url} target="_blank" rel="noreferrer"
            className="mt-3 block rounded-xl bg-electric/10 px-3 py-2 text-center text-xs font-extrabold text-electric active:scale-95">
            Learn More: {LEARN[learn].label}
          </a>
        )}
        <button className="btn-primary mt-5 min-h-[64px] w-full text-xl" onClick={next}>{cta}</button>
      </div>
    </div>
  )

  if (lemPhase === 'recapCard') {
    return (
      <Shell title={`Week ${r.round} is done!`}>
        <p className="text-lg font-semibold text-navy">
          {r.sold > 0
            ? `Nice work, ${playerName}! ${r.sold} kids bought your lemonade at $${r.price.toFixed(2)} a cup.`
            : `A quiet day. Nobody bought at $${r.price.toFixed(2)}. Every seller has days like this.`}
        </p>
      </Shell>
    )
  }
  if (lemPhase === 'results') {
    const Row = ({ label, val, strong, color }) => (
      <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-left ${strong ? 'bg-navy/5' : ''}`}>
        <span className={`text-sm ${strong ? 'font-extrabold text-navy' : 'font-semibold text-navy/70'}`}>{label}</span>
        <span className="text-sm font-extrabold" style={{ color: color || '#071748' }}>{val}</span>
      </div>
    )
    // A1/G4 ORDER, always: Revenue -> Supplies -> Your pay -> Profit -> Tax -> You keep
    return (
      <Shell title="Your results" learn="earn">
        <div className="flex flex-col gap-1">
          <Row label={`You sold ${r.sold} cups${r.missed > 0 ? ` (${r.missed} turned away!)` : r.leftover > 0 ? ` (${r.leftover} left over)` : ''}`} val={`$${r.revenue.toFixed(2)}`} color="#b8860b" />
          <Row label="Supplies" val={`-$${r.supplies.toFixed(2)}`} />
          <Row label="Your pay (your work!)" val={`-$${r.wages.toFixed(2)}`} />
          <Row label="Profit" val={`${r.profit >= 0 ? '' : '-'}$${Math.abs(r.profit).toFixed(2)}`} strong color={r.profit > 0 ? '#16a34a' : '#dc2626'} />
          <Row label="Tax (10% of profit)" val={`-$${r.tax.toFixed(2)}`} />
          <Row label="You keep" val={`${r.keep >= 0 ? '' : '-'}$${Math.abs(r.keep).toFixed(2)}!`} strong color={r.keep > 0 ? '#16a34a' : '#dc2626'} />
        </div>
      </Shell>
    )
  }
  if (lemPhase === 'goalCard') {
    const toGo = Math.max(0, PROFIT_GOAL - cum)
    return (
      <Shell title="Your goal" learn="business">
        <p className="text-2xl font-extrabold text-navy">
          Goal: ${PROFIT_GOAL}. You have <span style={{ color: '#b8860b' }}>${fmt(cum)}</span>{toGo > 0 ? `, $${fmt(toGo)} to go!` : '. DONE!'}
        </p>
        <div className="mx-auto mt-3 h-3 w-full overflow-hidden rounded-full bg-navy/10">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (cum / PROFIT_GOAL) * 100)}%`, background: 'linear-gradient(90deg,#f5c542,#FFD700)' }} />
        </div>
        <p className="mt-3 text-sm font-semibold text-navy/70">Money on hand: ${fmt(save)}</p>
      </Shell>
    )
  }
  // tipCard - ONE direct change to make (G5)
  return (
    <Shell title="What to change next week" cta="Start next week">
      <p className="text-lg font-semibold text-navy">{tip || 'Keep going!'}</p>
    </Shell>
  )
}

function Banner() {
  const banner = useGame((s) => s.banner)
  if (!banner) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-[200] flex justify-center">
      <div className="tayu-btn-glass pop-in flex items-center gap-3 text-2xl" style={{ cursor: 'default' }}>
        <img src={LOGO} alt="" className="h-8 w-8 rounded-md" />
        <span className="font-extrabold tracking-wide">{banner}</span>
      </div>
    </div>
  )
}

function TintOverlay() {
  // R12 5.2: Dev killed the full-screen color washes - outcomes now read on
  // the CHARACTERS (emotes, bubbles, NPC walk-ups), never as a screen flash.
  return null
}

function SunSweep() {
  const sunKey = useGame((s) => s.sunKey)
  if (!sunKey) return null
  return <div key={sunKey} className="tayu-sun" />
}

function Confetti() {
  const pieces = Array.from({ length: 120 }, (_, i) => i)
  const colors = ['#1464F0', '#00DCA0', '#7850F0', '#FFD700', '#ffffff']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const left = (i * 137.5) % 100
        const delay = (i % 20) * 0.12
        const dur = 2.4 + ((i * 7) % 18) / 10
        const size = 6 + (i % 5) * 3
        return (
          <span key={i} style={{ position: 'absolute', top: '-20px', left: `${left}%`, width: size, height: size * 0.6, background: colors[i % colors.length], borderRadius: 2, animation: `tayu-fall ${dur}s linear ${delay}s infinite` }} />
        )
      })}
    </div>
  )
}

// The learning pointer card - strictly one at a time, never over a dialog or
// decision card (G2). Big text (comment 20).
function LessonCard() {
  const lesson = useGame((s) => s.lessons[0])
  const dialog = useGame((s) => s.dialog)
  const cards = useGame((s) => s.cards)
  const dismiss = useGame((s) => s.dismissLesson)
  if (!lesson || dialog || cards.length > 0) return null
  // R10 v8 P1: SOFT pointers (the opening tour) never hijack the screen -
  // the '?' menu and tabs stay live; the tip sits low and dismisses on tap.
  if (lesson.soft) {
    return (
      <div className="pointer-events-none absolute inset-x-0 z-[240] flex justify-center px-4" style={{ bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
        <div role="status" aria-live="polite" className="glass--navy pop-in pointer-events-auto max-w-md p-4 text-center">
          <p className="text-base font-bold leading-snug text-white text-legible">{lesson.text}</p>
          <button className="btn-primary mt-2 min-h-[44px] px-4 text-sm" onClick={dismiss}>Got it!</button>
        </div>
      </div>
    )
  }
  return (
    // Keep lessons above decision panels so contextual help is visible as soon
    // as it is requested instead of waiting for the underlying panel to close.
    <div className="pointer-events-auto absolute inset-0 z-[330] flex items-end justify-center bg-navy/20 p-6 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="tayu-lesson-title" className="glass--navy pop-in w-full max-w-md p-7 text-center">
        <img src={LOGO} alt="" className="mx-auto h-12 w-12 rounded-xl logo-breathe" />
        <p id="tayu-lesson-title" className="mt-3 text-2xl font-bold leading-snug text-white text-legible">{lesson.text}</p>
        {lesson.learn && LEARN[lesson.learn] && (
          <a href={LEARN[lesson.learn].url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
            className="mt-2 block rounded-xl bg-white/15 px-3 py-2 text-center text-xs font-extrabold text-teal active:scale-95">
            Learn More: {LEARN[lesson.learn].label}
          </a>
        )}
        <SpeakButton text={lesson.text} dark />
        <button className="btn-primary mt-4 min-h-[56px] text-lg" onClick={dismiss}>Got it!</button>
      </div>
    </div>
  )
}

// ROUND 8 (7.2): the '?' menu has THREE tabs - CONTROLS (biggest, first,
// most prominent), PHASES (the journey in the new story order), and LIBRARY
// (every Learn More resource, organized by module). Shown once at entry.
const PHASES = [
  { n: 1, title: 'The Market', desc: 'Split your allowance into jars, then shop for needs and wants.' },
  { n: 2, title: 'The Lemonade Stand', desc: 'EARN it: run a real little business - supplies, price, profit.' },
  { n: 3, title: 'Budget Town', desc: 'BUDGET it: split your money - pocket, bank, and garden.' },
  { n: 4, title: 'The Bank', desc: 'BANK it: accounts, cards, debt, scams, and your trust score.' },
  { n: 5, title: 'The Money Garden', desc: 'GROW it: invest wisely and watch your money work.' },
  { n: 6, title: 'Finale Area', desc: 'CELEBRATE: music, dancing, and your certificate!' },
]

const DESKTOP_HINT = 'Use WASD or the up and down arrow keys to walk. Right-click and drag or use the left and right arrow keys to look around. Press E or click the blue button to act. Follow the arrows to see where to go.'
const TOUCH_HINT = 'Use the stick in the corner to walk. Drag anywhere to look around. Tap the blue button to do things. Follow the arrows - they show you where to go next!'

function ControlsTab() {
  const rows = IS_TOUCH
    ? [['Walk', 'Use the stick in the corner to walk'], ['Look around', 'Drag anywhere to look around'], ['Act', 'Tap the blue button to do things'], ['Where to go', 'Follow the arrows!']]
    : [['Walk', 'WASD or the up and down arrow keys'], ['Look around', 'Right-click and drag or use the left and right arrow keys'], ['Act', 'Press E or click the blue button'], ['Where to go', 'Follow the arrows']]
  return (
    <div className="mt-3 flex flex-col gap-2 text-left">
      {rows.map(([k, v]) => (
        <div key={k} className="rounded-2xl bg-white/10 px-4 py-3">
          <div className="font-display text-base font-extrabold text-teal">{k}</div>
          <div className="mt-0.5 text-base font-bold leading-snug text-white">{v}</div>
        </div>
      ))}
    </div>
  )
}

function PhasesTab({ week, gameComplete, sel, setSel }) {
  const statusOf = (n) => (gameComplete || week > n ? 'Done' : week === n ? 'Current' : 'Locked')
  const current = sel ?? Math.min(week, 6)
  return (
    <>
      <div className="mt-3 flex flex-col gap-1.5 text-left">
        {PHASES.map((p) => {
          const st = p.n === 6 ? (gameComplete ? 'Current' : 'Locked') : statusOf(p.n)
          const active = current === p.n
          return (
            <div key={p.n}
              className={`rounded-2xl border-2 px-3 py-2 text-left transition ${st === 'Current' ? 'border-teal bg-teal/15' : active ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}`}>
              <button className="min-h-[44px] w-full text-left" aria-expanded={active} onClick={() => setSel(p.n)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white">{p.n === 6 ? p.title : `Phase ${p.n}: ${p.title}`}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${st === 'Done' ? 'bg-teal text-navy' : st === 'Current' ? 'bg-[#FFD700] text-navy' : 'bg-white/15 text-white/75'}`}>
                    {st === 'Current' ? 'YOU ARE HERE' : st.toUpperCase()}
                  </span>
                </div>
              </button>
              {active && <p className="mt-1 text-xs font-semibold text-white/80">{p.desc}</p>}
              {active && p.n <= 5 && (
                <button
                  onClick={() => { localStorage.setItem('tayu-jump-module', String(p.n)); window.location.href = '/world' }}
                  className="mt-1.5 inline-block min-h-[44px] rounded-lg bg-teal/20 px-3 py-2 text-sm font-extrabold text-teal active:scale-95"
                >
                  Explore this module
                </button>
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80">
        Follow the arrows and you'll always be told what to do next - walk up and talk to the glowing person!
      </p>
    </>
  )
}

// Part 5.2: the Learning Library - real free resources, by module.
function LibraryTab() {
  return (
    <div className="mt-3 flex flex-col gap-2 text-left">
      <p className="text-xs font-semibold text-white/70">Want to learn more? These are real, free resources - great to explore with a grown-up.</p>
      {LIBRARY.map((g) => (
        <div key={g.module} className="rounded-2xl bg-white/5 p-2.5">
          <div className="text-xs font-extrabold uppercase tracking-wide text-teal">{g.module}</div>
          <div className="mt-1 flex flex-col gap-1">
            {g.items.map((id) => LEARN[id] && (
              <a key={id} href={LEARN[id].url} target="_blank" rel="noreferrer"
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white transition active:scale-[0.98]">
                {LEARN[id].label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function HelpCard() {
  const open = useGame((s) => s.helpOpen)
  const setOpen = useGame((s) => s.setHelpOpen)
  const week = useGame((s) => s.week)
  const gameComplete = useGame((s) => s.gameComplete)
  const [tab, setTab] = useState('controls')
  const [sel, setSel] = useState(null)
  const showLesson = useGame((s) => s.showLesson)
  useEffect(() => {
    // R9 3.1: the controls popup appears on EVERY world entry - first play,
    // replay, reload. No seen-before flag. (initWorld resets the store on
    // entry, so open AFTER it settles.)
    const t = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(t)
  }, [setOpen])
  // R9 Part 3: after the entry controls card, three short pointers (once per
  // device) - the '?', the top tabs, and the Learn More buttons.
  const closeHelp = () => {
    setOpen(false)
    if (!localStorage.getItem('tayu-intro-seen')) {
      localStorage.setItem('tayu-intro-seen', '1')
      showLesson('Confused about the controls? Tap the question mark (?) any time to see them again.', null, true)
      showLesson("Up top in that menu you'll also find PHASES (where you are in the journey) and the LIBRARY (extra things to learn).", null, true)
      showLesson('Whenever you want to learn more about something, look for a LEARN MORE button. There is lots more waiting if you are curious!', null, true)
    }
  }
  useEffect(() => { if (open) { setSel(null); setTab('controls') } }, [open])
  if (!open) return null
  return (
    <div className="pointer-events-auto absolute inset-0 z-[290] flex items-end justify-center bg-navy/30 p-4 sm:items-center">
      <div role="dialog" aria-modal="true" aria-label="Game help" className="glass--navy pop-in max-h-[92vh] w-full max-w-md overflow-y-auto p-5 text-center">
        <div className="flex justify-center gap-1.5" role="tablist" aria-label="Help sections">
          {[['controls', 'CONTROLS'], ['phases', 'PHASES'], ['library', 'LIBRARY']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} aria-controls={`help-panel-${id}`} onClick={() => setTab(id)}
              className={`rounded-xl px-3 text-xs font-extrabold transition active:scale-95 ${id === 'controls' ? 'min-h-[48px] px-5 text-sm' : 'min-h-[40px]'} ${tab === id ? 'bg-teal text-navy' : 'bg-white/10 text-white'}`}>
              {label}
            </button>
          ))}
        </div>
        {tab === 'controls' && (
          <div id="help-panel-controls" role="tabpanel">
            <h2 className="mt-3 font-display text-2xl font-extrabold text-teal text-legible">How to play</h2>
            <ControlsTab />
            <SpeakButton text={IS_TOUCH ? TOUCH_HINT : DESKTOP_HINT} dark />
          </div>
        )}
        {tab === 'phases' && (
          <div id="help-panel-phases" role="tabpanel">
            <h2 className="mt-3 font-display text-xl font-extrabold text-teal text-legible">Your Money Journey</h2>
            <PhasesTab week={week} gameComplete={gameComplete} sel={sel} setSel={setSel} />
          </div>
        )}
        {tab === 'library' && (
          <div id="help-panel-library" role="tabpanel">
            <h2 className="mt-3 font-display text-xl font-extrabold text-teal text-legible">Learning Library</h2>
            <LibraryTab />
          </div>
        )}
        <button className="btn-primary mt-3 min-h-[52px] w-full" onClick={closeHelp}>Got it!</button>
      </div>
    </div>
  )
}

// E2: the persistent '?' button, docked by the objective chip.
// R12 Part 6: the glanceable week tracker - dots along the bottom for the
// week-based modules (Bank 6, Money Garden 10). Hidden while a card is up.
function WeekDots() {
  const week = useGame((s) => s.week)
  const bk = useGame((s) => s.bk)
  const mg = useGame((s) => s.mg)
  const cards = useGame((s) => s.cards)
  const dialog = useGame((s) => s.dialog)
  let n = 0, max = 0
  if (week === 4 && bk) { n = Math.min(bk.week, 6); max = 6 }
  else if (week === 5 && mg) { n = Math.min(mg.week, 10); max = 10 }
  if (!max || cards.length > 0 || dialog) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 z-[140] flex justify-center" style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}>
      <div className="glass--navy flex items-center gap-1.5 rounded-2xl px-3 py-1.5">
        <span className="text-[11px] font-extrabold text-white/80">Week {n} of {max}</span>
        <div className="flex gap-1">
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: i < n ? '#00DCA0' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HelpButton() {
  const setOpen = useGame((s) => s.setHelpOpen)
  return (
    <button
      aria-label="Help"
      onClick={() => setOpen(true)}
      className="pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl bg-navy/80 font-display text-xl font-extrabold text-teal shadow-lg transition active:scale-95"
    >
      ?
    </button>
  )
}

export function Hud({ playerName, onContinue }) {
  const wallet = useGame((s) => s.wallet)
  const near = useGame((s) => s.near)
  const panelJar = useGame((s) => s.panelJar)
  const panelItem = useGame((s) => s.panelItem)
  const dialog = useGame((s) => s.dialog)
  const lessons = useGame((s) => s.lessons)
  const cards = useGame((s) => s.cards)
  const objective = useGame((s) => s.objective)
  const scenarioLocked = useGame((s) => s.scenarioLocked)
  const scenario = useGame((s) => s.scenario)
  const attempt = useGame((s) => s.attempt)
  const toast = useGame((s) => s.toast)
  const banner = useGame((s) => s.banner)
  const week = useGame((s) => s.week)
  const lemPhase = useGame((s) => s.lemPhase)
  const lemCumProfit = useGame((s) => s.lemCumProfit)
  const bramTalked = useGame((s) => s.bramTalked)
  const mg = useGame((s) => s.mg)
  const weekComplete = useGame((s) => s.weekComplete)
  const hudShakeKey = useGame((s) => s.hudShakeKey)
  const alloc = useGame((s) => s.allocations)
  const shownWallet = useCountUp(wallet)

  const gameComplete = useGame((s) => s.gameComplete)
  const hint = gameComplete
    ? 'Go to the FINALE AREA!'
    : week === 5
    ? 'Visit the Money Garden'
    : week === 4
    ? 'Visit the Bank of TAYU'
    : week === 3
    ? 'Visit Budget Town'
    : week === 2
    ? (lemPhase === 'toMarket' ? 'Buy supplies from Mr. Bram' : lemPhase === 'toStand' || lemPhase === 'toStand2' ? 'Go to your lemonade stand' : `Goal: $${PROFIT_GOAL} profit`)
    : objective === 'mailbox' ? 'Go to the ALLOWANCE BANK'
    : objective === 'kitchen' ? (scenario ? `${scenario.title}: fill your 3 jars` : 'Fill your 3 jars')
    : objective === 'store' ? (bramTalked ? 'Shop: one healthy food + one healthy drink' : 'Talk to Mr. Bram first')
    : 'Week complete!'

  const promptOpen = near && !panelJar && !panelItem && !dialog && !weekComplete && !scenarioLocked && lessons.length === 0 && cards.length === 0

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] select-none font-body">
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <button
          aria-label="TAYU"
          className="glass--navy pointer-events-auto grid h-11 w-11 place-items-center rounded-2xl"
          onClick={() => {
            // hidden teacher gesture: 5 quick taps opens the Admin gate (v8 6.3)
            const now = Date.now()
            const w = window
            w.__tayuTaps = (now - (w.__tayuLastTap || 0) < 1200 ? (w.__tayuTaps || 0) : 0) + 1
            w.__tayuLastTap = now
            if (w.__tayuTaps >= 5) { w.__tayuTaps = 0; w.dispatchEvent(new Event('tayu-admin-gesture')) }
          }}
        >
          <img src={LOGO} alt="" className="h-8 w-8 rounded-lg logo-breathe" />
        </button>
        <MuteButton />
        {week === 1 && wallet > 0 && (
          <div key={hudShakeKey} className={`glass--navy rounded-2xl px-4 py-2 text-2xl font-extrabold ${hudShakeKey > 0 ? 'hud-shake' : ''}`} style={{ color: '#FFD700' }}>
            ${fmt(shownWallet)}
          </div>
        )}
      </div>

      <JarHud />
      <MoneyPill />
      <SeedProgress />
      <DayBudgetBar />
      <PinnedLesson />
      <TrustMeter />
      <WeekDots />

      {/* E: hidden on phones - it collided with the objective chip */}
      <div className="glass--navy absolute left-1/2 top-4 hidden -translate-x-1/2 rounded-2xl px-4 py-2 text-sm font-bold text-white text-legible sm:block">
        Module {week} of 5
      </div>

      <div className="absolute right-4 top-4 flex items-start gap-2">
        <div className="glass max-w-[40vw] rounded-2xl px-4 py-2 text-right text-sm font-bold text-navy">
          {hint}
        </div>
        <HelpButton />
      </div>

      {objective === 'kitchen' && attempt > 0 && !weekComplete && (
        <div className="glass absolute left-1/2 top-16 -translate-x-1/2 rounded-xl px-3 py-1 text-xs font-bold text-navy">
          Try #{attempt + 1}. You have got this!
        </div>
      )}

      {promptOpen && !IS_TOUCH && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-28 z-[250] flex justify-center sm:bottom-24">
          {/* D4: the prompt IS the button - clicking fires the same interaction as E */}
          <button
            onClick={() => window.dispatchEvent(new Event('tayu-interact'))}
            className="tayu-btn-glass min-h-[52px] animate-pulse text-lg transition hover:scale-105 active:scale-95"
          >
            {IS_TOUCH ? `Tap - ${near.label}` : `Click or press E - ${near.label}`}
          </button>
        </div>
      )}

      {toast && !weekComplete && !dialog && cards.length === 0 && lessons.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[150] flex justify-center px-4">
          <div role="status" aria-live="polite" className="pop-in max-w-lg rounded-3xl bg-white px-6 py-4 shadow-2xl">
            <p className="text-lg font-bold leading-snug text-navy">{toast}</p>
          </div>
        </div>
      )}

      <HelpCard />
      <TintOverlay />
      <SunSweep />
      <Banner />
      {banner && <Confetti />}
      <JarPanel />
      <DialogPanel />
      <GuideBubble />
      <ProductPanel />
      <RecapPanel />
      <SupplyPanel />
      <CostTemplatePanel />
      <PoolPanel />
      <WeekEndCards playerName={playerName} />
      <BottomSheet />
      <DockedControls />
      <PortfolioPanel />
      <SeedPiePanel />
      <BudgetPanel />
      <HarvestSummary />
      <LessonCard />

      {weekComplete && (
        <>
          <Confetti />
          <div className="pointer-events-auto absolute inset-0 z-[310] flex items-center justify-center bg-navy/60 backdrop-blur-sm">
            <div className="glass--navy pop-in max-w-sm p-8 text-center">
              <img src={LOGO} alt="TAYU" className="mx-auto h-20 w-20 rounded-2xl logo-breathe" />
              <h2 className="mt-2 font-display text-2xl font-extrabold text-teal text-legible">Week {week} Complete!</h2>
              <p className="mt-1 text-lg text-white/85">
                {week === 1
                  ? `Amazing, ${playerName}! You budgeted, shopped smart, and your leftover money became savings.`
                  : week === 2
                    ? `TYCOON! You earned $${fmt(lemCumProfit)} of business profit, after taxes and paying yourself.`
                    : `You planted, you watched, you learned. A true Market Gardener with $${mg ? fmt(totalValue(mg)) : ''}.`}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-extrabold text-electric">${fmt(alloc.spend)}</div><div className="text-xs text-white/50">Spend</div></div>
                <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-extrabold text-teal">${fmt(alloc.save)}</div><div className="text-xs text-white/50">Save</div></div>
                <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-extrabold text-brandpurple">${fmt(alloc.give)}</div><div className="text-xs text-white/50">Give</div></div>
              </div>
              <button className="btn-primary mt-5 min-h-[56px]" onClick={onContinue}>{week === 1 ? 'Start Week 2' : week === 2 ? 'Go to Budget Town' : 'Finish'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
