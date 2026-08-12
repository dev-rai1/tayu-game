import { useMemo, useState } from 'react'
import { useGame } from './store.js'
import { saveProfile } from '../services/walletStore.js'
import { BOND_MEADOW } from '../scenarios/moneyGardenGuidance.js'

const IDS = ['treasury', 'muni', 'corporate']
const COLORS = { treasury: '#4f86d9', muni: '#36a36e', corporate: '#f0822e' }
const TITLES = { treasury: 'U.S. Treasury', muni: 'Muni Bond', corporate: 'Corporate Bond' }
const stars = (count) => '★'.repeat(count) + '☆'.repeat(Math.max(0, 3 - count))

function normalize(values) {
  const total = IDS.reduce((sum, id) => sum + Number(values[id] || 0), 0)
  if (total === 100) return values
  const base = total > 0 ? values : { treasury: 40, muni: 30, corporate: 30 }
  const treasury = Math.round((Number(base.treasury || 0) / Math.max(1, total || 100)) * 100)
  const muni = Math.round((Number(base.muni || 0) / Math.max(1, total || 100)) * 100)
  return { treasury, muni, corporate: Math.max(0, 100 - treasury - muni) }
}

function adjust(values, id, delta) {
  const next = { ...values }
  const current = Number(next[id] || 0)
  const target = Math.max(0, Math.min(100, current + delta))
  const change = target - current
  if (!change) return next
  next[id] = target
  const others = IDS.filter((key) => key !== id)
  let remaining = -change
  for (const key of others) {
    if (!remaining) break
    if (remaining > 0) {
      const room = 100 - next[key]
      const moved = Math.min(room, remaining)
      next[key] += moved
      remaining -= moved
    } else {
      const moved = Math.min(next[key], -remaining)
      next[key] -= moved
      remaining += moved
    }
  }
  return normalize(next)
}

export function MoneyGardenBondMeadow() {
  const week = useGame((s) => s.week)
  const mg = useGame((s) => s.mg)
  const persist = useGame((s) => s.persist)
  const [allocation, setAllocation] = useState(() => normalize(mg?.bondMeadow || { treasury: 40, muni: 30, corporate: 30 }))

  const visible = week === 5 && mg && Number(mg.week || 1) === 1 && mg.phase === 'adjust' && !mg.bondMeadowComplete
  const gradient = useMemo(() => {
    let acc = 0
    return IDS.map((id) => {
      const start = acc
      acc += Number(allocation[id] || 0)
      return `${COLORS[id]} ${start * 3.6}deg ${acc * 3.6}deg`
    }).join(', ')
  }, [allocation])

  if (!visible) return null

  const confirm = () => {
    useGame.setState((state) => ({
      mg: state.mg ? {
        ...state.mg,
        bondMeadow: { ...allocation },
        bondMeadowComplete: true,
      } : state.mg,
    }))
    saveProfile({
      moneyGardenBondMeadow: { ...allocation },
      muniBondExplored: Number(allocation.muni || 0) > 0,
    })
    persist()
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[625]" data-money-garden-bond-meadow="true">
      <section className="pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right,0px))] top-[calc(6.5rem+env(safe-area-inset-top,0px))] max-h-[calc(100dvh-8rem)] w-[min(31vw,24rem)] min-w-[19rem] overflow-y-auto rounded-3xl border-2 border-[#f0822e] bg-[#fffdf6] p-4 text-navy shadow-2xl max-[899px]:bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] max-[899px]:left-3 max-[899px]:right-3 max-[899px]:top-auto max-[899px]:max-h-[48dvh] max-[899px]:w-auto max-[899px]:min-w-0">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#b85e17]">MG3-bond · Fourth bed</div>
        <h2 className="mt-1 font-display text-2xl font-extrabold">The Bond Meadow</h2>
        <p className="mt-2 text-sm font-bold leading-relaxed">This bed is different. You are not buying a piece of a store. You are <strong>lending</strong> money to a borrower who promises interest and repayment.</p>

        <div className="mt-3 grid place-items-center">
          <div className="h-28 w-28 rounded-full shadow-inner" style={{ background: `conic-gradient(${gradient})` }} aria-label="Bond Meadow allocation pie" />
        </div>

        <div className="mt-3 grid gap-2">
          {IDS.map((id) => {
            const bond = BOND_MEADOW[id]
            return (
              <div key={id} className="rounded-2xl border border-navy/10 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div><strong>{TITLES[id]}</strong><div className="text-xs font-black text-[#a06b00]">{stars(bond.safety)}</div></div>
                  <div className="font-display text-xl font-extrabold" style={{ color: COLORS[id] }}>{allocation[id]}%</div>
                </div>
                <p className="mt-1 text-xs font-bold leading-snug text-navy/65">{bond.line}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setAllocation((current) => adjust(current, id, -10))} className="min-h-[40px] flex-1 rounded-xl bg-navy/10 text-sm font-extrabold">−10%</button>
                  <button type="button" onClick={() => setAllocation((current) => adjust(current, id, 10))} className="min-h-[40px] flex-1 rounded-xl bg-navy/10 text-sm font-extrabold">+10%</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 rounded-2xl bg-sun/15 p-3 text-xs font-bold leading-relaxed">More Treasury = safer, less interest. More Corporate = more interest, more borrower risk. Muni is the tax surprise: local-government bond interest can receive special tax treatment.</div>
        <button type="button" onClick={confirm} className="mt-4 min-h-[52px] w-full rounded-2xl bg-[#f0822e] px-4 font-extrabold text-white">Plant the Bond Meadow!</button>
      </section>
    </div>
  )
}
