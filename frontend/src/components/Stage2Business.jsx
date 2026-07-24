import { useState } from 'react'
import { useGameState } from '../hooks/useGameState.jsx'
import { round2, TAX_RATE_STAGE2 } from '../utils/financialCalculations.js'
import { STAGE2_EVENTS, drawEvents } from '../utils/eventGenerator.js'
import { clamp } from '../utils/validators.js'
import HelpTooltip from './HelpTooltip.jsx'
import EventCard from './EventCard.jsx'
import Marketplace from './Marketplace.jsx'

const BUSINESSES = [
  { id: 'lemonade', name: 'Lemonade Stand', emoji: '🍋', startup: 0, costRate: 0.25, priceMin: 1, priceMax: 10, baseDemand: 30, unit: 'cups' },
  { id: 'dogwalking', name: 'Dog Walking', emoji: '🐕', startup: 0, costRate: 0.1, priceMin: 5, priceMax: 20, baseDemand: 12, unit: 'walks' },
  { id: 'art', name: 'Art Commissions', emoji: '🎨', startup: 5, costRate: 0.3, priceMin: 5, priceMax: 20, baseDemand: 10, unit: 'pieces' },
  { id: 'tutoring', name: 'Tutoring', emoji: '📚', startup: 0, costRate: 0.05, priceMin: 10, priceMax: 30, baseDemand: 8, unit: 'sessions' },
  { id: 'content', name: 'Content Creator', emoji: '📱', startup: 10, costRate: 0.2, priceMin: 1, priceMax: 15, baseDemand: 25, unit: 'posts' },
]
const WEEKS = 4
const MAX_EFFORT = 50

// Customers fall as price rises (simple demand curve).
const demandAt = (biz, price) => {
  const t = (price - biz.priceMin) / (biz.priceMax - biz.priceMin)
  return Math.max(1, Math.round(biz.baseDemand * (1 - 0.8 * t)))
}

