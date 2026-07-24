import { useState } from 'react'
import { useGameState } from '../hooks/useGameState.jsx'
import {
  takeHome, round2, applyReturn, stockMonthlyReturn, BOND_MONTHLY_RETURN, totalNetWorth,
} from '../utils/financialCalculations.js'
import { STAGE3_EVENTS, drawEvents } from '../utils/eventGenerator.js'
import HelpTooltip from './HelpTooltip.jsx'
import EventCard from './EventCard.jsx'

const TAKE_HOME = 1650
const MONTHS = 6
const BUCKETS = [
  { key: 'emergencyFund', label: 'Emergency Fund', emoji: '🛟', max: 500, help: 'Money for surprises like a car repair. Most adults keep 3–6 months of costs here.' },
  { key: 'stocks', label: 'Stocks', emoji: '📈', max: 990, help: 'Riskier, but usually grows faster over time.' },
  { key: 'bonds', label: 'Bonds', emoji: '🛡️', max: 990, help: 'Safe and steady - a small, predictable return.' },
  { key: 'savingsGoals', label: 'Savings Goals', emoji: '🎯', max: 660, help: 'Saving toward a car, a trip, or a big purchase.' },
]

export default function Stage3YoungAdult({ onComplete }) {
  const { state, dispatch } = useGameState()
  const { tax, rent, insurance } = takeHome()
  const carry = state.netWorth

  const [phase, setPhase] = useState('intro') // intro | allocate | sim | event | report
  const [alloc, setAlloc] = useState({ emergencyFund: 165, stocks: 495, bonds: 330, savingsGoals: 80 })
  const [port, setPort] = useState(null) // live portfolio during sim
  const [month, setMonth] = useState(0)
  const [history, setHistory] = useState([])
  const [monthEvents] = useState(() => {
    const picks = drawEvents(STAGE3_EVENTS, 2)
    return { 2: picks[0], 4: picks[1] } // events on months 2 and 4
  })
  const [pendingEvent, setPendingEvent] = useState(null)
  const [log, setLog] = useState([])

  const othersSum = Object.values(alloc).reduce((a, b) => a + b, 0)
  const living = round2(TAKE_HOME - othersSum)

  const setBucket = (key, raw) => {
    let value = Math.max(0, Number(raw))
    const otherTotal = othersSum - alloc[key]
    if (otherTotal + value > TAKE_HOME) value = TAKE_HOME - otherTotal // keep living ≥ 0
    setAlloc((a) => ({ ...a, [key]: value }))
  }

  const startSim = () => {
    const initial = { ...alloc }
    setPort(initial)
    setHistory([{ month: 0, netWorth: round2(carry + othersSum) }])
    setMonth(0)
    setPhase('sim')
  }

  const advanceMonth = () => {
    const m = month + 1
    const r = stockMonthlyReturn()
    const next = {
      ...port,
      stocks: applyReturn(port.stocks, r),
      bonds: applyReturn(port.bonds, BOND_MONTHLY_RETURN),
    }
    setPort(next)
    setLog((l) => [`Month ${m}: stocks ${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%, bonds +1.0%`, ...l])
    setMonth(m)

    const ev = monthEvents[m]
    const nw = round2(carry + next.emergencyFund + next.stocks + next.bonds + next.savingsGoals)
    setHistory((h) => [...h, { month: m, netWorth: nw }])

    if (ev) {
      setPendingEvent(ev)
      setPhase('event')
    } else if (m >= MONTHS) {
      setPhase('report')
    }
  }

  const resolveEvent = (choice) => {
    const ev = pendingEvent
    const accepted = !ev.prompt || choice === 'yes'
    if (accepted) {
      setPort((p) => {
        const updated = { ...p, [ev.bucket]: round2(Math.max(0, p[ev.bucket] + ev.amount)) }
        return updated
      })
      setLog((l) => [`${ev.text} (${ev.amount > 0 ? '+' : ''}$${ev.amount} → ${ev.bucket})`, ...l])
    } else {
      setLog((l) => [`${ev.text} - skipped.`, ...l])
    }
    setPendingEvent(null)
    setPhase(month >= MONTHS ? 'report' : 'sim')
  }

  const portfolioValue = port ? round2(port.emergencyFund + port.stocks + port.bonds + port.savingsGoals) : 0
  const finalNetWorth = round2(carry + portfolioValue)

  const finish = () => {
    const stockGain = port.stocks - alloc.stocks
    const achievement =
      alloc.stocks >= alloc.bonds && stockGain > 0
        ? { badge: 'Investment Wizard', emoji: '🧙' }
        : { badge: 'Balanced Budgeter', emoji: '⚖️' }
    dispatch({
      type: 'COMPLETE_STAGE',
      stage: 3,
      results: { ...port, debt: 0 },
      netWorth: finalNetWorth,
      summary: {
        portfolio: portfolioValue,
        stocks: round2(port.stocks),
        bonds: round2(port.bonds),
        emergencyFund: round2(port.emergencyFund),
        netWorth: finalNetWorth,
      },
      achievement,
    })
    onComplete?.()
  }

  // ---- INTRO ----
  if (phase === 'intro') {
    return (
      <section className="card animate-fadein">
        <h2 className="font-display text-2xl font-bold">Stage 3: Young Adult</h2>
        <p className="mt-1 text-white/70">You graduated and got a job! Salary: $40,000/yr.</p>
        <pre className="mt-4 rounded-2xl bg-black/30 p-4 text-sm leading-6">
{`GROSS SALARY:   $3,333 / mo
Taxes (22%):    -$${tax}
Rent:           -$${rent}
Insurance:      -$${insurance}
──────────────────────────
NET TAKE-HOME:  $${TAKE_HOME}`}
        </pre>
        <button className="btn-primary mt-4 w-full" onClick={() => setPhase('allocate')}>Allocate your ${TAKE_HOME} →</button>
      </section>
    )
  }

  // ---- ALLOCATE ----
  if (phase === 'allocate') {
    return (
      <section className="card animate-fadein">
        <h2 className="font-display text-xl font-bold">Invest your ${TAKE_HOME}</h2>
        <p className="mt-1 text-sm text-white/60">Living expenses take whatever's left. Spread the rest wisely!</p>

        <div className="mt-4 flex flex-col gap-4">
          {BUCKETS.map((b) => (
            <div key={b.key}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold">{b.emoji} {b.label} <HelpTooltip text={b.help} /></span>
                <span>${alloc[b.key]}</span>
              </div>
              <input type="range" min="0" max={b.max} step="5" value={alloc[b.key]}
                onChange={(e) => setBucket(b.key, e.target.value)}
                className="mt-1 w-full accent-highlight" aria-label={b.label} />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3">
            <span className="flex items-center gap-2 font-bold">🍽️ Daily Living <HelpTooltip text="Food, utilities, fun. This is spent, not invested." /></span>
            <span className={living >= 100 ? '' : 'text-spend'}>${living}</span>
          </div>
        </div>

        <button className="btn-primary mt-5 w-full disabled:opacity-40" disabled={living < 0} onClick={startSim}>
          Confirm & start Month 1 →
        </button>
      </section>
    )
  }

  // ---- EVENT ----
  if (phase === 'event' && pendingEvent) {
    return (
      <section className="animate-fadein">
        <p className="mb-3 text-center text-white/60">Month {month} - life happens!</p>
        <EventCard event={pendingEvent} onChoose={resolveEvent} />
      </section>
    )
  }

  // ---- SIM ----
  if (phase === 'sim') {
    return (
      <section className="card animate-fadein">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Month {month} of {MONTHS}</h2>
          <span className="text-highlight font-bold">Net worth ${finalNetWorth}</span>
        </div>

        <NetWorthChart history={history} />

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Mini label="📈 Stocks" value={`$${round2(port.stocks)}`} />
          <Mini label="🛡️ Bonds" value={`$${round2(port.bonds)}`} />
          <Mini label="🛟 Emergency" value={`$${round2(port.emergencyFund)}`} />
          <Mini label="🎯 Savings" value={`$${round2(port.savingsGoals)}`} />
        </div>

        {month >= MONTHS ? (
          <button className="btn-primary mt-4 w-full" onClick={() => setPhase('report')}>See your year-end report →</button>
        ) : (
          <button className="btn-primary mt-4 w-full" onClick={advanceMonth}>Advance to Month {month + 1} ▶</button>
        )}

        {log.length > 0 && (
          <ul className="mt-4 max-h-28 overflow-auto text-xs text-white/50">
            {log.map((l, i) => <li key={i}>• {l}</li>)}
          </ul>
        )}
      </section>
    )
  }

  // ---- REPORT ----
  return (
    <section className="card animate-fadein text-center">
      <h2 className="font-display text-2xl font-bold">Year-End Report 🏆</h2>
      <NetWorthChart history={history} />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Stocks" value={`$${round2(port.stocks)}`} color="text-save" />
        <Stat label="Bonds" value={`$${round2(port.bonds)}`} />
        <Stat label="Emergency" value={`$${round2(port.emergencyFund)}`} />
        <Stat label="Portfolio" value={`$${portfolioValue}`} color="text-highlight" />
      </div>
      <p className="mt-4 text-lg">Final net worth: <span className="font-bold text-highlight">${finalNetWorth}</span></p>
      <button className="btn-primary mt-5" onClick={finish}>Finish the game 🎉</button>
    </section>
  )
}

function NetWorthChart({ history }) {
  if (!history?.length) return null
  const values = history.map((h) => h.netWorth)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  // Scale from a baseline so small month-over-month growth is still visible.
  const heightPct = (v) => 15 + ((v - min) / range) * 85
  return (
    <div className="mt-4 flex items-end justify-around gap-1 rounded-2xl bg-black/30 p-3">
      {history.map((h) => (
        <div key={h.month} className="flex flex-1 flex-col items-center">
          <div className="flex h-24 w-full items-end">
            <div className="w-full rounded-t bg-save transition-all" style={{ height: `${heightPct(h.netWorth)}%` }} title={`$${h.netWorth}`} />
          </div>
          <span className="mt-1 text-[10px] text-white/50">M{h.month}</span>
        </div>
      ))}
    </div>
  )
}
function Mini({ label, value }) {
  return <div className="rounded-xl bg-white/5 p-2 text-center"><div className="font-bold">{value}</div><div className="text-[10px] text-white/50">{label}</div></div>
}
function Stat({ label, value, color }) {
  return <div className="rounded-2xl bg-white/5 p-3"><div className={`text-lg font-bold ${color ?? 'text-white'}`}>{value}</div><div className="text-xs text-white/50">{label}</div></div>
}
