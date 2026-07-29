import { useGame } from './store.js'
import { STORE_ITEMS } from './config.js'
import { estimateDemandSignal } from '../scenarios/lemonade.js'

const fmt = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const MOBILE_SHEET = 'pointer-events-auto fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-[475] max-h-[min(74vh,42rem)] overflow-y-auto overscroll-contain rounded-3xl shadow-2xl'

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
    <aside className={`${MOBILE_SHEET} border-2 border-teal bg-navy/95 p-4 text-white sm:inset-x-auto sm:right-3 sm:w-[min(94vw,32rem)]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal">TAYU Market — click to buy</div>
          <h2 className="mt-1 font-display text-xl font-extrabold">Pick a healthy food and drink</h2>
          <p className="mt-1 text-xs font-semibold leading-snug text-white/75">Click a product once to put it in your basket.</p>
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

  const activePhase = ['toMarket', 'supplies', 'toStand2', 'template'].includes(phase)
  if (week !== 2 || objective !== 'lemonade' || !activePhase || weekComplete) return null

  const signal = estimateDemandSignal(hours, event, sign)
  const totalCost = bundle
    ? bundle.cost + (quality?.addPerCup || 0) * bundle.cups + (sign?.cost || 0) + wageRate * hours
    : 0
  const costPerCup = bundle ? totalCost / Math.max(1, bundle.cups) : null

  const previousHint = !result
    ? 'Use the demand clue, then make your own plan.'
    : result.keep < 0
      ? 'Last round lost money. Lower costs or improve sales.'
      : result.leftover >= 2
        ? 'You had leftovers. Try a smaller batch or a slightly lower price.'
        : result.missed >= 2
          ? 'You sold out early. Try a larger batch or stay open longer.'
          : result.keep <= 2
            ? 'Profit was small. Raise the price a little or lower a cost.'
            : 'Your last round made a profit. Test one small change at a time.'

  const supplyHint = !bundle
    ? signal.label === 'Low'
      ? 'Demand looks low. Compare the smaller batches.'
      : signal.label === 'High' || signal.label === 'Very high'
        ? 'Demand looks busy. Compare how many cups each batch can serve.'
        : 'Demand looks normal. Choose a batch that fits your budget.'
    : bundle.cups < signal.potential - 3
      ? 'Your batch may be too small for this demand.'
      : bundle.cups > signal.potential + 3
        ? 'Your batch may leave extras.'
        : 'Your batch looks close to the demand level.'

  const priceHint = !bundle
    ? 'Choose a batch before setting the rest of your plan.'
    : price === null
      ? 'Set a price above cost per cup, then test it.'
      : price <= costPerCup + 0.05
        ? 'Your price may leave little or no profit.'
        : signal.label === 'Low' && price >= 2
          ? 'Demand is low. Think about how price affects buyers.'
          : 'Your price is above cost. Sell and learn from the result.'

  return (
    <aside className={`${MOBILE_SHEET} border-2 border-sun bg-white p-4 text-navy md:inset-x-auto md:bottom-auto md:right-3 md:top-24 md:max-h-[calc(100vh-7rem)] md:w-[min(94vw,25rem)]`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">Lemonade helper · Round {round}</div>
          <h2 className="mt-1 font-display text-lg font-extrabold">{previousHint}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-sun/30 px-3 py-1 text-xs font-extrabold">{signal.label} demand</span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
        <div className="rounded-2xl bg-navy p-3 text-white">
          <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal">Batch clue</div>
          <p className="mt-1 text-sm font-bold leading-snug">{supplyHint}</p>
        </div>

        <div className="rounded-2xl bg-sun p-3 text-navy">
          <div className="text-[10px] font-extrabold uppercase tracking-wide">Price clue</div>
          <p className="mt-1 text-sm font-extrabold leading-snug">{priceHint}</p>
        </div>
      </div>

      <p className="mt-2 rounded-2xl bg-teal/10 px-3 py-2 text-xs font-bold leading-snug text-[#087a5e]">
        Change one or two choices, sell, and compare the result.
      </p>

      {phase === 'toMarket' && (
        <button type="button" onClick={openSupplies} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Open the supply shelf
        </button>
      )}

      {phase === 'supplies' && !bundle && (
        <div className="mt-3 rounded-2xl border-2 border-electric/25 px-4 py-3 text-center text-sm font-extrabold text-electric">
          Choose a batch, then test your plan.
        </div>
      )}

      {phase === 'toStand2' && (
        <button type="button" onClick={openTemplate} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Open the planning board
        </button>
      )}

      {phase === 'template' && bundle && (
        <div className="mt-3 rounded-2xl border-2 border-electric/25 px-4 py-3 text-center text-sm font-extrabold text-electric">
          Make your choices, then start selling.
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
