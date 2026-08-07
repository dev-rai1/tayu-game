import { useEffect, useState } from 'react'
import { useGame } from './store.js'
import { STORE_ITEMS } from './config.js'
import { estimateDemandSignal } from '../scenarios/lemonade.js'
import { usesTouchControls } from './controlMode.js'

const fmt = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const MOBILE_SHEET = 'pointer-events-auto fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[475] max-h-[min(74vh,42rem)] overflow-y-auto overscroll-contain rounded-3xl shadow-2xl'
const COMPACT_BUTTON = 'pointer-events-auto fixed z-[475] min-h-[46px] max-w-[min(78vw,18rem)] rounded-2xl border-2 border-white/20 bg-navy/95 px-4 text-left text-sm font-extrabold text-white shadow-xl active:scale-95'
const COMPACT_BUTTON_STYLE = usesTouchControls
  ? {
      left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
      bottom: 'calc(10.75rem + env(safe-area-inset-bottom, 0px))',
    }
  : {
      left: 'max(0.75rem, env(safe-area-inset-left, 0px))',
      bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
    }

function MarketClickShop() {
  const week = useGame((s) => s.week)
  const objective = useGame((s) => s.objective)
  const bramTalked = useGame((s) => s.bramTalked)
  const bought = useGame((s) => s.bought)
  const spend = useGame((s) => s.allocations.spend)
  const panelItem = useGame((s) => s.panelItem)
  const dialog = useGame((s) => s.dialog)
  const lessons = useGame((s) => s.lessons)
  const cards = useGame((s) => s.cards)
  const scenarioLocked = useGame((s) => s.scenarioLocked)
  const weekComplete = useGame((s) => s.weekComplete)
  const storeMissionDone = useGame((s) => s.storeMissionDone)
  const buyItem = useGame((s) => s.buyItem)
  const confirmCheckout = useGame((s) => s.confirmCheckout)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (storeMissionDone || objective !== 'store') setOpen(false)
  }, [objective, storeMissionDone])

  if (
    week !== 1 || objective !== 'store' || !bramTalked || storeMissionDone || panelItem || dialog ||
    lessons.length > 0 || cards.length > 0 || scenarioLocked || weekComplete
  ) return null

  const basket = bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
  const hasFood = basket.some((item) => item.tags?.includes('food'))
  const hasDrink = basket.some((item) => item.tags?.includes('drink'))
  const ready = hasFood && hasDrink

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-tayu-overlay-slot="guided-action"
        className={COMPACT_BUTTON}
        style={COMPACT_BUTTON_STYLE}
      >
        Open market choices · ${fmt(spend)} left
      </button>
    )
  }

  return (
    <aside className={`${MOBILE_SHEET} border-2 border-teal bg-navy/95 p-4 text-white sm:inset-x-auto sm:right-3 sm:w-[min(94vw,32rem)]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">TAYU Market</div>
          <h2 className="mt-1 font-display text-lg font-extrabold">Choose one food and one drink</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="min-h-[42px] shrink-0 rounded-xl bg-white/10 px-3 text-xs font-extrabold">Hide</button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {STORE_ITEMS.map((item) => {
          const inBasket = bought.includes(item.id)
          const affordable = spend >= item.price
          return (
            <button
              key={item.id}
              type="button"
              disabled={inBasket || !affordable}
              onClick={() => buyItem(item)}
              className={`min-h-[72px] rounded-2xl border-2 px-3 py-2 text-left transition active:scale-95 disabled:cursor-not-allowed ${
                inBasket ? 'border-teal bg-teal/20' : affordable ? 'border-white/20 bg-white/10 hover:border-sun' : 'border-white/10 bg-white/5 opacity-45'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl" aria-hidden>{item.emoji}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${item.type === 'need' ? 'bg-teal text-navy' : 'bg-brandpurple text-white'}`}>
                  {item.type === 'need' ? 'NEED' : 'WANT'}
                </span>
              </div>
              <div className="mt-1 text-sm font-extrabold">{item.name} · ${item.price}</div>
              <div className="text-[11px] font-bold text-white/65">{inBasket ? 'In basket' : affordable ? 'Choose' : 'Too expensive'}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-extrabold">
        <div className={`rounded-xl px-3 py-2 ${hasFood ? 'bg-teal text-navy' : 'bg-white/10 text-white/70'}`}>{hasFood ? 'Food ready' : 'Pick food'}</div>
        <div className={`rounded-xl px-3 py-2 ${hasDrink ? 'bg-teal text-navy' : 'bg-white/10 text-white/70'}`}>{hasDrink ? 'Drink ready' : 'Pick drink'}</div>
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={confirmCheckout}
        className="mt-3 min-h-[54px] w-full rounded-2xl bg-sun px-4 text-lg font-extrabold text-navy transition active:scale-95 disabled:bg-white/10 disabled:text-white/40"
      >
        {ready ? `Checkout (${bought.length} items)` : 'Choose food + drink'}
      </button>
    </aside>
  )
}

function LemonadeSupplyDemandCoach() {
  const week = useGame((s) => s.week)
  const objective = useGame((s) => s.objective)
  const phase = useGame((s) => s.lemPhase)
  const round = useGame((s) => s.lemRound)
  const bundle = useGame((s) => s.lemBundle)
  const hours = useGame((s) => s.lemHours)
  const price = useGame((s) => s.lemPrice)
  const quality = useGame((s) => s.lemQuality)
  const sign = useGame((s) => s.lemSign)
  const wageRate = useGame((s) => s.lemWageRate)
  const event = useGame((s) => s.lemEvent)
  const result = useGame((s) => s.lemResult)
  const weekComplete = useGame((s) => s.weekComplete)
  const openSupplies = useGame((s) => s.openSupplies)
  const openTemplate = useGame((s) => s.openTemplate)
  const [open, setOpen] = useState(false)

  // The coach only helps the player reach the next decision surface. Once the
  // supply shelf or planning board opens, that surface and the focus guide own
  // the screen so a second instruction button cannot stack on top.
  const activePhase = ['toMarket', 'toStand2'].includes(phase)
  useEffect(() => setOpen(false), [phase, round])
  if (week !== 2 || objective !== 'lemonade' || !activePhase || weekComplete) return null

  const signal = estimateDemandSignal(hours, event, sign)
  const totalCost = bundle
    ? bundle.cost + (quality?.addPerCup || 0) * bundle.cups + (sign?.cost || 0) + wageRate * hours
    : 0
  const costPerCup = bundle ? totalCost / Math.max(1, bundle.cups) : null

  const previousHint = !result
    ? 'Make one plan, then test it.'
    : result.keep < 0
      ? 'Last round lost money. Change one cost or sales choice.'
      : result.leftover >= 2
        ? 'You had leftovers. Try a smaller batch or lower price.'
        : result.missed >= 2
          ? 'You sold out. Try a larger batch or more hours.'
          : result.keep <= 2
            ? 'Profit was small. Raise price a little or lower one cost.'
            : 'You made a profit. Test one small change.'

  const supplyHint = !bundle
    ? signal.label === 'Low'
      ? 'Demand looks low. Compare the smaller batches.'
      : signal.label === 'High' || signal.label === 'Very high'
        ? 'Demand looks busy. Compare how many cups each batch serves.'
        : 'Demand looks normal. Pick a batch that fits your money.'
    : bundle.cups < signal.potential - 3
      ? 'The batch may be too small.'
      : bundle.cups > signal.potential + 3
        ? 'The batch may leave extras.'
        : 'The batch is close to expected demand.'

  const priceHint = !bundle
    ? 'Choose a batch first.'
    : price === null
      ? 'Set a price above cost per cup.'
      : price <= costPerCup + 0.05
        ? 'The price may leave little profit.'
        : signal.label === 'Low' && price >= 2
          ? 'Demand is low. A high price may reduce buyers.'
          : 'The price is above cost. Test it.'

  const phaseHint = phase === 'toMarket' ? supplyHint : priceHint

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-tayu-overlay-slot="guided-action"
        className={COMPACT_BUTTON}
        style={COMPACT_BUTTON_STYLE}
      >
        Lemonade hint · Round {round}
      </button>
    )
  }

  return (
    <aside className={`${MOBILE_SHEET} border-2 border-sun bg-white p-4 text-navy md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:max-h-[calc(100vh-7rem)] md:w-[min(94vw,24rem)]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">Round {round} · {signal.label} demand</div>
          <h2 className="mt-1 font-display text-base font-extrabold">{previousHint}</h2>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="min-h-[42px] shrink-0 rounded-xl bg-navy/10 px-3 text-xs font-extrabold text-navy">Hide</button>
      </div>

      <p className="mt-3 rounded-2xl bg-electric/10 px-3 py-3 text-sm font-extrabold leading-snug text-electric">{phaseHint}</p>

      {phase === 'toMarket' && (
        <button type="button" onClick={openSupplies} className="mt-3 min-h-[52px] w-full rounded-2xl bg-electric px-4 font-extrabold text-white active:scale-95">
          Open supply shelf
        </button>
      )}
      {phase === 'toStand2' && (
        <button type="button" onClick={openTemplate} className="mt-3 min-h-[52px] w-full rounded-2xl bg-electric px-4 font-extrabold text-white active:scale-95">
          Open planning board
        </button>
      )}
    </aside>
  )
}

export function GuidedCommerceOverlay() {
  return (
    <>
      <MarketClickShop />
      <LemonadeSupplyDemandCoach />
    </>
  )
}