export default function Stage2Business({ onComplete }) {
  const { state, dispatch } = useGameState()
  const [biz, setBiz] = useState(null)
  const [phase, setPhase] = useState('select') // select | set | result | summary | market
  const [week, setWeek] = useState(1)
  const [price, setPrice] = useState(2)
  const [effort, setEffort] = useState(40)
  const [result, setResult] = useState(null)
  const [weekEvents] = useState(() => drawEvents(STAGE2_EVENTS, WEEKS))
  const [totals, setTotals] = useState({ revenue: 0, profit: 0 })

  const choose = (b) => {
    setBiz(b)
    setPrice(Math.round((b.priceMin + b.priceMax) / 4) || b.priceMin)
    setTotals({ revenue: 0, profit: -b.startup })
    setPhase('set')
  }

  // Live (deterministic) estimate while sliders move.
  const estDemand = biz ? demandAt(biz, price) : 0
  const estRevenue = biz ? round2(price * estDemand * (effort / MAX_EFFORT)) : 0
  const estCosts = round2(estRevenue * (biz?.costRate ?? 0))
  const estTax = round2(estRevenue * TAX_RATE_STAGE2)
  const estProfit = round2(estRevenue - estCosts - estTax)

  const runWeek = () => {
    const ev = weekEvents[week - 1]
    const noise = 0.85 + Math.random() * 0.3 // ±15%
    let revenue = round2(price * demandAt(biz, price) * (effort / MAX_EFFORT) * noise)
    let expenses = round2(revenue * biz.costRate)
    if (ev?.field === 'revenue') revenue = round2(Math.max(0, revenue + ev.amount))
    if (ev?.field === 'expenses') expenses = round2(expenses + ev.amount)
    const tax = round2(revenue * TAX_RATE_STAGE2)
    const net = round2(revenue - expenses - tax)

    setResult({ revenue, expenses, tax, net, ev })
    setTotals((t) => ({ revenue: round2(t.revenue + revenue), profit: round2(t.profit + net) }))
    setPhase('result')
  }

  const nextWeek = () => {
    if (week < WEEKS) {
      setWeek((w) => w + 1)
      setResult(null)
      setPhase('set')
    } else {
      // Award marketplace points for profit, then summary.
      const earned = Math.max(0, Math.round(totals.profit))
      dispatch({ type: 'ADD_POINTS', amount: earned })
      setPhase('summary')
    }
  }

  const margin = totals.revenue > 0 ? totals.profit / totals.revenue : 0

  const finish = () => {
    const carry = state.netWorth
    const netWorth = round2(carry + totals.profit)
    const achievement =
      margin >= 0.5 ? { badge: 'Profit Maximizer', emoji: '💹' } : { badge: 'Teen Entrepreneur', emoji: '🧑‍💼' }
    dispatch({
      type: 'COMPLETE_STAGE',
      stage: 2,
      results: { business: biz.id, profit: totals.profit },
      netWorth,
      summary: {
        business: biz.name,
        revenue: totals.revenue,
        profit: totals.profit,
        margin: Math.round(margin * 100),
        netWorth,
      },
      achievement,
    })
    onComplete?.()
  }

  // ---- SELECT ----
  if (phase === 'select') {
    return (
      <section className="card animate-fadein">
        <h2 className="font-display text-2xl font-bold">Stage 2: Teen Hustle</h2>
        <p className="mt-1 text-white/70">You're a teenager! Pick your business - you'll run it for {WEEKS} weeks.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {BUSINESSES.map((b) => (
            <li key={b.id}>
              <button className="w-full rounded-2xl bg-white/5 p-4 text-left transition hover:bg-white/15" onClick={() => choose(b)}>
                <div className="text-2xl">{b.emoji} <span className="text-lg font-bold">{b.name}</span></div>
                <div className="mt-1 text-sm text-white/60">
                  Startup ${b.startup} · ${b.priceMin}–${b.priceMax}/{b.unit.slice(0, -1)}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  // ---- SET PARAMETERS ----
  if (phase === 'set') {
    return (
      <section className="card animate-fadein">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{biz.emoji} {biz.name}</h2>
          <span className="text-sm text-white/60">Week {week} of {WEEKS}</span>
        </div>

        <div className="mt-5 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">Price per {biz.unit.slice(0, -1)} <HelpTooltip text="Higher price = more profit per sale, but fewer customers." /></span>
              <span className="text-lg">${price}</span>
            </div>
            <input type="range" min={biz.priceMin} max={biz.priceMax} step="1" value={price}
              onChange={(e) => setPrice(clamp(Number(e.target.value), biz.priceMin, biz.priceMax))}
              className="mt-1 w-full accent-highlight" aria-label="price" />
            <p className="text-sm text-white/50">At ${price}, you'll attract about {estDemand} customers.</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">Effort level <HelpTooltip text="More effort = more revenue, but you need rest time for school." /></span>
              <span className="text-lg">{Math.round((effort / MAX_EFFORT) * 100)}%</span>
            </div>
            <input type="range" min="5" max={MAX_EFFORT} step="5" value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              className="mt-1 w-full accent-highlight" aria-label="effort" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-black/30 p-4 text-sm">
          <Row label="Estimated revenue" value={`$${estRevenue}`} />
          <Row label={`Supplies (${Math.round(biz.costRate * 100)}%)`} value={`–$${estCosts}`} />
          <Row label="Tax (10%)" value={`–$${estTax}`} />
          <div className="my-1 border-t border-white/10" />
          <Row label="Estimated profit" value={`$${estProfit}`} bold />
        </div>

        <button className="btn-primary mt-4 w-full" onClick={runWeek}>Run Week {week} ▶</button>
      </section>
    )
  }

  // ---- RESULT ----
  if (phase === 'result') {
    return (
      <section className="card animate-fadein">
        <h2 className="font-display text-xl font-bold">Week {week} Results</h2>
        <div className="mt-4 rounded-2xl bg-black/30 p-4">
          <Row label="Revenue" value={`$${result.revenue}`} />
          <Row label="Supplies" value={`–$${result.expenses}`} />
          <Row label="Tax" value={`–$${result.tax}`} />
          <div className="my-1 border-t border-white/10" />
          <Row label="Net profit" value={`$${result.net}`} bold color={result.net >= 0 ? 'text-save' : 'text-spend'} />
        </div>
        {result.ev && (
          <div className="mt-4">
            <EventCard event={result.ev} onChoose={() => {}} />
          </div>
        )}
        <p className="mt-4 text-center text-white/70">Business account so far: <span className="font-bold text-highlight">${round2(totals.profit)}</span></p>
        <button className="btn-primary mt-4 w-full" onClick={nextWeek}>
          {week < WEEKS ? `Continue to Week ${week + 1} →` : 'See your 4-week report →'}
        </button>
      </section>
    )
  }

  // ---- MARKETPLACE ----
  if (phase === 'market') {
    return (
      <div className="animate-fadein">
        <Marketplace onClose={() => setPhase('summary')} />
      </div>
    )
  }

  // ---- SUMMARY ----
  return (
    <section className="card animate-fadein text-center">
      <h2 className="font-display text-2xl font-bold">4-Week Business Report 📊</h2>
      <p className="mt-1 text-white/70">{biz.emoji} {biz.name}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Revenue" value={`$${totals.revenue}`} />
        <Stat label="Profit" value={`$${totals.profit}`} color={totals.profit >= 0 ? 'text-save' : 'text-spend'} />
        <Stat label="Margin" value={`${Math.round(margin * 100)}%`} />
      </div>
      <p className="mt-4 text-3xl">{margin >= 0.5 ? '💹 Profit Maximizer' : '🧑‍💼 Teen Entrepreneur'}</p>
      <p className="mt-2 text-sm text-white/60">You earned <span className="text-highlight">{state.points} points</span> to spend in the Marketplace.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button className="btn-secondary" onClick={() => setPhase('market')}>🛒 Visit Marketplace</button>
        <button className="btn-primary" onClick={finish}>Grow up to young adult →</button>
      </div>
    </section>
  )
}

function Row({ label, value, bold, color }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-white/70">{label}</span>
      <span className={`${bold ? 'font-bold' : ''} ${color ?? ''}`}>{value}</span>
    </div>
  )
}
function Stat({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <div className={`text-xl font-bold ${color ?? 'text-white'}`}>{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  )
}
