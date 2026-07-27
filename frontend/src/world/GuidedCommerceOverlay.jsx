import { useGame } from './store.js'
import { useFeedbackCoach } from './feedbackCoach.js'
import { STORE_ITEMS } from './config.js'
import {
  BUNDLES, QUALITY, SIGNS,
  estimateDemandSignal, findProfitablePlan,
} from '../scenarios/lemonade.js'

const fmt = (value) => Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
const money = (value) => `$${Number(value || 0).toFixed(2)}`

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

function PlanCheck({ label, current, target }) {
  const matches = current === target
  return (
    <div className={`rounded-xl px-2 py-1.5 text-xs font-extrabold ${matches ? 'bg-teal/20 text-[#087a5e]' : 'bg-sun/25 text-navy'}`}>
      <span aria-hidden>{matches ? '✓' : '→'}</span> {label}: {target}
    </div>
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
  const features = useGame((s) => s.lemFeatures)
  const save = useGame((s) => s.allocations.save)
  const weekComplete = useGame((s) => s.weekComplete)
  const openSupplies = useGame((s) => s.openSupplies)
  const chooseBundle = useGame((s) => s.chooseBundle)
  const openTemplate = useGame((s) => s.openTemplate)
  const setPrice = useGame((s) => s.setLemPrice)
  const setHours = useGame((s) => s.setLemHours)
  const setQuality = useGame((s) => s.setLemQuality)
  const setSign = useGame((s) => s.setLemSign)
  const setWage = useGame((s) => s.setLemWageRate)
  const feedback = useFeedbackCoach((s) => s.feedbackByModule.lemonade)

  const activePhase = ['toMarket', 'supplies', 'toStand2', 'template'].includes(phase)
  if (week !== 2 || objective !== 'lemonade' || !activePhase || weekComplete) return null

  // Before buying, optimize across every affordable batch. After a batch is
  // purchased, respect it and calculate the best profitable settings for it.
  const fullBudget = save + (bundle?.cost || 0)
  const plan = findProfitablePlan(
    features,
    event,
    fullBudget,
    bundle ? { bundleId: bundle.id } : {},
  )
  const signal = estimateDemandSignal(plan.hours, event, plan.sign)
  const supply = bundle?.cups ?? plan.bundle.cups
  const pressure = signal.potential > supply + 3
    ? `Demand may be higher than ${supply} cups. The guided price keeps demand manageable, but a larger batch may be needed before purchase.`
    : supply > signal.potential + 3
      ? `${supply} cups may exceed demand. The pinned plan reduces the risk of leftovers.`
      : `${supply} cups is close to the expected customer level.`

  const applyPlan = () => {
    setHours(plan.hours)
    setQuality(plan.quality.id)
    setSign(plan.sign.id)
    setWage(plan.wageRate)
    setPrice(plan.price)
  }

  const title = feedback?.title || 'First round: use this guided profitable plan'
  const diagnosis = feedback?.diagnosis
    || 'There is no previous round yet. Penny calculated a complete starter combination so you can learn the process without guessing.'
  const action = feedback?.action
    || `Start with price ${money(plan.price)}, ${plan.bundle.label}, ${plan.hours} hours, ${plan.quality.label}, and ${plan.sign.label}.`
  const goal = feedback?.goal
    || `Projected result: sell ${plan.sim.sold} cups and keep ${money(plan.sim.keep)} profit after tax.`

  const priceInstruction = price === null
    ? `Set the price to ${money(plan.price)}.`
    : price > plan.price + 0.01
      ? `Lower the price by ${money(price - plan.price)} to ${money(plan.price)}.`
      : price < plan.price - 0.01
        ? `Raise the price by ${money(plan.price - price)} to ${money(plan.price)}.`
        : `Price is correct at ${money(plan.price)}.`

  return (
    <aside className="pointer-events-auto fixed right-3 top-24 z-[475] max-h-[calc(100vh-7rem)] w-[min(94vw,28rem)] overflow-y-auto rounded-3xl border-2 border-sun bg-white p-4 text-navy shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-electric">Lemonade profit coach · Round {round}</div>
          <h2 className="mt-1 font-display text-lg font-extrabold">{title}</h2>
        </div>
        <span className="rounded-full bg-sun/30 px-3 py-1 text-xs font-extrabold">{signal.label} demand</span>
      </div>

      <div className="mt-3 rounded-2xl bg-navy p-3 text-white">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-teal">What happened last round</div>
        <p className="mt-1 text-sm font-bold leading-snug">{diagnosis}</p>
      </div>

      <div className="mt-2 rounded-2xl bg-sun p-3 text-navy">
        <div className="text-[10px] font-extrabold uppercase tracking-wide">Change this now — pinned</div>
        <p className="mt-1 text-sm font-extrabold leading-snug">{action}</p>
        <p className="mt-2 rounded-xl bg-white/55 px-3 py-2 text-sm font-extrabold">{priceInstruction}</p>
      </div>

      <div className="mt-2 rounded-2xl border-2 border-teal/40 bg-teal/10 p-3">
        <div className="text-[10px] font-extrabold uppercase tracking-wide text-[#087a5e]">Exact plan for this week's news</div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <PlanCheck label="Price" current={price === null ? 'Not set' : money(price)} target={money(plan.price)} />
          <PlanCheck label="Batch" current={bundle?.label || 'Not chosen'} target={plan.bundle.label} />
          <PlanCheck label="Hours" current={`${hours}`} target={`${plan.hours}`} />
          <PlanCheck label="Recipe" current={quality?.label} target={plan.quality.label} />
          <PlanCheck label="Promotion" current={sign?.label} target={plan.sign.label} />
          <PlanCheck label="Your pay" current={money(wageRate)} target={money(plan.wageRate)} />
        </div>
        <p className="mt-2 text-sm font-extrabold text-[#087a5e]">{goal}</p>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-electric/10 p-3">
          <div className="text-[10px] font-extrabold uppercase text-electric">Expected demand</div>
          <div className="mt-1 text-lg font-extrabold">About {signal.potential} passers-by</div>
        </div>
        <div className="rounded-2xl bg-navy/5 p-3">
          <div className="text-[10px] font-extrabold uppercase text-navy/60">Supply</div>
          <div className="mt-1 text-lg font-extrabold">{bundle ? `${bundle.cups} cups` : `${plan.bundle.cups} cups recommended`}</div>
        </div>
      </div>
      <p className="mt-2 rounded-2xl bg-sun/20 px-3 py-2 text-xs font-bold leading-snug">{pressure}</p>

      {phase === 'toMarket' && (
        <button type="button" onClick={openSupplies} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Step 1: Open the supply shelf
        </button>
      )}

      {phase === 'supplies' && !bundle && (
        <button
          type="button"
          disabled={save < plan.bundle.cost}
          onClick={() => chooseBundle(plan.bundle.id)}
          className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95 disabled:opacity-40"
        >
          Choose guided batch: {plan.bundle.label} · ${plan.bundle.cost}
        </button>
      )}

      {phase === 'toStand2' && (
        <button type="button" onClick={openTemplate} className="mt-3 min-h-[54px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Step 2: Open the planning board
        </button>
      )}

      {phase === 'template' && bundle && (
        <button type="button" onClick={applyPlan} className="mt-3 min-h-[58px] w-full rounded-2xl bg-electric px-4 text-base font-extrabold text-white active:scale-95">
          Apply the exact profitable settings
        </button>
      )}

      <p className="mt-2 text-center text-[11px] font-extrabold text-navy/55">
        This coach cannot be dismissed. It updates only after the next selling result.
      </p>
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
