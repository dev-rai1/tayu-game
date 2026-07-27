import { useMemo } from 'react'
import { useGame } from './store.js'
import { STORE_ITEMS } from './config.js'
import { estimateDemandSignal, recommendedStarterPrice } from '../scenarios/lemonade.js'

const fmt = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const roundMoney = (value) => Math.round(value * 100) / 100
const clampPrice = (value) => Math.max(0.25, Math.min(3, roundMoney(value)))

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

  if (
    week !== 1 || objective !== 'store' || !bramTalked || storeMissionDone || panelItem || dialog ||
    lessons.length > 0 || cards.length > 0 || scenarioLocked || weekComplete
  ) return null

  const basket = bought.map((id) => STORE_ITEMS.find((item) => item.id === id)).filter(Boolean)
  const hasFood = basket.some((item) => item.tags?.includes('food'))
  const hasDrink = basket.some((item) => item.tags?.includes('drink'))
  const ready = hasFood && hasDrink

  return (
    <aside className="pointer-events-auto fixed bottom-3 right-3 z-[470] max-h-[68vh] w-[min(94vw,32rem)] overflow-y-auto rounded-3xl border-2 border-teal bg-navy/95 p-4 text-white shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">TAYU Market — click to buy</div>
          <h2 className="mt-1 font-display text-xl font-extrabold">Pick a healthy food and drink</h2>
          <p className="mt-1 text-xs font-semibold leading-snug text-white/75">No extra E press is needed. Click a product once to put it in your basket.</p>
        </div>
        <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-center">
          <div className="text-[10px] font-extrabold text-white/60">SPEND LEFT</div>
          <div className="text-xl font-extrabold text-sun">${fmt(spend)}</div>
        </div>
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
              className={`min-h-[78px] rounded-2xl border-2 px-3 py-2 text-left transition active:scale-95 disabled:cursor-not-allowed ${
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
              <div className="text-[11px] font-bold text-white/65">{inBasket ? 'In basket' : affordable ? 'Click to buy' : 'Not enough money'}</div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-extrabold">
        <div className={`rounded-xl px-3 py-2 ${hasFood ? 'bg-teal text-navy' : 'bg-white/10 text-white/70'}`}>{hasFood ? 'Food ready' : 'Choose 1 food'}</div>
        <div className={`rounded-xl px-3 py-2 ${hasDrink ? 'bg-teal text-navy' : 'bg-white/10 text-white/70'}`}>{hasDrink ? 'Drink ready' : 'Choose 1 drink'}</div>
      </div>
      <button
        type="button"
        disabled={!ready}
        onClick={confirmCheckout}
        className="mt-3 min-h-[56px] w-full rounded-2xl bg-sun px-4 text-lg font-extrabold text-navy transition active:scale-95 disabled:bg-white/10 disabled:text-white/40"
      >
        {ready ? `Click to checkout (${bought.length} items)` : 'Checkout unlocks after food + drink'}
      </button>
    </aside>
  )
}

function LemonadeSupplyDemandCoach() {
  const week = useGame((s) => s.week)
  const objective = useGame((s) => s.objective)
  const phase = useGame((s) => s.lemPhase)
  const round = useGame((s) => s.lemRound)
  const tip = useGame((s) => s.lemTip)
  const bundle = useGame((s) => s.lemBundle)
  const hours = useGame((s) => s.lemHours)
  const price = useGame((s) => s.lemPrice)
  const quality = useGame((s) => s.lemQuality)
  const sign = useGame((s) => s.lemSign)
  const wageRate = useGame((s) => s.lemWageRate)
  const event = useGame((s) => s.lemEvent)
  const dialog = useGame((s) => s.dialog)
  const lessons = useGame((s) => s.lessons)
  const cards = useGame((s) => s.cards)
  const weekComplete = useGame((s) => s.weekComplete)
  const openSupplies = useGame((s) => s.openSupplies)
  const openTemplate = useGame((s) => s.openTemplate)
  const setPrice = useGame((s) => s.setLemPrice)

  const activePhase = ['toMarket', 'supplies', 'toStand2', 'template'].includes(phase)
  if (week !== 2 || objective !== 'lemonade' || !activePhase || dialog || lessons.length > 0 || cards.length > 0 || weekComplete) return null

  const signal = estimateDemandSignal(hours, event, sign)
  const suggested = bundle
    ? recommendedStarterPrice({ bundle, hours, quality, sign, wageRate, event })
    : null
  const supply = bundle?.cups ?? 0
  const pressure = !bundle
    ? 'Choose supplies after reading the demand signal.'
    : signal.potential > supply + 3
      ? `Demand may be higher than your ${supply}-cup supply. You could sell out.`
      : supply > signal.potential + 3
        ? `Your ${supply}-cup supply may be higher than demand. Leftovers are possible.`
        : `Your ${supply}-cup supply is close to the demand signal. Test the price next.`

  const priceMove = useMemo(() => {
    const lower = /price was too high|lower/i.test(tip || '')
    const raise = /charged too little|price was too low|raise/i.test(tip || '')
    return { lower, raise }
  }, [tip])

  return (
    <aside className="pointer-events-auto fixed right-3 top-24 z-[475] w-[min(94vw,25rem)] rounded-3xl border-2 border-sun bg-white p-4 text-navy shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">Lemonade Lab · Round {round}</div>
          <h2 className="mt-1 font-display text-lg font-extrabold">Supply + Demand Test</h2>
        </div>
        <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-extrabold">{signal.label} demand</span>
      </div>

      <div className="mt-3 rounded-2xl bg-navy p-3 text-white">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal">Penny's last feedback — stays here</div>
        <p className="mt-1 text-sm font-bold leading-snug">
          {tip || 'Start with a small test. Match supplies to expected customers, then set a price above your cost per cup.'}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-electric/10 p-3">
          <div className="text-[10px] font-extrabold uppercase text-electric">Demand signal</div>
          <div className="mt-1 text-lg font-extrabold">About {signal.potential} passers-by</div>
          <div className="text-xs font-semibold text-navy/65">Before price and recipe affect who buys.</div>
        </div>
        <div className="rounded-2xl bg-teal/15 p-3">
          <div className="text-[10px] font-extrabold uppercase text-[#087a5e]">Your supply</div>
          <div className="mt-1 text-lg font-extrabold">{bundle ? `${bundle.cups} cups` : 'Not chosen'}</div>
          <div className="text-xs font-semibold text-navy/65">{bundle ? bundle.label : 'Pick a batch at the market.'}</div>
        </div>
      </div>

      <p className="mt-2 rounded-2xl bg-sun/20 px-3 py-2 text-sm font-extrabold leading-snug">{pressure}</p>
      <p className="mt-2 text-xs font-bold leading-snug text-navy/65">Innovation rule: change one thing, run the stand, compare the result, then make the next change.</p>

      {phase === 'toMarket' && (
        <button type="button" onClick={openSupplies} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Click to open the supply shelf
        </button>
      )}

      {phase === 'toStand2' && (
        <button type="button" onClick={openTemplate} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Click to open the planning board
        </button>
      )}

      {phase === 'template' && bundle && (
        <div className="mt-3 rounded-2xl border-2 border-electric/20 p-3">
          <div className="text-xs font-extrabold uppercase tracking-wide text-electric">Price experiment</div>
          <div className="mt-1 text-sm font-bold">Current price: {price === null ? 'not set' : `$${price.toFixed(2)}`} · Starter suggestion: ${suggested.toFixed(2)}</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <button type="button" onClick={() => setPrice(clampPrice((price ?? suggested) - 0.25))}
              className={`min-h-[48px] rounded-xl px-2 text-xs font-extrabold active:scale-95 ${priceMove.lower ? 'bg-sun text-navy ring-2 ring-electric' : 'bg-navy/10 text-navy'}`}>
              Lower $0.25
            </button>
            <button type="button" onClick={() => setPrice(suggested)} className="min-h-[48px] rounded-xl bg-electric px-2 text-xs font-extrabold text-white active:scale-95">
              Try ${suggested.toFixed(2)}
            </button>
            <button type="button" onClick={() => setPrice(clampPrice((price ?? suggested) + 0.25))}
              className={`min-h-[48px] rounded-xl px-2 text-xs font-extrabold active:scale-95 ${priceMove.raise ? 'bg-sun text-navy ring-2 ring-electric' : 'bg-navy/10 text-navy'}`}>
              Raise $0.25
            </button>
          </div>
        </div>
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
